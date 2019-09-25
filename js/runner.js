var FORMATTERS, SessionPuller, SoundExFormatter, UserAgentFormatter, W3CFormatter, argv, debug, elasticsearch, end_date, es, format, formatter, puller, start_date, tz, zone;

debug = require("debug")("sm-log-exporter");

elasticsearch = require("@elastic/elasticsearch");

tz = require("timezone");

SessionPuller = require("./session_puller");

W3CFormatter = require("./w3c_formatter");

SoundExFormatter = require("./soundexchange_formatter");

UserAgentFormatter = require("./useragent_formatter");

FORMATTERS = {
  w3c: W3CFormatter,
  soundexchange: SoundExFormatter,
  ua: UserAgentFormatter
};

argv = require("yargs").options({
  server: {
    describe: "Elasticsearch Server",
    demand: true,
    requiresArg: true
  },
  start: {
    describe: "Start Date",
    demand: true,
    requiresArg: true
  },
  end: {
    describe: "End Date",
    demand: true,
    requiresArg: true
  },
  zone: {
    describe: "Timezone for dates",
    "default": "UTC"
  },
  min_duration: {
    describe: "Minimum seconds for session",
    "default": null
  },
  max_duration: {
    describe: "Maximum seconds for session",
    "default": null
  },
  index: {
    describe: "ES Index Prefix",
    "default": "streammachine"
  },
  format: {
    describe: "Output format (w3c or soundexchange)",
    "default": "w3c"
  }
}).argv;

if (argv.zone !== "UTC") {
  zone = tz(require("timezone/" + argv.zone));
} else {
  zone = tz;
}

formatter = FORMATTERS[argv.format];

if (!formatter) {
  console.error("Invalid format. Options: " + (Object.keys(FORMATTERS).join(", ")) + "\n");
  process.exit(1);
}

es = new elasticsearch.Client({
  node: argv.server,
  apiVersion: '1.7'
});

start_date = zone(argv.start, argv.zone);

end_date = zone(argv.end, argv.zone);

console.error("Stats: " + start_date + " - " + end_date);

puller = new SessionPuller(es, argv.index, start_date, end_date);

format = new formatter(argv.min_duration, argv.max_duration);

puller.stream.pipe(format).pipe(process.stdout);

format.on("end", (function(_this) {
  return function() {
    console.error("all done");
    return process.exit();
  };
})(this));

//# sourceMappingURL=runner.js.map
