stringify = require 'virtual-dom-stringify'

module.exports = (component, spec) ->
  component.stringify = (state, params) ->
    stringify spec.render.call spec, state, params