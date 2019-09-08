var component, mount, stringify, widget;

component = require('./component');

widget = require('./widget');

mount = require('./mount');

stringify = require('./stringify');

// built in plugins
component.use(mount);

component.use(stringify);

module.exports = {
  component: component,
  widget: widget,
  dom: require('virtual-dom/h'),
  svg: require('virtual-dom/virtual-hyperscript/svg'),
  partial: require('vdom-thunk'),
  compose: require('./compose'),
  hook: require('./hook'),
  hub: require('./hub'),
  thunk: require('./thunk'),
  memoize: require('./memoize')
};
