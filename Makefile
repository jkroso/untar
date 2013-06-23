
test: node_modules
	@node_modules/.bin/mocha \
		--reporter spec \
		--bail \
		test/index.test.js

node_modules: package.json
	@npm i
	@touch node_modules

.PHONY: test