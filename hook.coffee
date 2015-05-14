create = require 'virtual-dom/create-element'
compose = require './compose'
extend = require 'extend'
dom = require 'virtual-dom/h'
require 'setimmediate'

class Hook
  constructor: (@component, @spec, @state, @params) ->
    if !@spec.enter?
      @spec.enter = (item) -> @item.mount()
    if !@spec.exit?
      @spec.exit = (item) -> @item.unmount()
    if !@spec.transition?
      @spec.transition = (olditem, newitem) ->
        olditem.unmount()
        item.mount()
  type: 'Widget'
  create: ->
    @item = compose @component, @state, @params, @el
    @spec.enter.call @spec, @item, @state, @params
  remove: ->
    @spec.exit.call @spec, @item, @state, @params
  init: ->
    @el = create dom 'div'
    setImmediate => @create()
    @el
  update: (prev, el) ->
    { @el, @item } = prev
    # same component, no transition
    if prev.component is @component
      return el if !@component?
      @item.update @state, @params
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
    @item = compose @component, @state, @params, el
    @spec.transition.call @spec, olditem, @item, @state, @params
    el
  destroy: -> @remove()

hook = (spec) ->
  spec = extend {}, spec
  Component = (component, state, params) ->
    new Hook component, spec, state, params
  Component.use = (plugin) -> plugin Component, spec
  for plugin in hook.plugins
    Component.use plugin
  Component
hook.plugins = []
hook.use = (plugin) -> hook.plugins.push plugin

module.exports = hook