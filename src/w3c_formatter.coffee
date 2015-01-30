tz = require "timezone"
qs = require "querystring"

module.exports = class W3CFormatter extends require("stream").Transform
    constructor: (@min_dur,@max_dur)->
        super objectMode:true

        # go ahead and write our header
        @push "#Software: StreamMachine w3c Exporter\n"
        @push "#Version: 0.1.0\n"
        @push "#Fields: c-ip date time cs-uri-stem c-status cs(User-Agent) sc-bytes x-duration\n"

    _transform: (session,encoding,cb) ->
        if @min_dur && session.duration < @min_dur
            return cb()

        # NOTE: Since w3c log format logs the session end time and duration,
        # truncating duration like this will cause the truncated duration to
        # appear at the end of the listening time instead of at the beginning
        if @max_dur && session.duration > @max_dur
            session.duration = @max_dur

        fields = [
            session.client.ip,
            tz(session.time,"%Y-%m-%d"),
            tz(session.time,"%H:%M:%S")
            "/#{ session.stream }",
            200,
            escape(session.client.ua),
            session.kbytes * 1024,
            Math.round(session.duration)
        ]

        @push fields.join(" ") + "\n"
        cb()

    _flush: (cb) ->
        cb()