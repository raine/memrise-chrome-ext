utils = require '../utils'

files =
  'options/js/options.min.js' : ['dist/options.concat.js']
  'lib/common.min.js'         : ['dist/common.concat.js']
  'lib/main.min.js'           : ['dist/main.concat.js']

# files = utils.prependPath files, 'build/'

module.exports =
  options:
    report: 'min'
    mangle: {}

  my_target:
    files: files
