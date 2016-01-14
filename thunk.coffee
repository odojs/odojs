class Thunk
  constructor: (@render, @state, @params, @hub) ->
  type: 'Thunk'
  render: (previous) -> @render.call @, previous, @state, @params, @hub

thunk = (render) ->
  Component = (state, params, hub) ->
    new Thunk render, state, params, hub
  Component.use = (plugin) -> plugin Component, render
  for plugin in thunk.plugins
    Component.use plugin
  Component
thunk.plugins = []
thunk.use = (plugin) -> thunk.plugins.push plugin
thunk.Thunk = Thunk

module.exports = thunk