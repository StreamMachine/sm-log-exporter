tz = require "timezone"
qs = require "querystring"

module.exports = class W3CFormatter extends require("stream").Transform
    constructor: ()->
        super objectMode:true

        # go ahead and write our header
        @push "#Software: StreamMachine w3c Exporter\n"
        @push "#Version: 0.1.0\n"
        @push "#Fields: c-ip date time cs-uri-stem c-status cs(User-Agent) sc-bytes x-duration\n"

    _transform: (session,encoding,cb) ->
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