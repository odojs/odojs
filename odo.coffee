component = require './component'
widget = require './widget'
mount = require './mount'
query = require './query'
stringify = require './stringify'

# built in plugins
component.use mount
component.use stringify
component.use query
widget.use query

module.exports =
  component: component
  widget: widget
  dom: require 'virtual-dom/h'
  svg: require 'virtual-dom/virtual-hyperscript/svg'
  partial: require 'vdom-thunk'
  compose: require './compose'
  hook: require './hook'