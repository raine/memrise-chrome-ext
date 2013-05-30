grunt = require 'grunt'

markdown = ->
	exec 'marked -o CHANGES.html CHANGES.md'

clean = ->
	exec 'rm -rf build/'

clone = ->
	exec 'git clone .git build/'
	rm '-rf', 'build/.git'

version = ->
	filepath = 'manifest.json'
	manifest = grunt.file.readJSON filepath
	manifest.version = env.VERSION
	grunt.file.write filepath, JSON.stringify(manifest, null, 4)

	for file in grunt.file.expand '**/*.{html,js}'
		sed '-i', '%VERSION%', env.VERSION, file

manifest = ->
	manifestFiles = grunt.util._.initial grunt.file.read('MANIFEST').split("\n")
	files = grunt.file.expand '{**,.*}'

	extra   = grunt.util._.difference files, manifestFiles
	missing = grunt.util._.difference manifestFiles, files

	unless grunt.util._.isEmpty missing
		grunt.fail.warn "Files missing: #{grunt.log.wordlist missing}"

	for file in extra
		unless grunt.file.isDir file
			grunt.file.delete file

	for file in extra
		if grunt.file.isDir(file) and grunt.file.expand("#{file}/**").length is 1
			grunt.file.delete file

zip = ->
	o = 'memrise-button.zip'
	if exec("zip -r ../#{o} .").code is 0
		grunt.log.ok "build zipped to #{o}"

build = ->
	unless env.VERSION
		grunt.fatal 'Version not specified.'

	clone()
	exec 'ln -s ../node_modules build/node_modules'
	exec 'grunt --base build/ minify'
	exec 'grunt --base build/ targethtml'
	exec 'rm build/node_modules'

	grunt.file.setBase 'build/'
	markdown() # Needs to be run before manifest()
	manifest()
	version()
	zip()

module.exports =
	clone    : clone
	clean    : clean
	build    : build
	manifest : manifest
