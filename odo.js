// Generated by CoffeeScript 1.8.0
var VText, Widget, component, createElement, diff, mainLoop, patch, stringify, widget;

mainLoop = require('main-loop');

createElement = require('virtual-dom/create-element');

diff = require('virtual-dom/diff');

patch = require('virtual-dom/patch');

stringify = require('virtual-dom-stringify');

VText = require('virtual-dom/vnode/vtext');

require('setimmediate');

component = function(spec) {
  var Component;
  Component = spec.render;
  Component.render = function(dom, state) {
    var render, scene;
    render = function(state) {
      return Component(state);
    };
    scene = mainLoop(state, (function(state) {
      return render(state);
    }), {
      create: createElement,
      diff: diff,
      patch: patch
    });
    dom.appendChild(scene.target);
    return {
      update: function(state) {
        return setImmediate(function() {
          return scene.update(state);
        });
      },
      remove: function() {
        render = function() {
          return new VText('');
        };
        return scene.update({});
      }
    };
  };
  Component.renderString = function(state) {
    return stringify(spec.render(state));
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
    this.el = this.spec.render(this.state);
    dom = createElement(this.el);
    if (dom !== null) {
      this.el = dom;
    }
    setImmediate((function(_this) {
      return function() {
        if (_this.spec.afterMount != null) {
          return _this.spec.afterMount(_this.el, _this.state);
        }
      };
    })(this));
    return this.el;
  };

  Widget.prototype.update = function(prev, el) {
    if (this.spec.update != null) {
      return this.spec.update(el, this.state, prev);
    }
  };

  Widget.prototype.destroy = function(el) {
    if (this.spec.beforeUnmount != null) {
      return this.spec.beforeUnmount(el, this.state);
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
  h: require('virtual-dom/h'),
  svg: require('virtual-dom/virtual-hyperscript/svg')
};
