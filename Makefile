.PHONY: all

all: clean check-version
	mkdir -p dist/
	find . -maxdepth 1 -type d \( -path ./.git -o -path ./assets -o -path ./dist \) -prune -o \
		-name '*' ! -name '.*' ! -name 'README.md' ! -name 'Makefile' ! -name '*.rb' -print | \
		xargs -I % sh -c '{ echo %; cp -R % dist/; }'
	cd dist && find . -name 'options.html' | \
		xargs sed -i '' -e "s/%VERSION%/$$VERSION/g"
	ruby manifest_version.rb dist/manifest.json $(VERSION)
	find dist -type f -name ".*" | xargs rm
	cd dist && zip -r ../memrise-button .
	open .

clean:
	rm -rf memrise-button*
	rm -rf dist/

publish:
	open https://chrome.google.com/webstore/developer/edit/mahhgdkliaknjffpmocpaglcoljnhodn

check-version:
	if test "$(VERSION)" = "" ; then \
		echo "VERSION not set"; \
		exit 1; \
	fi
