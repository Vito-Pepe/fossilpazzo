# Come il Makefile degli esempi dell'SDK, ma senza push e install (niente adb):
# si compila con  bash strumenti/compila.sh apps/lightTestApp
identifier := $(shell jq -r '.identifier' build/app.json)

source_file := app.js
snapshot_file := build/files/code/${identifier}
tools_dir := $(if $(WATCH_SDK_PATH),$(WATCH_SDK_PATH),../../sdk/)
package_path := build/${identifier}.wapp

.PHONY: build compile pack clean

build: compile pack

compile:
	mkdir -p build/files/code build/files/config build/files/icons build/files/layout build/files/display_name
	jerry-snapshot generate -f '' ${source_file} -o ${snapshot_file}

pack:
	python3 ${tools_dir}tools/pack.py -i build/ -o ${package_path}

clean:
	rm -f build/files/code/* build/*.wapp
