all: clean
	mkdir -p dist/
	find . -maxdepth 1 -type d \( -path ./.git -o -path ./assets -o -path ./dist \) -prune -o \
		-name '*' ! -name '.*' ! -name 'README.md' ! -name 'Makefile' -print | \
		xargs -I % sh -c '{ echo %; cp -R % dist/; }'
	cd dist && find . -name 'manifest.json' -o -name 'options.html' | \
		xargs sed -i '' -e "s/%VERSION%/$$VERSION/g"
	find dist -type f -name ".*" | xargs rm
	cd dist && zip -r ../memrise-button .
	open .

clean:
	rm -f memrise-button.zip
	rm -rf dist/
