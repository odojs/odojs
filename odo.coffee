create = require 'virtual-dom/create-element'
diff = require 'virtual-dom/diff'
patch = require 'virtual-dom/patch'
VText = require 'virtual-dom/vnode/vtext'
main = require 'main-loop'
stringify = require 'virtual-dom-stringify'
require 'setimmediate'

component = (spec) ->
  Component = (state) ->
    spec.render.call Component, state
  Component.use = (plugin) ->
    if typeof plugin is 'function'
      return plugin Component
    for k, v of plugin
      Component[k] = v
  Component.render = (el, state) ->
    _render = (state) -> Component state
    scene = main state, ((state) -> _render state),
      create: create, diff: diff, patch: patch
    el.appendChild scene.target
    update: (state) ->
      setImmediate -> scene.update state
    remove: ->
      # patch against nothing for unmount
      _render = -> new VText ''
      scene.update {}
  Component.renderString = (state) ->
    stringify spec.render.call Component, state
  Component

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
      @[k] = v if !@[k]?
    result = el
    if @spec.update?
      result = @spec.update.call @, el, @state, prev
    if @spec.onUpdate?
      @spec.onUpdate.call @, result, @state, prev
    result
  destroy: (el) ->
    if @spec.beforeUnmount?
      @spec.beforeUnmount.call @, el, @state

widget = (spec) -> (state) -> new Widget spec, state

module.exports =
  component: component
  widget: widget
  dom: require 'virtual-dom/h'
  svg: require 'virtual-dom/virtual-hyperscript/svg'
  partial: require 'vdom-thunk'