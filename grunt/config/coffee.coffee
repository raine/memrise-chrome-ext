module.exports =
  glob_to_multiple:
    expand: true
    flatten: true
    cwd: 'test/src/'
    src: ['*.coffee']
    dest: 'test/'
    ext: '.test.js'
