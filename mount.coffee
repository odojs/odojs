main = require './main'
require 'setimmediate'

module.exports = (component, spec) ->
  component.mount = (el, state) ->
    _render = (state) -> component state
    scene = main ((state) -> _render state), state
    el.appendChild scene.target
    update: (state) ->
      setImmediate -> scene.update state
    unmount: ->
      # patch against nothing for unmount
      _render = -> new VText ''
      scene.update {}