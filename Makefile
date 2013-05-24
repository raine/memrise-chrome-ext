.PHONY: all

CHDIR_SHELL := $(SHELL)
define chdir
   $(eval _D=$(firstword $(1) $(@D)))
   $(info $(MAKE): cd $(_D)) $(eval SHELL = cd $(_D); $(CHDIR_SHELL))
endef

all: clean check-version clone
	$(call chdir,build)
	mkdir -p dist/
	find . -maxdepth 1 -type d \( -path ./.git -o -path ./assets -o -path ./dist \) -prune -o \
		-name '*' ! -name '.*' ! -name 'README.md' ! -name 'Makefile' ! -name '*.rb' -print | \
		xargs -I % sh -c '{ echo %; cp -R % dist/; }'
	cd dist && find . -name 'options.html' | \
		xargs sed -i '' -e "s/%VERSION%/$$VERSION/g"
	ruby-1.9.3-p194 manifest_version.rb dist/manifest.json $(VERSION)
	find dist -type f -name ".*" | xargs rm
	marked -o dist/CHANGES.html dist/CHANGES.md
	cd dist && zip -r ../memrise-button .
	zsh -c "setopt extendedglob; rm -rf ^(dist|memrise-button*)"
	open .

clean:
	rm -rf memrise-button*
	rm -rf build/

clone:
	git clone .git build/

publish:
	open https://chrome.google.com/webstore/developer/edit/mahhgdkliaknjffpmocpaglcoljnhodn

check-version:
	if test "$(VERSION)" = "" ; then \
		echo "VERSION not set"; \
		exit 1; \
	fi
