
test: node_modules
	@node_modules/mocha/bin/mocha test/*.test.js \
		--reporter dot \
		--bail

node_modules: package.json
	@packin install --meta $< --folder $@

.PHONY: test
