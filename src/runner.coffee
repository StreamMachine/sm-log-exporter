debug   = require("debug")("sm-w3c-exporter")
ES      = require "elasticsearch"
tz      = require "timezone"

SessionPuller = require "./session_puller"
W3CFormatter = require "./w3c_formatter"

argv = require("yargs")
    .demand(["server","start","end","index"])
    .describe
        server:         "Elasticsearch Server"
        start:          "Start Date"
        end:            "End Date"
        zone:           "Timezone for dates"
        min_duration:   "Minimum duration for session"
        max_duration:   "Maximum duration for session"
        index:          "Index Prefix"
    .default
        zone:           "UTC"
        min_duration:   60
        max_duration:   86400
    .argv

if argv.zone != "UTC"
    zone = tz(require("timezone/#{argv.zone}"))
else
    zone = tz

es = new ES.Client host:argv.server

start_date  = zone(argv.start,argv.zone)
end_date    = zone(argv.end,argv.zone)

console.error "Stats: #{ start_date } - #{ end_date }"

# -- Start pulling logs -- #

puller      = new SessionPuller es, argv.index, start_date, end_date
formatter   = new W3CFormatter

puller.stream.pipe(formatter).pipe(process.stdout)

formatter.on "end", =>
    console.error "all done"
    process.exit()


