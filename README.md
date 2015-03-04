# Odojs

Simple virtual-dom components using the excellent [virtual-dom](https://github.com/Matt-Esch/virtual-dom) library.

Supports:
- Framework free components - users of the component don't need to include or work with a framework
- Components can be mounted into the DOM and updated with state
- Uni-directional data flow
- Virtual-hyperscript is exposed
- Components can be nested
- Widgets get access to the raw DOM elements
- Components can be rendered on the server as a string

Suggestions:
- Use with other libraries to help with events / observations and data manipulation

[![NPM version](https://badge.fury.io/js/odojs.svg)](http://badge.fury.io/js/odojs)

Inspired by [deku](https://github.com/segmentid/deku/).

# Example

Hello world.

```js
var odojs = require('odojs');
var component = odojs.component;
var dom = odojs.dom;

var App = component({
  render: function(state) {
    return dom('span', ['Hello ' + state]);
  }
});

var scene = App.render(document.body, 'World!');

setTimeout(function () {
  scene.update('New Zealand!');
}, 2000)
```

# API

```js
var odojs = require('odojs');
var component = odojs.component;
var widget = odojs.widget;
var dom = odojs.dom;
var svg = odojs.svg;
var partial = odojs.partial;
```

## Component

### vdom = Component(state)
Renders a portion of virtual dom. Normally only used within a Component. In this example we're using the `Input` component multiple times within our `App` component, passing each instance different state.
```js
var Input = component({
  render: function(state) {
    return dom('input', { attributes: { type: 'text', value: state } });
  }
});
var App = component({
  render: function(state) {
    return dom('div', [
      Input(state.name),
      Input(state.age)
    ]);
  }
});
scene = App.render(document.body, { name: 'Bob', age: '43' });
```

### scene = Component.render(dom, state)
Mounts a Component into the browser's dom. Returns a scene object used to update or remove.
```js
scene = App.render(document.body, { name: 'Bob', age: '43' });
```

### scene.update(state)
Renders all the Components into a virtual dom tree, diffs this tree against the last virtual dom tree to construct a patch then applies this patch to the browser dom.

### scene.remove()
Applies an empty patch, unmounting all Widgets and removing all Components from the browser dom.

### string = Component.renderString(state)
Renders the Component as a string. Widgets return empty string.

## Widget


## DOM

This is [virtual-hyperscript](https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript). 'h' is equivalent to 'dom'.

## SVG

This is [virtual-hyperscript](https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript). The svg method takes care of svg namespaces for elements and attributes automatically.

## Partial

This is [vdom-thunk](https://github.com/Raynos/vdom-thunk) which can be used to cache sections of the virtual dom.
