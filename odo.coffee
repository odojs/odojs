component = require './component'
widget = require './widget'

Query = require './query'
Stringify = require './stringify'

component.use Query
component.use Stringify
widget.use Query

module.exports =
  component: component
  widget: widget
  dom: require 'virtual-dom/h'
  svg: require 'virtual-dom/virtual-hyperscript/svg'
  partial: require 'vdom-thunk'