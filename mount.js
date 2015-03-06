// Generated by CoffeeScript 1.8.0
var main;

main = require('./main');

require('setimmediate');

module.exports = function(component, spec) {
  return component.mount = function(el, state) {
    var scene, _render;
    _render = function(state) {
      return component(state);
    };
    scene = main((function(state) {
      return _render(state);
    }), state);
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
};
