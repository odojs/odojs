// Generated by CoffeeScript 1.9.2
var VText, create, diff, patch, raf, removeContentEditable, virtualize;

raf = require('raf');

create = require('virtual-dom/create-element');

diff = require('virtual-dom/diff');

patch = require('virtual-dom/patch');

VText = require('virtual-dom/vnode/vtext');

virtualize = require('vdom-virtualize');

removeContentEditable = function(vnode) {
  var i, len, node, ref, ref1, results;
  if ((ref = vnode.properties) != null) {
    delete ref.contentEditable;
  }
  if (!vnode.children) {
    return;
  }
  ref1 = vnode.children;
  results = [];
  for (i = 0, len = ref1.length; i < len; i++) {
    node = ref1[i];
    results.push(removeContentEditable(node));
  }
  return results;
};

module.exports = function(component, state, params, hub, parent, options) {
  var apply, payload, status, target, time, tree;
  time = function(description, cb) {
    return cb();
  };
  if ((options != null ? options.hub : void 0) != null) {
    time = function(description, cb) {
      var endedAt, startedAt;
      startedAt = new Date().getTime();
      cb();
      endedAt = new Date().getTime();
      return options.hub.emit('Odo.js {description} in {duration}ms', {
        description: description,
        startedAt: startedAt,
        endedAt: endedAt,
        duration: endedAt - startedAt
      });
    };
  }
  status = 'init';
  tree = null;
  target = null;
  time('scene created', function() {
    return tree = component(state, params, hub);
  });
  status = 'idle';
  apply = function(state, params, hub) {
    if (status === 'rendering') {
      throw new Error('Mutant rampage');
    }
    status = 'rendering';
    time('scene updated', function() {
      var newTree, patches;
      newTree = component(state, params, hub);
      patches = diff(tree, newTree);
      target = patch(target, patches);
      return tree = newTree;
    });
    return status = 'idle';
  };
  payload = null;
  return {
    target: function() {
      return target;
    },
    status: function() {
      return status;
    },
    mount: function() {
      var existing, patches;
      existing = virtualize(parent);
      removeContentEditable(existing);
      patches = diff(existing, tree);
      return target = patch(parent, patches);
    },
    update: function(state, params, hub) {
      if (status === 'rendering') {
        throw new Error('Mutant rampage');
      }
      if (status === 'pending') {
        payload = {
          state: state,
          params: params,
          hub: hub
        };
        return;
      }
      if (status === 'idle') {
        status = 'pending';
        payload = {
          state: state,
          params: params,
          hub: hub
        };
        return raf(function() {
          if (payload === null) {
            return;
          }
          apply(payload.state, payload.params, payload.hub);
          return payload = null;
        });
      }
    },
    apply: apply,
    unmount: function() {
      return patch(target, diff(tree, new VText('')));
    }
  };
};
