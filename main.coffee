compose = require './compose'
raf = require 'raf'

module.exports = (component, state) ->
  status = 'init'
  stateToApply = state
  item = compose component, state
  stateToApply = null
  
  status: status
  target: item.target
  update: (state) ->
    if currentlyRedrawing
      throw new Error 'State mutants are free'
    if stateToApply is null and status isnt 'pending'
      status = 'pending'
      stateToApply = state
      raf ->
        status = 'idle'
        return if stateToApply is null
        status = 'rendering'
        item.update stateToApply
        stateToApply = null
        status = 'idle'
  unmount: -> item.unmount()