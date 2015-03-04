// Generated by CoffeeScript 1.8.0
var VText, Widget, component, create, diff, main, patch, stringify, widget;

create = require('virtual-dom/create-element');

diff = require('virtual-dom/diff');

patch = require('virtual-dom/patch');

VText = require('virtual-dom/vnode/vtext');

main = require('main-loop');

stringify = require('virtual-dom-stringify');

require('setimmediate');

component = function(spec) {
  var Component;
  Component = function(state) {
    return spec.render.call(Component, state);
  };
  Component.use = function(plugin) {
    var k, v, _results;
    if (typeof plugin === 'function') {
      return plugin(Component);
    }
    _results = [];
    for (k in plugin) {
      v = plugin[k];
      _results.push(Component[k] = v);
    }
    return _results;
  };
  Component.mount = function(el, state) {
    var scene, _render;
    _render = function(state) {
      return Component(state);
    };
    scene = main(state, (function(state) {
      return _render(state);
    }), {
      create: create,
      diff: diff,
      patch: patch
    });
    el.appendChild(scene.target);
    return {
      update: function(state) {
        return setImmediate(function() {
          return scene.update(state);
        });
      },
      unmount: function() {
        _render = function() {
          return new VText('');
        };
        return scene.update({});
      }
    };
  };
  Component.renderString = function(state) {
    return stringify(spec.render.call(Component, state));
  };
  return Component;
};

Widget = (function() {
  function Widget(spec, state) {
    this.spec = spec;
    this.state = state;
  }

  Widget.prototype.type = 'Widget';

  Widget.prototype.init = function() {
    var dom;
    this.el = this.spec.render.call(this, this.state);
    dom = create(this.el);
    if (dom !== null) {
      this.el = dom;
    }
    setImmediate((function(_this) {
      return function() {
        if (_this.spec.afterMount != null) {
          return _this.spec.afterMount.call(_this, _this.el, _this.state);
        }
      };
    })(this));
    return this.el;
  };

  Widget.prototype.update = function(prev, el) {
    var dom, k, result, v;
    for (k in prev) {
      v = prev[k];
      if (this[k] == null) {
        this[k] = v;
      }
    }
    result = el;
    if (this.spec.update != null) {
      result = this.spec.update.call(this, el, this.state, prev);
      if (result !== null) {
        dom = create(result);
        if (dom !== null) {
          result = dom;
        }
      }
    }
    if (this.spec.onUpdate != null) {
      this.spec.onUpdate.call(this, result, this.state, prev);
    }
    return result;
  };

  Widget.prototype.destroy = function(el) {
    if (this.spec.beforeUnmount != null) {
      return this.spec.beforeUnmount.call(this, el, this.state);
    }
  };

  return Widget;

})();

widget = function(spec) {
  return function(state) {
    return new Widget(spec, state);
  };
};

module.exports = {
  component: component,
  widget: widget,
  dom: require('virtual-dom/h'),
  svg: require('virtual-dom/virtual-hyperscript/svg'),
  partial: require('vdom-thunk')
};
