const create = require('virtual-dom/create-element')
const compose = require('./compose')
const extend = require('extend')
const dom = require('virtual-dom/h')
require('setimmediate')

Hook = (function() {
  function Hook(component1, spec1, state1, params1, hub1) {
    this.component = component1
    this.spec = spec1
    this.state = state1
    this.params = params1
    this.hub = hub1
    if (this.spec.enter == null) {
      this.spec.enter = function(item) {
        return this.item.mount()
      }
    }
    if (this.spec.exit == null) {
      this.spec.exit = function(item) {
        return this.item.unmount()
      }
    }
    if (this.spec.transition == null) {
      this.spec.transition = function(olditem, newitem) {
        olditem.unmount()
        return item.mount()
      }
    }
  }

  Hook.prototype.type = 'Widget'

  Hook.prototype.render = function() {
    if (this.spec.render != null) {
      return this.spec.render.call(this.spec, this.component, this.state, this.params, this.hub)
    } else {
      return dom('div.hook', this.component)
    }
  }

  Hook.prototype.create = function() {
    this.item = compose(this.component, this.state, this.params, this.hub, this.el)
    return this.spec.enter.call(this.spec, this.item, this.state, this.params, this.hub)
  }

  Hook.prototype.remove = function() {
    return this.spec.exit.call(this.spec, this.item, this.state, this.params, this.hub)
  }

  Hook.prototype.init = function() {
    var el
    el = null
    if (this.spec.init != null) {
      el = this.spec.init.call(this.spec, this.state, this.params, this.hub)
    } else {
      el = dom('div.hook')
    }
    this.el = create(el)
    setImmediate((function(_this) {
      return function() {
        return _this.create()
      }
    })(this))
    return this.el
  }

  Hook.prototype.update = function(prev, el) {
    var olditem
    this.el = prev.el, this.item = prev.item
    if (prev.component === this.component) {
      if (this.component == null) {
        return el
      }
      this.item.update(this.state, this.params, this.hub)
      return el
    }
    if (prev.component == null) {
      this.create()
      return el
    }
    if (this.component == null) {
      this.remove()
      return el
    }
    olditem = this.item
    this.item = compose(this.component, this.state, this.params, this.hub, el)
    this.spec.transition.call(this.spec, olditem, this.item, this.state, this.params, this.hub)
    return el
  }

  Hook.prototype.destroy = function() {
    return this.remove()
  }

  return Hook

})()

hook = function(spec) {
  var Component, i, len, plugin, ref
  spec = extend({}, spec)
  Component = function(component, state, params, hub) {
    return new Hook(component, spec, state, params, hub)
  }
  Component.use = function(plugin) {
    return plugin(Component, spec)
  }
  ref = hook.plugins
  for (i = 0, len = ref.length i < len i++) {
    plugin = ref[i]
    Component.use(plugin)
  }
  return Component
}

hook.plugins = []

hook.use = function(plugin) {
  return hook.plugins.push(plugin)
}

module.exports = hook
