debug   = require("debug")("sm-log-exporter")
tz      = require('timezone')
moment  = require('moment')

module.exports = class SessionPuller
    constructor: (@es,@index_prefix,@start,@end) ->
        start = moment(@start).format('YYYY-MM-DDTHH:mm:ss.000Z');
        end = moment(@end).format('YYYY-MM-DDTHH:mm:ss.000Z');

        # -- Build our query body -- #
        @_body =
            query:
                bool:
                    filter: [
                      range:
                        duration:
                            gte: 60,
                      range:
                        time:
                            gte: start
                            lt: end

                    ]
            sort: [ time: 'asc']
            size: 1000
            from: 0

        # -- get all indices we'll be doing -- #
        @_idx = @_indices @index_prefix, @start, @end
        @_currentIndex = null

        @stream = new (require("stream").PassThrough) objectMode:true

        @_runSearch()

    #----------

    _runSearch: ->
        idx = @_idx.shift()

        if idx
            debug "starting search for #{ idx }", JSON.stringify(@_body)
            @_search = new SessionPuller.Search @es, idx, @_body

            @_search.pipe @stream, end:false

            @_search.once "end", =>
                debug "Got end from search for #{ idx }"
                @_search = null
                @_runSearch()
        else
            console.error "At puller stream end"
            @stream.end()

    #----------

    _indices: (prefix,start,end) ->
        idxs = []

        ts = start

        loop
            idxs.push "#{prefix}-sessions-#{tz(ts,"%Y-%m-%d")}"
            ts = tz(ts,"+1 day")
            break if ts > end

        idxs

    #----------

    class @Search extends require('stream').Readable
        constructor: (@es,@idx,@body) ->
            super objectMode:true

            @_scrollId  = null
            @_total     = null
            @_remaining = null

            @__finished = false

            @_fetching      = false
            @_keepFetching  = true

            @_fetch()

        _fetch: ->
            if @_fetching
                return false

            @_fetching = true

            if @_scrollId
                @es.scroll scroll:"10s", body:@_scrollId, (err,resp) =>
                    results = resp.body
                    if err
                        debug "Scroll failed: #{err}"
                        throw err

                    if results.hits.hits.length == 0
                        return @_finished()

                    @_remaining -= results.hits.hits.length
                    @_scrollId  = results._scroll_id

                    for r in results.hits.hits
                        @_keepFetching = false if !@push r._source

                    if @_remaining <= 0
                        @_finished()
                    else
                        @_fetching = false
                        @_fetch() if @_keepFetching

            else
                @es.search index:@idx, body:@body, scroll:"10s", (err,resp) =>
                    if err
                        if err.body.status == 404
                            @_finished()
                            return false
                        else
                            console.error err.body.error.root_cause
                    results = resp.body
                    @_total     = results.hits.total.value
                    @_remaining = results.hits.total.value - results.hits.hits.length
                    @_scrollId  = results._scroll_id

                    debug "First read. Total is #{ @_total }.", @_scrollId

                    for r in results.hits.hits
                        @_keepFetching = false if !@push r._source

                    if @_remaining <= 0
                        @_finished()
                    else
                        @_fetching = false
                        @_fetch() if @_keepFetching


        _read: ->
            @_fetch()

        _finished: ->
            if !@__finished
                @push null
                @__finished = true