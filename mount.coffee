compose = require './compose'

module.exports = (component, spec) ->
  component.mount = (el, state, params, hub, options) ->
    scene = compose component, state, params, hub, el, options
    scene.mount()
    update: (state, params, hub) ->
      scene.update state, params, hub
    apply: (state, params, hub) ->
      scene.apply state, params, hub
    unmount: ->
      scene.unmount()