var SessionPuller, debug, tz,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

debug = require("debug")("sm-w3c-exporter");

tz = require('timezone');

module.exports = SessionPuller = (function() {
  function SessionPuller(es, index_prefix, start, end) {
    this.es = es;
    this.index_prefix = index_prefix;
    this.start = start;
    this.end = end;
    this._body = {
      query: {
        filtered: {
          query: {
            match_all: {}
          },
          filter: {
            and: [
              {
                range: {
                  duration: {
                    gte: 60
                  }
                }
              }, {
                range: {
                  time: {
                    gte: this.start,
                    lt: this.end
                  }
                }
              }
            ]
          }
        }
      },
      sort: [
        {
          time: "asc"
        }
      ],
      size: 1000,
      from: 0
    };
    this._idx = this._indices(this.index_prefix, this.start, this.end);
    this._currentIndex = null;
    this.stream = new (require("stream").PassThrough)({
      objectMode: true
    });
    this._runSearch();
  }

  SessionPuller.prototype._runSearch = function() {
    var idx;
    idx = this._idx.shift();
    if (idx) {
      debug("starting search for " + idx, JSON.stringify(this._body));
      this._search = new SessionPuller.Search(this.es, idx, this._body);
      this._search.pipe(this.stream, {
        end: false
      });
      return this._search.once("end", (function(_this) {
        return function() {
          debug("Got end from search for " + idx);
          _this._search = null;
          return _this._runSearch();
        };
      })(this));
    } else {
      console.error("At puller stream end");
      return this.stream.end();
    }
  };

  SessionPuller.prototype._indices = function(prefix, start, end) {
    var idxs, ts;
    idxs = [];
    ts = start;
    while (true) {
      idxs.push("" + prefix + "-sessions-" + (tz(ts, "%Y-%m-%d")));
      ts = tz(ts, "+1 day");
      if (ts > end) {
        break;
      }
    }
    return idxs;
  };

  SessionPuller.Search = (function(_super) {
    __extends(Search, _super);

    function Search(es, idx, body) {
      this.es = es;
      this.idx = idx;
      this.body = body;
      Search.__super__.constructor.call(this, {
        objectMode: true
      });
      this._scrollId = null;
      this._total = null;
      this._remaining = null;
      this.__finished = false;
      this._fetching = false;
      this._keepFetching = true;
      this._fetch();
    }

    Search.prototype._fetch = function() {
      if (this._fetching) {
        return false;
      }
      this._fetching = true;
      if (this._scrollId) {
        return this.es.scroll({
          scroll: "10s",
          body: this._scrollId
        }, (function(_this) {
          return function(err, results) {
            var r, _i, _len, _ref;
            if (err) {
              throw err;
            }
            if (results.hits.hits.length === 0) {
              return _this._finished();
            }
            _this._remaining -= results.hits.hits.length;
            _this._scrollId = results._scroll_id;
            _ref = results.hits.hits;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              r = _ref[_i];
              if (!_this.push(r._source)) {
                _this._keepFetching = false;
              }
            }
            if (_this._remaining <= 0) {
              return _this._finished();
            } else {
              _this._fetching = false;
              if (_this._keepFetching) {
                return _this._fetch();
              }
            }
          };
        })(this));
      } else {
        debug("Starting search on " + this.idx);
        return this.es.search({
          index: this.idx,
          body: this.body,
          type: "session",
          scroll: "10s"
        }, (function(_this) {
          return function(err, results) {
            var r, _i, _j, _len, _len1, _ref, _ref1;
            if (err) {
              throw err;
            }
            _this._total = results.hits.total;
            _this._remaining = results.hits.total - results.hits.hits.length;
            _this._scrollId = results._scroll_id;
            debug("First read. Total is " + _this._total + ".");
            _ref = results.hits.hits;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              r = _ref[_i];
              if (!_this.push(r._source)) {
                _this._keepFetching = false;
              }
            }
            _ref1 = results.hits.hits;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              r = _ref1[_j];
              _this.push(r._source);
            }
            if (_this._remaining <= 0) {
              return _this._finished();
            } else {
              _this._fetching = false;
              if (_this._keepFetching) {
                return _this._fetch();
              }
            }
          };
        })(this));
      }
    };

    Search.prototype._read = function() {
      return this._fetch();
    };

    Search.prototype._finished = function() {
      if (!this.__finished) {
        this.push(null);
        return this.__finished = true;
      }
    };

    return Search;

  })(require('stream').Readable);

  return SessionPuller;

})();

//# sourceMappingURL=session_puller.js.map
