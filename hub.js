var async, hub, template;

async = require('odo-async');

template = require('odo-template');

hub = function(defaultbindings) {
  var all, cb, events, every, listeners, none, once, result;
  listeners = {};
  all = [];
  none = [];
  every = function(e, cb) {
    if (listeners[e] == null) {
      listeners[e] = [];
    }
    listeners[e].push(cb);
    return {
      off: function() {
        var index;
        index = listeners[e].indexOf(cb);
        if (index !== -1) {
          return listeners[e].splice(index, 1);
        }
      }
    };
  };
  once = function(e, cb) {
    var binding;
    binding = every(e, function(payload, callback) {
      binding.off();
      return cb(payload, callback);
    });
    return {
      off: function() {
        return binding.off();
      }
    };
  };
  if (defaultbindings != null) {
    for (events in defaultbindings) {
      cb = defaultbindings[events];
      every(events, cb);
    }
  }
  result = {};
  result.new = function(defaultbindings) {
    return hub(defaultbindings);
  };
  result.child = function(defaultbindings) {
    var res;
    res = hub();
    res.none(function(e, description, m, cb) {
      return result.emit(e, m, cb);
    });
    if (defaultbindings != null) {
      for (events in defaultbindings) {
        cb = defaultbindings[events];
        res.every(events, cb);
      }
    }
    return res;
  };
  // Subscribe to an event
  result.every = function(events, cb) {
    var bindings, e, i, len;
    if (!(events instanceof Array)) {
      events = [events];
    }
    bindings = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = events.length; i < len; i++) {
        e = events[i];
        results.push({
          event: e
        });
      }
      return results;
    })();
    for (i = 0, len = bindings.length; i < len; i++) {
      e = bindings[i];
      e.binding = every(e.event, cb);
    }
    return {
      off: function() {
        var j, len1, results;
        results = [];
        for (j = 0, len1 = bindings.length; j < len1; j++) {
          e = bindings[j];
          results.push(e.binding.off());
        }
        return results;
      }
    };
  };
  result.once = function(events, cb) {
    var bindings, count, e, i, len;
    if (!(events instanceof Array)) {
      events = [events];
    }
    count = 0;
    bindings = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = events.length; i < len; i++) {
        e = events[i];
        count++;
        results.push({
          event: e,
          complete: false
        });
      }
      return results;
    })();
    for (i = 0, len = bindings.length; i < len; i++) {
      e = bindings[i];
      e.binding = once(e.event, function(m, callback) {
        count--;
        e.complete = true;
        if (count === 0) {
          return cb(m, callback);
        } else {
          return callback();
        }
      });
    }
    return {
      off: function() {
        var j, len1, results;
        results = [];
        for (j = 0, len1 = bindings.length; j < len1; j++) {
          e = bindings[j];
          results.push(e.binding.off());
        }
        return results;
      }
    };
  };
  result.any = function(events, cb) {
    var bindings, e, i, len, unbind;
    bindings = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = events.length; i < len; i++) {
        e = events[i];
        results.push({
          event: e
        });
      }
      return results;
    })();
    unbind = function() {
      var i, len, results;
      results = [];
      for (i = 0, len = bindings.length; i < len; i++) {
        e = bindings[i];
        results.push(e.binding.off());
      }
      return results;
    };
    for (i = 0, len = bindings.length; i < len; i++) {
      e = bindings[i];
      e.binding = once(e.event, function() {
        unbind();
        return cb();
      });
    }
    return {
      off: unbind
    };
  };
  result.all = function(cb) {
    all.push(cb);
    return {
      off: function() {
        var index;
        index = all.indexOf(cb);
        if (index !== -1) {
          return all.splice(index, 1);
        }
      }
    };
  };
  result.none = function(cb) {
    none.push(cb);
    return {
      off: function() {
        var index;
        index = none.indexOf(cb);
        if (index !== -1) {
          return none.splice(index, 1);
        }
      }
    };
  };
  // Publish an event
  result.emit = function(e, m, ecb) {
    var description, fn, fn1, fn2, i, j, k, len, len1, len2, listener, ref, tasks;
    description = `${template(e, m)}`;
    tasks = [];
    fn = function(listener) {
      return tasks.push(function(cb) {
        return async.delay(function() {
          return listener(e, description, m, cb);
        });
      });
    };
    for (i = 0, len = all.length; i < len; i++) {
      listener = all[i];
      fn(listener);
    }
    if (listeners[e] != null) {
      ref = listeners[e].slice();
      fn1 = function(listener) {
        return tasks.push(function(cb) {
          return async.delay(function() {
            return listener(m, cb);
          });
        });
      };
      for (j = 0, len1 = ref.length; j < len1; j++) {
        listener = ref[j];
        fn1(listener);
      }
    } else {
      fn2 = function(listener) {
        return tasks.push(function(cb) {
          return async.delay(function() {
            return listener(e, description, m, cb);
          });
        });
      };
      for (k = 0, len2 = none.length; k < len2; k++) {
        listener = none[k];
        fn2(listener);
      }
    }
    return async.parallel(tasks, function() {
      if (ecb != null) {
        return ecb();
      }
    });
  };
  return result;
};

module.exports = hub;
