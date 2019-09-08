var Widget, create, extend, widget;

create = require('virtual-dom/create-element');

extend = require('extend');

require('setimmediate');

Widget = (function() {
  class Widget {
    constructor(spec1, state1, params1, hub1) {
      this.spec = spec1;
      this.state = state1;
      this.params = params1;
      this.hub = hub1;
      this.el = this.spec.render.call(this, this.state, this.params, this.hub);
    }

    render() {
      return this.el;
    }

    init() {
      var dom;
      dom = create(this.el);
      if (dom !== null) {
        this.el = dom;
      }
      setImmediate(() => {
        if (this.spec.afterMount != null) {
          return this.spec.afterMount.call(this, this.el, this.state, this.params, this.hub);
        }
      });
      return this.el;
    }

    update(prev, el) {
      var dom, k, result, v;
      // copy state
      for (k in prev) {
        v = prev[k];
        if (this[k] === void 0) {
          this[k] = v;
        }
      }
      result = el;
      if (this.spec.update != null) {
        result = this.spec.update.call(this, el, this.state, this.params, this.hub, prev);
        if (result !== null) {
          dom = create(result);
          if (dom !== null) {
            result = dom;
          }
        }
      }
      if (this.spec.onUpdate != null) {
        this.spec.onUpdate.call(this, result, this.state, this.params, this.hub, prev);
      }
      return result;
    }

    destroy(el) {
      if (this.spec.beforeUnmount != null) {
        return this.spec.beforeUnmount.call(this, el, this.state, this.params, this.hub);
      }
    }

  };

  Widget.prototype.type = 'Widget';

  return Widget;

})();

widget = function(spec) {
  var Component, i, len, plugin, ref;
  spec = extend({}, spec);
  Component = function(state, params, hub) {
    return new Widget(spec, state, params, hub);
  };
  Component.use = function(plugin) {
    return plugin(Component, spec);
  };
  ref = widget.plugins;
  for (i = 0, len = ref.length; i < len; i++) {
    plugin = ref[i];
    Component.use(plugin);
  }
  return Component;
};

widget.plugins = [];

widget.use = function(plugin) {
  return widget.plugins.push(plugin);
};

widget.Widget = Widget;

module.exports = widget;
