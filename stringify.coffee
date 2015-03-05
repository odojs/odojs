stringify = require 'virtual-dom-stringify'

module.exports = (component, spec) ->
  component.stringify = (state) ->
    stringify spec.render.call spec, state