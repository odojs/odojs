var compose;

compose = require('./compose');

module.exports = function(component, spec) {
  return component.mount = function(el, state, params, hub, options) {
    var scene;
    scene = compose(component, state, params, hub, el, options);
    scene.mount();
    return {
      update: function(state, params, hub) {
        return scene.update(state, params, hub);
      },
      apply: function(state, params, hub) {
        return scene.apply(state, params, hub);
      },
      unmount: function() {
        return scene.unmount();
      }
    };
  };
};
