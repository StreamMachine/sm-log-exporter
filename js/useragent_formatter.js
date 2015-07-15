var UserAgentFormatter, qs, tz,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

tz = require("timezone");

qs = require("querystring");

module.exports = UserAgentFormatter = (function(_super) {
  __extends(UserAgentFormatter, _super);

  function UserAgentFormatter(min_dur, max_dur) {
    this.min_dur = min_dur;
    this.max_dur = max_dur;
    UserAgentFormatter.__super__.constructor.call(this, {
      objectMode: true
    });
    this.agents = {};
    this.counts = {};
  }

  UserAgentFormatter.prototype._transform = function(session, encoding, cb) {
    var _base, _name;
    (_base = this.agents)[_name = session.client.ua] || (_base[_name] = 0);
    this.agents[session.client.ua] += session.duration;
    return cb();
  };

  UserAgentFormatter.prototype._flush = function(cb) {
    var duration, ua, _ref;
    _ref = this.agents;
    for (ua in _ref) {
      duration = _ref[ua];
      this.push("\"" + ua + "\"," + duration + "\n");
    }
    return cb();
  };

  return UserAgentFormatter;

})(require("stream").Transform);

//# sourceMappingURL=useragent_formatter.js.map
