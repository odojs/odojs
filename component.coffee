extend = require 'extend'

component = (spec) ->
  spec = extend {}, spec
  Component = (state, params) ->
    spec.render.call spec, state, params
  Component.use = (plugin) -> plugin Component, spec
  for plugin in component.plugins
    Component.use plugin
  Component
component.plugins = []
component.use = (plugin) -> component.plugins.push plugin

module.exports = component