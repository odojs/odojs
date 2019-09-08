var Thunk, thunk;

Thunk = (function() {
  class Thunk {
    constructor(render1, state1, params1, hub1) {
      this.render = render1;
      this.state = state1;
      this.params = params1;
      this.hub = hub1;
    }

    render(previous) {
      return this.render.call(this, previous, this.state, this.params, this.hub);
    }

  };

  Thunk.prototype.type = 'Thunk';

  return Thunk;

})();

thunk = function(render) {
  var Component, i, len, plugin, ref;
  Component = function(state, params, hub) {
    return new Thunk(render, state, params, hub);
  };
  Component.use = function(plugin) {
    return plugin(Component, render);
  };
  ref = thunk.plugins;
  for (i = 0, len = ref.length; i < len; i++) {
    plugin = ref[i];
    Component.use(plugin);
  }
  return Component;
};

thunk.plugins = [];

thunk.use = function(plugin) {
  return thunk.plugins.push(plugin);
};

thunk.Thunk = Thunk;

module.exports = thunk;
