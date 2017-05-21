include node_modules/@mathieudutour/js-fatigue/Makefile

test: lint
	echo "  $(P) Testing"
	NODE_ENV=test $(BIN_DIR)/ava $(TEST_TARGET)

test-watch:
	echo "  $(P) Testing forever"
	NODE_ENV=test $(BIN_DIR)/ava --watch $(TEST_TARGET)
