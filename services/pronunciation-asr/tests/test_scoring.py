from asr.scoring import levenshtein, match_candidate, normalize, score_attempt, similarity_ratio


def test_normalize_strips_padding_case_and_period():
    assert normalize(" Dia duit. ") == "dia duit"
    assert normalize("SLÁN") == "slán"


def test_match_candidate_finds_exact_normalized_match():
    candidates = ["tá", "slán", "Dia duit"]
    assert match_candidate(" Tá.", candidates) == "tá"
    assert match_candidate("dia duit", candidates) == "Dia duit"
    assert match_candidate("nonsense", candidates) is None


def test_levenshtein_basic_cases():
    assert levenshtein("", "") == 0
    assert levenshtein("cat", "cat") == 0
    assert levenshtein("cat", "") == 3
    assert levenshtein("cat", "hat") == 1
    assert levenshtein("tá", "slán") == 3


def test_similarity_ratio_bounds():
    assert similarity_ratio("tá", "tá") == 1.0
    assert similarity_ratio("", "") == 1.0
    assert 0.0 <= similarity_ratio("tá", "slán") <= 1.0


def test_score_attempt_rewards_exact_target_match_with_high_confidence():
    result = score_attempt(
        target_text="slán",
        distractor_texts=["tá", "lá", "bán"],
        constrained_heard=" slán.",
        open_text="slán",
        avg_logprob=-0.05,  # near-zero log-prob = high confidence
    )
    assert result.matched == "target"
    assert result.score >= 80


def test_score_attempt_penalizes_distractor_match():
    result = score_attempt(
        target_text="slán",
        distractor_texts=["tá", "lá", "bán"],
        constrained_heard="bán",
        open_text="bán",
        avg_logprob=-0.2,
    )
    assert result.matched == "distractor"
    assert result.score < 50


def test_score_attempt_handles_no_match_gracefully():
    result = score_attempt(
        target_text="slán",
        distractor_texts=["tá", "lá", "bán"],
        constrained_heard="completely unrelated garble",
        open_text="garble",
    )
    assert result.matched == "none"
    assert 0 <= result.score <= 40


def test_score_attempt_without_confidence_or_open_text_still_scores_the_base():
    result = score_attempt(
        target_text="slán",
        distractor_texts=["tá"],
        constrained_heard="slán",
    )
    assert result.matched == "target"
    assert result.score == 65  # base only — no confidence/similarity signal supplied
