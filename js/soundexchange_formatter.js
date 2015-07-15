var W3CFormatter, tz,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

tz = require("timezone");

module.exports = W3CFormatter = (function(_super) {
  __extends(W3CFormatter, _super);

  function W3CFormatter(min_dur, max_dur) {
    this.min_dur = min_dur;
    this.max_dur = max_dur;
    W3CFormatter.__super__.constructor.call(this, {
      objectMode: true
    });
  }

  W3CFormatter.prototype._transform = function(session, encoding, cb) {
    var fields;
    if (this.min_dur && session.duration < this.min_dur) {
      return cb();
    }
    if (this.max_dur && session.duration > this.max_dur) {
      session.duration = this.max_dur;
    }
    fields = [session.client.ip, tz(session.start_time, "%Y-%m-%d"), tz(session.start_time, "%H:%M:%S"), session.stream, Math.round(session.duration), 200, session.client.ua];
    this.push(fields.join("\t") + "\n");
    return cb();
  };

  W3CFormatter.prototype._flush = function(cb) {
    return cb();
  };

  return W3CFormatter;

})(require("stream").Transform);

//# sourceMappingURL=soundexchange_formatter.js.map
