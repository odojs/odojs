createElement = require 'virtual-dom/create-element'
diff = require 'virtual-dom/diff'
patch = require 'virtual-dom/patch'
VText = require 'virtual-dom/vnode/vtext'

stringify = require 'virtual-dom-stringify'
mainLoop = require 'main-loop'
require 'setimmediate'

component = (spec) ->
  Component = spec.render
  Component.render = (el, state) ->
    render = (state) -> Component state
    scene = mainLoop state, ((state) -> render state),
      create: createElement
      diff: diff
      patch: patch
    el.appendChild scene.target
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
    @el = @spec.render.call @, @state
    dom = createElement @el
    @el = dom if dom isnt null
    setImmediate =>
      if @spec.afterMount?
        @spec.afterMount.call @, @el, @state
    @el
  update: (prev, el) ->
    # sneaky state
    for k, v of prev
      @[k] = v if !@[k]?
    if @spec.update?
      @spec.update.call @, el, @state, prev
    else
      null
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