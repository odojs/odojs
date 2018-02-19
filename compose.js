const raf = require('raf')
const create = require('virtual-dom/create-element')
const diff = require('virtual-dom/diff')
const patch = require('virtual-dom/patch')
const VText = require('virtual-dom/vnode/vtext')
const virtualize = require('vdom-virtualize')

const removeContentEditable = (vnode) => {
  if (vnode.properties != null)
    delete vnode.properties.contentEditable
  if (!vnode.children) return
  for (let node of vnode.children)
    removeContentEditable(node)
}

module.exports = (component, state, params, hub, parent, options) => {
  let time = (description, cb) => { cb() }
  if (options != null && options.hub != null) {
    time = (description, cb) => {
      const startedAt = new Date().getTime()
      cb()
      const endedAt = new Date().getTime()
      options.hub.emit('Odo.js {description} in {duration}ms', {
        description: description,
        startedAt: startedAt,
        endedAt: endedAt,
        duration: endedAt - startedAt
      })
    }
  }
  let status = 'init'
  let tree = null
  let target = null
  time('scene created', () => {
    tree = component(state, params, hub)
  })
  status = 'idle'
  const apply = (state, params, hub) => {
    if (status === 'rendering')
      throw new Error('Mutant rampage')
    status = 'rendering'
    time('scene updated', () => {
      const newTree = component(state, params, hub)
      const patches = diff(tree, newTree)
      target = patch(target, patches)
      tree = newTree
    })
    status = 'idle'
  }
  payload = null
  return {
    target: () => target,
    status: () => status,
    mount: () => {
      const existing = virtualize(parent)
      removeContentEditable(existing)
      const patches = diff(existing, tree)
      target = patch(parent, patches)
    },
    update: (state, params, hub) => {
      if (status === 'rendering')
        throw new Error('Mutant rampage')
      if (status === 'pending') {
        payload = { state: state, params: params, hub: hub }
        return
      }
      if (status === 'idle') {
        status = 'pending'
        payload = { state: state, params: params, hub: hub }
        raf(() => {
          if (payload == null) return
          apply(payload.state, payload.params, payload.hub)
          payload = null
        })
      }
    },
    apply: apply,
    unmount: () => patch(target, diff(tree, new VText('')))
  }
}
