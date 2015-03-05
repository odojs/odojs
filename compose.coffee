create = require 'virtual-dom/create-element'
diff = require 'virtual-dom/diff'
patch = require 'virtual-dom/patch'
VText = require 'virtual-dom/vnode/vtext'

module.exports = (component, state, parent) ->
  tree = component state
  target = create tree
  target: target
  mount: ->
    parent.appendChild target
  update: (state) ->
    newTree = component state
    patches = diff tree, newTree
    target = patch target, patches
    tree = newTree
  unmount: ->
    # patch against nothing for unmount
    patch target, diff tree, new VText ''