create = require 'virtual-dom/create-element'
compose = require './compose'
widget = require './widget'
extend = require 'extend'
dom = require 'virtual-dom/h'

class Hook
  constructor: (component, spec, state) ->
    @spec = spec
    @state = state
  type: 'Widget'
  init: ->
    @el = @spec.render.call @, @state
    dom = create @el
    @el = dom if dom isnt null
    setImmediate =>
      @item = compose @component, state, el
      if spec.enter?
        spec.enter.call @, @item, state
      else
        @item.mount()
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


hook = (spec) ->
  spec = extend {}, spec
  hookSpec =
    render: (state) ->
      dom 'div'
    afterMount: (el, state) ->
      @item = compose @component, state, el
      if spec.enter?
        spec.enter.call @, @item, state
      else
        @item.mount()
    onUpdate: (el, state, prev) ->
      if prev.component is @component
        return if !@component?
        return @item.update state
      if !prev.component?
        return @spec.afterMount.call @, el, state
      if !@component?
        return @spec.beforeUnmount.call @, el, state
      olditem = @item
      @item = compose @component, state, el
      if spec.transition?
        spec.transition.call @, olditem, @item, state
      else
        olditem.unmount()
        @item.mount()
    beforeUnmount: (el, state) ->
      if spec.exit?
        spec.exit.call @, @item, state
      else
        @item.unmount()
  Component = (component, state, options) ->
    result = new widget.Widget hookSpec, state
    result.component = component
    result.options = options
    result.hook = spec
    result
  Component.use = (plugin) -> plugin Component, spec
  for plugin in hook.plugins
    Component.use plugin
  Component
hook.plugins = []
hook.use = (plugin) -> hook.plugins.push plugin

module.exports = hook