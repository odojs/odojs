module.exports = (cache) ->
  # default cache is forever!
  if !cache?
    _data = {}
    cache =
      get: (key) -> _data[key]
      set: (key, value) -> _data[key] = value
  (fn) ->
    _cache = cache()
    (state, params, hub) ->
      key = JSON.stringify [state, params]
      entry = _cache.get key
      if entry?
        console.log 'Cache hit'
        entry.hub = hub
        return entry.vdom

      console.log 'Cache miss'
      slavehub = emit: (m, p, cb) -> entry.hub.emit m, p, cb
      entry =
        hub: hub
        vdom: fn.call @, state, params, slavehub
      _cache.set key, entry
      entry.vdom