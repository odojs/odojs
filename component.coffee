create = require 'virtual-dom/create-element'
diff = require 'virtual-dom/diff'
patch = require 'virtual-dom/patch'
VText = require 'virtual-dom/vnode/vtext'
main = require 'main-loop'
extend = require 'extend'
require 'setimmediate'

component = (spec) ->
  spec = extend {}, spec
  Component = (state) ->
    spec.render.call spec, state
  Component.use = (plugin) -> plugin Component, spec
  Component.mount = (el, state) ->
    _render = (state) -> Component state
    scene = main state, ((state) -> _render state),
      create: create, diff: diff, patch: patch
    el.appendChild scene.target
    update: (state) ->
      setImmediate -> scene.update state
    unmount: ->
      # patch against nothing for unmount
      _render = -> new VText ''
      scene.update {}
  for plugin in component.plugins
    Component.use plugin
  Component
component.plugins = []
component.use = (plugin) -> component.plugins.push plugin

module.exports = component