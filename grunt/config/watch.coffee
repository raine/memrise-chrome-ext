module.exports =
  coffee:
    files: 'test/src/*.coffee'
    tasks: 'coffee'

  tests:
    files: [
      'test/**/*.js',
      'options/**/*.js',
      'test/index.html',
      'lib/memrise.js'
    ]
    tasks: 'exec'
