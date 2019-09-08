const raf = require('raf')
const create = require('virtual-dom/create-element')
const diff = require('virtual-dom/diff')
const patch = require('virtual-dom/patch')
const VText = require('virtual-dom/vnode/vtext')
const virtualize = require('vdom-virtualize')

// hack for virtual-dom trying to set contentEditable to ''
const removeContentEditable = (vnode) => {
  if (vnode.properties != null)
    delete ref.contentEditable
  if (!vnode.children) return
  for (let node of vnode.children)
    removeContentEditable(node)
}

module.exports = (component, state, params, hub, parent, options) => {
  const time = (description, cb) => cb()
  if ((options != null ? options.hub : void 0) != null) {
    time = function(description, cb) {
      var endedAt, startedAt
      startedAt = new Date().getTime()
      cb()
      endedAt = new Date().getTime()
      return options.hub.emit('Odo.js {description} in {duration}ms', {
        description: description,
        startedAt: startedAt,
        endedAt: endedAt,
        duration: endedAt - startedAt
      })
    }
  }
  status = 'init'
  tree = null
  target = null
  time('scene created', function() {
    return tree = component(state, params, hub)
  })
  status = 'idle'
  apply = function(state, params, hub) {
    if (status === 'rendering') {
      throw new Error('Mutant rampage')
    }
    status = 'rendering'
    time('scene updated', function() {
      var newTree, patches
      newTree = component(state, params, hub)
      patches = diff(tree, newTree)
      target = patch(target, patches)
      return tree = newTree
    })
    return status = 'idle'
  }
  payload = null
  return {
    target: function() {
      return target
    },
    status: function() {
      return status
    },
    mount: function() {
      var existing, patches
      existing = virtualize(parent)
      removeContentEditable(existing)
      patches = diff(existing, tree)
      return target = patch(parent, patches)
    },
    update: function(state, params, hub) {
      if (status === 'rendering') {
        throw new Error('Mutant rampage')
      }
      // pending apply, update state and params
      if (status === 'pending') {
        payload = {
          state: state,
          params: params,
          hub: hub
        }
        return
      }
      // wait for animation frame to apply
      if (status === 'idle') {
        status = 'pending'
        payload = {
          state: state,
          params: params,
          hub: hub
        }
        return raf(function() {
          // have already applied the state
          if (payload === null) {
            return
          }
          apply(payload.state, payload.params, payload.hub)
          return payload = null
        })
      }
    },
    apply: apply,
    unmount: function() {
      // patch against nothing for unmount
      return patch(target, diff(tree, new VText('')))
    }
  }
}
