tz = require "timezone"
qs = require "querystring"

module.exports = class UserAgentFormatter extends require("stream").Transform
    constructor: (@min_dur,@max_dur)->
        super objectMode:true

        @agents = {}
        @counts = {}

    _transform: (session,encoding,cb) ->
        # parse
        #agent = useragent.lookup(session.client.ua)

        # hash

        # store

        @agents[ session.client.ua ] ||= 0
        @agents[ session.client.ua ] += session.duration

        cb()

    _flush: (cb) ->
        for ua,duration of @agents
            @push """
            "#{ua}",#{duration}

            """

        cb()