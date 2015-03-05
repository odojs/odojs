create = require 'virtual-dom/create-element'
extend = require 'extend'

class Widget
  constructor: (spec, state) ->
    @spec = spec
    @state = state
  type: 'Widget'
  init: ->
    @el = @spec.render.call @, @state
    dom = create @el
    @el = dom if dom isnt null
    setImmediate =>
      if @spec.afterMount?
        @spec.afterMount.call @, @el, @state
    @el
  update: (prev, el) ->
    # copy state
    for k, v of prev
      @[k] = v if @[k] is undefined
    result = el
    if @spec.update?
      result = @spec.update.call @, el, @state, prev
      if result isnt null
        dom = create result
        result = dom if dom isnt null
    if @spec.onUpdate?
      @spec.onUpdate.call @, result, @state, prev
    result
  destroy: (el) ->
    if @spec.beforeUnmount?
      @spec.beforeUnmount.call @, el, @state

widget = (spec) ->
  spec = extend {}, spec
  Component = (state) ->
    new Widget spec, state
  Component.use = (plugin) -> plugin Component, spec
  for plugin in widget.plugins
    Component.use plugin
  Component
widget.plugins = []
widget.use = (plugin) -> widget.plugins.push plugin
widget.Widget = Widget

module.exports = widget