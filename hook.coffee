create = require 'virtual-dom/create-element'
compose = require './compose'
widget = require './widget'
extend = require 'extend'
dom = require 'virtual-dom/h'

class Hook
  constructor: (@component, @spec, @state, @options) ->
  type: 'Widget'
  create: ->
    @item = compose @component, @state, @el
    if @spec.enter?
      @spec.enter.call @spec, @item, @state, @options
    else
      @item.mount()
  remove: ->
    if @spec.exit?
      @spec.exit.call @spec, @item, @state, @options
    else
      @item.unmount()
  init: ->
    @el = create dom 'div'
    setImmediate => @create()
    @el
  update: (prev, el) ->
    { @el, @item } = prev
    # same component, no transition
    if prev.component is @component
      return el if !@component?
      return el @item.update @state
    # nothing previously
    if !prev.component?
      @create()
      return el
    # going to nothing
    if !@component?
      @remove()
      return el
    # transition
    olditem = @item
    @item = compose @component, @state, el
    if @spec.transition?
      @spec.transition.call @spec, olditem, @item, @state, @options
    else
      olditem.unmount()
      @item.mount()
    el
  destroy: -> @remove()


hook = (spec) ->
  spec = extend {}, spec
  Component = (component, state, options) ->
    new Hook component, spec, state, options
  Component.use = (plugin) -> plugin Component, spec
  for plugin in hook.plugins
    Component.use plugin
  Component
hook.plugins = []
hook.use = (plugin) -> hook.plugins.push plugin

module.exports = hook