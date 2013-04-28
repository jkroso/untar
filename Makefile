test:
	@node_modules/.bin/mocha \
		--reporter spec \
		--bail \
		test/index.test.js

.PHONY: test