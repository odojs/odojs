mainLoop = require 'main-loop'
createElement = require 'virtual-dom/create-element'
diff = require 'virtual-dom/diff'
patch = require 'virtual-dom/patch'
stringify = require 'virtual-dom-stringify'
VText = require 'virtual-dom/vnode/vtext'
require 'setimmediate'

component = (spec) ->
  Component = spec.render
  Component.render = (dom, state) ->
    render = (state) -> Component state
    scene = mainLoop state, ((state) -> render state),
      create: createElement
      diff: diff
      patch: patch
    dom.appendChild scene.target
    update: (state) ->
      setImmediate -> scene.update state
    remove: ->
      render = -> new VText ''
      scene.update {}
  Component.renderString = (state) ->
    stringify spec.render state
  Component

class Widget
  constructor: (spec, state) ->
    @spec = spec
    @state = state
  
  type: 'Widget'
  
  init: ->
    @el = @spec.render @state
    dom = createElement @el
    @el = dom if dom isnt null
    setImmediate =>
      if @spec.afterMount?
        @spec.afterMount @el, @state
    @el
  update: (prev, el) ->
    if @spec.update?
      @spec.update el, @state, prev
  destroy: (el) ->
    if @spec.beforeUnmount?
      @spec.beforeUnmount el, @state

widget = (spec) -> (state) -> new Widget spec, state

module.exports =
  component: component
  widget: widget
  h: require 'virtual-dom/h'
  svg: require 'virtual-dom/virtual-hyperscript/svg'