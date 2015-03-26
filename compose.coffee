create = require 'virtual-dom/create-element'
diff = require 'virtual-dom/diff'
patch = require 'virtual-dom/patch'
VText = require 'virtual-dom/vnode/vtext'
raf = require 'raf'

time = (description, cb) ->
  startedAt = new Date().getTime()
  cb()
  endedAt = new Date().getTime()
  if window?.hub?
    window.hub.emit '{description} in {duration}ms',
      description: description
      startedAt: startedAt
      endedAt: endedAt
      duration: endedAt - startedAt

module.exports = (component, state, params, parent) ->
  status = 'init'
  tree = null
  target = null
  time 'scene created', ->
    tree = component state, params
    target = create tree
  status = 'idle'
  
  apply = (state, params) ->
    if status is 'rendering'
      throw new Error 'Mutant rampage'
    status = 'rendering'
    time 'scene updated', ->
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
    # pending apply, update state and params
    if status is 'pending'
      payload =
        state: state
        params: params
      return
    # wait for animation frame to apply
    if status is 'idle'
      status = 'pending'
      payload =
        state: state
        params: params
      raf ->
        # have already applied the state
        return if payload is null
        apply payload.state, payload.params
        payload = null
  apply: apply
  unmount: ->
    # patch against nothing for unmount
    patch target, diff tree, new VText ''