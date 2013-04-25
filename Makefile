clean:
	rm -r examples/compare-equals
	rm -r examples/compare-type

test:
	node examples/index.js

.PHONY: clean test