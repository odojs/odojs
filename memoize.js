module.exports = function(cache) {
  if (cache == null) {
    cache = function() {
      var _data;
      _data = {};
      return {
        get: function(key) {
          return _data[key];
        },
        set: function(key, value) {
          return _data[key] = value;
        }
      };
    };
  }
  return function(fn) {
    var _cache;
    _cache = cache();
    return function(state, params, hub) {
      var entry, key, slavehub;
      key = JSON.stringify([state, params]);
      entry = _cache.get(key);
      if (entry != null) {
        entry.hub = hub;
        return entry.vdom;
      }
      slavehub = {
        emit: function(m, p, cb) {
          return entry.hub.emit(m, p, cb);
        }
      };
      entry = {
        hub: hub,
        vdom: fn.call(this, state, params, slavehub)
      };
      _cache.set(key, entry);
      return entry.vdom;
    };
  };
};
