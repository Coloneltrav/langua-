from asr.grammar import build_grammar


def test_build_grammar_includes_root_rule_and_all_candidates():
    grammar, canonical = build_grammar(["tá", "slán", "Dia duit"])
    assert grammar.startswith("root ::=")
    assert '"tá"' in grammar
    assert '"slán"' in grammar
    assert '"Dia duit"' in grammar
    assert canonical == ["tá", "slán", "Dia duit"]


def test_build_grammar_deduplicates_and_skips_blanks():
    grammar, canonical = build_grammar(["tá", "  ", "tá", "slán"])
    assert canonical == ["tá", "slán"]


def test_build_grammar_escapes_quotes_and_backslashes():
    grammar, canonical = build_grammar(['weird"word'])
    assert '\\"' in grammar
    assert canonical == ['weird"word']


def test_build_grammar_includes_leading_space_and_period_variants():
    grammar, _ = build_grammar(["slán"])
    assert '" slán"' in grammar
    assert '"slán."' in grammar
