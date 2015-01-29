var W3CFormatter, qs, tz,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

tz = require("timezone");

qs = require("querystring");

module.exports = W3CFormatter = (function(_super) {
  __extends(W3CFormatter, _super);

  function W3CFormatter() {
    W3CFormatter.__super__.constructor.call(this, {
      objectMode: true
    });
    this.push("#Software: StreamMachine w3c Exporter\n");
    this.push("#Version: 0.1.0\n");
    this.push("#Fields: c-ip date time cs-uri-stem c-status cs(User-Agent) sc-bytes x-duration\n");
  }

  W3CFormatter.prototype._transform = function(session, encoding, cb) {
    var fields;
    fields = [session.client.ip, tz(session.time, "%Y-%m-%d"), tz(session.time, "%H:%M:%S"), "/" + session.stream, 200, escape(session.client.ua), session.kbytes * 1024, Math.round(session.duration)];
    this.push(fields.join(" ") + "\n");
    return cb();
  };

  W3CFormatter.prototype._flush = function(cb) {
    return cb();
  };

  return W3CFormatter;

})(require("stream").Transform);

//# sourceMappingURL=w3c_formatter.js.map
