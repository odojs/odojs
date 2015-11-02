stringify = require 'vdom-to-html'

module.exports = (component, spec) ->
  component.stringify = (state, params, hub) ->
    stringify spec.render.call spec, state, params, hub