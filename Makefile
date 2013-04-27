clean:
	rm -r test/compare-equals
	rm -r test/compare-type

test:
	node test/index.js

.PHONY: clean test