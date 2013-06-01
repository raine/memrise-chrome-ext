_ = require 'underscore'

module.exports =
  prependPath: (obj, path) ->
    return _.reduce obj, (obj, v, k) ->
      obj[path + k] = v.map (e) -> path + e
      obj
    , {}
