const extend = require('extend')

const component = (spec) => {
  spec = extend({}, spec)
  const Component = (state, params, hub) =>
    spec.render.call(spec, state, params, hub)
  Component.use = (plugin) => plugin(Component, spec)
  for (let plugin of component.plugins)
    Component.use(plugin)
  return Component
}
component.plugins = []
component.use = (plugin) =>
  component.plugins.push(plugin)

module.exports = component
