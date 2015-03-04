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

```coffee
{ component, widget, dom, svg, partial } = require 'odojs
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
      // vdom = Component(state)
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
Renders the Component with new state. The Component is rendered into a virtual dom tree, diffed against the last virtual dom tree and a patch is constructed which is applied to the browser dom.
```js
scene.update({ name: 'Sue', age: '33' });
```

### scene.remove()
Applies an empty patch, unmounting all Widgets and removing all Components from the browser dom.
```js
scene.remove()
```

### string = Component.renderString(state)
Renders the Component as a string. Widgets return empty string. Can be used in Node.js on the server.
```js
var Test = component({
  render: function(state) {
    return dom('span', state);
  }
});
var output = Test.renderString('test');
// output = "<span>test</span>"
```

## Widget
A widget is responsible for creating and updating own dom elements. It has events for different situations in the dom update cycle. All methods have access to a stateful `this`.

Widgets are perfect for integrating existing Javascript libraries into an odojs project.
```js
Leaflet = widget({
  render: function() {
    return dom('div#map');
  },
  afterMount: function(el, state) {
    this.map = L.map(el).setView([state.lat, state.lng], state.zoom);
    var tiles = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg', { subdomains: '1234' });
    tiles.addTo(this.map);
    this.map.on('moveend', (function(_this) {
      return function() {
        var center = _this.map.getCenter();
        var zoom = _this.map.getZoom();
        var location = { lat: center.lat, lng: center.lng, zoom: zoom };
        hub.emit('leaflet moved to {lat}/{lng}/{zoom}', location);
      };
    })(this));
  },
  update: function(el, state, prev) {
    // return a different dom element to replace the dom
    return el;
  },
  onUpdate: function(el, state, prev) {
    this.map.setView([state.lat, state.lng], state.zoom);
  },
  beforeUnmount: function(el, state) {
    this.map.remove();
  }
});

// widgets can't be mounted directly, but can be used inside Components
var App = component({
  render: function(state) {
    return dom('div', [Leaflet(state)]);
  }
});

var scene = App.render(document.body, { lat: 51, lng: 0, zoom: 8 });
```

## DOM

This is [virtual-hyperscript](https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript). 'h' is equivalent to 'dom'.

## SVG

This is [virtual-hyperscript](https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript). The svg method takes care of svg namespaces for elements and attributes automatically.

## Partial

This is [vdom-thunk](https://github.com/Raynos/vdom-thunk) which can be used to cache sections of the virtual dom.
