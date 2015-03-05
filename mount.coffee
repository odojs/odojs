create = require 'virtual-dom/create-element'
diff = require 'virtual-dom/diff'
patch = require 'virtual-dom/patch'
VText = require 'virtual-dom/vnode/vtext'
main = require 'main-loop'
require 'setimmediate'

module.exports = (component, spec) ->
  component.mount = (el, state) ->
    _render = (state) -> component state
    scene = main state, ((state) -> _render state),
      create: create, diff: diff, patch: patch
    el.appendChild scene.target
    update: (state) ->
      setImmediate -> scene.update state
    unmount: ->
      # patch against nothing for unmount
      _render = -> new VText ''
      scene.update {}