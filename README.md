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

# Examples

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
