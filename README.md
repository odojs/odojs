# Odojs

Simple virtual-dom components using the excellent [virtual-dom](https://github.com/Matt-Esch/virtual-dom) library.

Supports:
- Framework free components - users of the component don't need to include or work with odojs
- Components can be mounted into the DOM and updated with state
- Uni-directional data flow
- Virtual-hyperscript is exposed
- Components can be nested
- Widgets get access to the raw DOM elements
- Components can be rendered on the server as a string
- This can be used as the View in MVC type applications

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

var scene = App.mount(document.body, 'World!');
re
setTimeout(function () {
  scene.update('New Zealand!');
}, 2000)
```

# API

Jump links
- [Component](#component)
- [Widget](#widget)
- [Hook](#hook)
- [DOM](#dom)
- [SVG](#svg)
- [Partial](#partial)

Documentation for some parts of virtual-dom is not available, with this library it shouldn't be needed, but just in case there is a [work in progress page for virtual-dom documentation](http://hackersome.com/p/littleloops/virtual-dom-docs-wip) that does a good job describing the internals.

Multiple sections of odojs are available off the root require.
```js
var odojs = require('odojs');
var component = odojs.component;
var widget = odojs.widget;
var hook = odojs.hook;
var dom = odojs.dom;
var svg = odojs.svg;
var partial = odojs.partial;
```

## Component
Create a component by passing a specification to the component method. This specification should have a `render` method that takes state and returns virtual dom nodes.

### vdom = ComponentSpec.render(state)
Input state and return virtual dom. Other Components can be called and passed unique values or portions of state.

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
scene = App.mount(document.body, { name: 'Bob', age: '43' });
```

### scene = Component.mount(dom, state)
Mounts a Component into the browser's dom. Returns a scene object used to update or remove.
```js
scene = App.mount(document.body, { name: 'Bob', age: '43' });
```

### scene.update(state)
Renders the Component with new state. The Component is rendered into a virtual dom tree, diffed against the last virtual dom tree and a patch is constructed which is applied to the browser dom.
```js
scene.update({ name: 'Sue', age: '33' });
```

### scene.unmount()
Applies an empty patch, unmounting all Widgets and removing all Components from the browser dom.
```js
scene.unmount()
```

### string = Component.stringify(state)
Renders the Component as a string. Widgets and hooks return empty string. Can be used in Node.js on the server.
```js
var Test = component({
  render: function(state) {
    return dom('span', state);
  }
});
var output = Test.stringify('test');
// output = "<span>test</span>"
```

## Widget
A widget is responsible for creating and updating own dom elements. It has events for different situations in the dom update cycle. All methods have access to a stateful `this`.

Widgets are perfect for integrating existing Javascript libraries into an odojs project.

Create a widget by passing a specification to the widget method. A `render` method that returns a browser dom element, or virtual dom elements is required, all other methods are options.
```js
Leaflet = widget({
  render: function() {
    return dom('div#map');
  },
  afterMount: function(el, state) {
    this.map = L.map(el).setView([state.lat, state.lng], state.zoom);
    var tiles = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg', {
      subdomains: '1234'
    });
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
  update: function(el, state) {
    // return a different dom element to replace the dom
    return el;
  },
  onUpdate: function(el, state) {
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

var scene = App.mount(document.body, { lat: 51, lng: 0, zoom: 8 });
```

### vdom Widget(state)
Renders a representation of the widget in virtual dom. Normally only used within a Component.

### vdom or dom = WidgetSpec.render(state)
The same as Component, this method is passed state and expected to return either a browser dom element or virtual dom element. This is the only required method.

### WidgetSpec.afterMount(el, state)
Called after the element returned by `render` has been appended to the browser dom. This is the place to pass the element to other Javascript libraries, or attach manual event handlers.

### vdom or dom = WidgetSpec.update(el, state)
Called during update. All properties on the old widget have been copied across and are available. A browser dom element or virtual dom element can be returned from this method to replace the existing dom element. Return null or `el` for no change.

### WidgetSpec.onUpdate(el, state)
Called during update after `update` if it exists. All properties on the old widget have been copied across and are available and `el` will reflect any updates from `update`

### WidgetSpec.beforeUnmount(el)
Called just before the widget is removed from the browser dom. Can be used to unbind and cleanup anything else other Javascript code has been using.


## Hook
A hook wraps another component prives three callbacks to control how the dom changes. `enter` is called when the component is mounted, `exit` is called when it is unmounted and `transition` is called when the component is changed. All callbacks are optional.

Hooks are perfect for animating component changes.

Create a hook by passing a specification to the hook method.

```js
var Pane1 = component({ render: function(state) {
  return dom('p', ['PANE ONE ' + state.name]);
}});

var Pane2 = component({ render: function(state) {
  return dom('p', ['PANE TWO ' + state.name]);
}});

var Wizard = hook({
  enter: function(item, state, options) {
    // default behaviour
    item.mount();
  },
  transition: function(item1, item2, state, options) {
    if (options === 'forward') {
      animation.slideOutLeft(item1.target, function() {
        item1.unmount();
        animation.slideInRight(item2.target);
        item2.mount();
      });
    } else if (options === 'back') {
      animation.slideOutRight(item1.target, function() {
        item1.unmount();
        animation.slideInLeft(item2.target);
        item2.mount();
      });
    } else {
      // default behaviour
      item1.unmount();
      item2.mount();
    }
  },
  exit: function(item, state, options) {
    // default behaviour
    item.unmount();
  }
});

var App = component({
  render: function(state) {
    return dom('div.wrapper.grid', [
      Wizard(state.component, state.state, 'forward')
    ]);
  }
});

var scene = App.mount(document.body, {
  component: Pane1,
  state: { name: 'Tim' }
});

setTimeout((function() {
  scene.update({
    component: Pane2,
    state: { name: 'Bob' }
  });
}), 3000);
```

### vdom Hook(component, state, options)
Renders a representation of the hook in virtual dom. Normally only used within a Component.
```js
Wizard(Pane1, { name: 'Bob' }, 'forward);
```

### HookSpec.enter(item, state, options)
Called when the hook is rendered for the first time, or if a component has been newly passed in. `item.target` is the raw dom element. `item.mount()` should be called at some point to complete adding the element into the dom.
```js
// slide up into the page using the velocity animation library
enter: function (item, state, options) {
  item.target.style.display = 'none';
  velocity(item.target, { translateY: [0, '2000px'] }, { display: 'auto' });
  item.mount();
}
```

### HookSpec.transition(item1, item2, state, options)
Called when the component is different. `item1.target` and `item2.target` are the raw dom elements. `item1.unmount()` and `item2.mount()` should both be called at some point to complete the transition.

### HookSpec.exit(item, state, options)
Called when a component is set to null and when the hook is unmounted. When the hook is unmounted there is no time to animate as the dom element is removed immediately. `item.target` is the raw dom element. `item.unmount()` should be called at some point.


## DOM

This is [virtual-hyperscript](https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript). 'dom' is equivalent to 'h'.

## SVG

This is [virtual-hyperscript](https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript). The svg method takes care of svg namespaces for elements and attributes automatically.

## Partial

This is [vdom-thunk](https://github.com/Raynos/vdom-thunk) which can be used to cache sections of the virtual dom based on state.

# Todo

- Stringify doesn't go through hooks or widgets.
