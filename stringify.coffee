stringify = require 'virtual-dom-stringify'

module.exports = (component, spec) ->
  component.renderString = (state) ->
    stringify spec.render.call spec, state