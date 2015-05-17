compose = require './compose'

module.exports = (component, spec) ->
  component.mount = (el, state, params, options) ->
    scene = compose component, state, params, el, options
    scene.mount()
    update: (state, params) ->
      scene.update state, params
    apply: (state, params) ->
      scene.apply state, params
    unmount: ->
      scene.unmount()