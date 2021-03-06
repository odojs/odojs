create = require 'virtual-dom/create-element'
compose = require './compose'
extend = require 'extend'
dom = require 'virtual-dom/h'
require 'setimmediate'

class Hook
  constructor: (@component, @spec, @state, @params, @hub) ->
    if !@spec.enter?
      @spec.enter = (item) -> @item.mount()
    if !@spec.exit?
      @spec.exit = (item) -> @item.unmount()
    if !@spec.transition?
      @spec.transition = (olditem, newitem) ->
        olditem.unmount()
        item.mount()
  type: 'Widget'
  render: ->
    if @spec.render?
      @spec.render.call @spec, @component, @state, @params, @hub
    else
      dom 'div.hook', @component
  create: ->
    @item = compose @component, @state, @params, @hub, @el
    @spec.enter.call @spec, @item, @state, @params, @hub
  remove: ->
    @spec.exit.call @spec, @item, @state, @params, @hub
  init: ->
    el = null
    if @spec.init?
      el = @spec.init.call @spec, @state, @params, @hub
    else
      el = dom 'div.hook'
    @el = create el
    setImmediate => @create()
    @el
  update: (prev, el) ->
    { @el, @item } = prev
    # same component, no transition
    if prev.component is @component
      return el if !@component?
      @item.update @state, @params, @hub
      return el
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
    @item = compose @component, @state, @params, @hub, el
    @spec.transition.call @spec, olditem, @item, @state, @params, @hub
    el
  destroy: -> @remove()

hook = (spec) ->
  spec = extend {}, spec
  Component = (component, state, params, hub) ->
    new Hook component, spec, state, params, hub
  Component.use = (plugin) -> plugin Component, spec
  for plugin in hook.plugins
    Component.use plugin
  Component
hook.plugins = []
hook.use = (plugin) -> hook.plugins.push plugin

module.exports = hook