extend = require 'extend'

dedupe = (query) ->
  result = {}
  if query instanceof Array
    extend yes, result, q for q in query
  else
    extend yes, result, query
  result

module.exports = (component, spec) ->
  component.query = (state) ->
    return {} if !spec.query?
    dedupe spec.query.call component, state