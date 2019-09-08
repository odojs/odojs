var stringify;

stringify = require('vdom-to-html');

module.exports = function(component, spec) {
  return component.stringify = function(state, params, hub) {
    return stringify(spec.render.call(spec, state, params, hub));
  };
};
