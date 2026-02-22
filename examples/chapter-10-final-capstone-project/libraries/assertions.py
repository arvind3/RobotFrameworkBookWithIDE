def assert_text_contains(text, expected):
    if expected not in text:
        raise AssertionError(f"Expected '{expected}' in '{text}'")
