async = require 'odo-async'
template = require 'odo-template'

hub = (defaultbindings) ->
  listeners = {}
  all = []
  none = []

  every = (e, cb) ->
    listeners[e] = [] if !listeners[e]?
    listeners[e].push cb

    off: ->
      index = listeners[e].indexOf cb
      if index isnt -1
        listeners[e].splice index, 1

  once = (e, cb) ->
    binding = every e, (payload, callback) ->
      binding.off()
      cb payload, callback
    off: -> binding.off()

  if defaultbindings?
    for events, cb of defaultbindings
      every events, cb

  result = {}

  result.new = (defaultbindings) ->
    hub defaultbindings

  result.child = (defaultbindings) ->
    res = hub()
    res.none (e, description, m, cb) ->
      result.emit e, m, cb
    if defaultbindings?
      for events, cb of defaultbindings
        res.every events, cb
    res

  # Subscribe to an event
  result.every = (events, cb) ->
    events = [events] unless events instanceof Array
    bindings = for e in events
      event: e

    for e in bindings
      e.binding = every e.event, cb

    off: -> e.binding.off() for e in bindings

  result.once = (events, cb) ->
    events = [events] unless events instanceof Array
    count = 0
    bindings = for e in events
      count++
      event: e
      complete: no

    for e in bindings
      e.binding = once e.event, (m, callback) ->
        count--
        e.complete = yes
        if count is 0
          cb(m, callback)
        else
          callback()

    off: -> e.binding.off() for e in bindings

  result.any = (events, cb) ->
    bindings = for e in events
      event: e

    unbind = -> e.binding.off() for e in bindings

    for e in bindings
      e.binding = once e.event, ->
        unbind()
        cb()

    off: unbind

  result.all = (cb) ->
    all.push cb
    off: ->
      index = all.indexOf cb
      if index isnt -1
        all.splice index, 1

  result.none = (cb) ->
    none.push cb
    off: ->
      index = none.indexOf cb
      if index isnt -1
        none.splice index, 1

  # Publish an event
  result.emit = (e, m, ecb) ->
    description = "#{template e, m}"

    tasks = []
    for listener in all
      do (listener) ->
        tasks.push (cb) ->
          async.delay ->
            listener e, description, m, cb

    if listeners[e]?
      for listener in listeners[e].slice()
        do (listener) ->
          tasks.push (cb) ->
            async.delay ->
              listener m, cb

    else
      for listener in none
        do (listener) ->
          tasks.push (cb) ->
            async.delay ->
              listener e, description, m, cb

    async.parallel tasks, -> ecb() if ecb?
  result

module.exports = hub