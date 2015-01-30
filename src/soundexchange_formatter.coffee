tz = require "timezone"

module.exports = class W3CFormatter extends require("stream").Transform
    constructor: (@min_dur,@max_dur)->
        super objectMode:true

    _transform: (session,encoding,cb) ->
        if @min_dur && session.duration < @min_dur
            return cb()

        if @max_dur && session.duration > @max_dur
            session.duration = @max_dur

        fields = [
            session.client.ip,
            tz(session.start_time,"%Y-%m-%d"),
            tz(session.start_time,"%H:%M:%S"),
            session.stream,
            Math.round(session.duration),
            200,
            session.client.ua
        ]

        @push fields.join("\t") + "\n"
        cb()

    _flush: (cb) ->
        cb()