create = require 'virtual-dom/create-element'
diff = require 'virtual-dom/diff'
patch = require 'virtual-dom/patch'
VText = require 'virtual-dom/vnode/vtext'
raf = require 'raf'

module.exports = (component, state, params, parent) ->
  status = 'init'
  tree = component state, params
  target = create tree
  status = 'idle'
  
  apply = (state, params) ->
    if status is 'rendering'
      throw new Error 'Mutant rampage'
    status = 'rendering'
    newTree = component state, params
    patches = diff tree, newTree
    target = patch target, patches
    tree = newTree
    status = 'idle'
  
  payload = null
  target: target
  status: status
  mount: ->
    parent.appendChild target
  update: (state, params) ->
    if status is 'rendering'
      throw new Error 'Mutant rampage'
    if payload is null and status isnt 'pending'
      status = 'pending'
      payload =
        state: state
        params: params
      raf ->
        # have already applied the state
        if payload is null
          status = 'idle'
          return
        apply payload.state, payload.params
        payload = null
  apply: apply
  unmount: ->
    # patch against nothing for unmount
    patch target, diff tree, new VText ''