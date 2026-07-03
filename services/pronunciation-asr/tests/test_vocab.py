from asr.vocab import load_vocab, vocab_by_id


def test_load_vocab_reads_the_shared_source_of_truth():
    words = load_vocab()
    assert len(words) == 181
    assert all({"id", "irish", "english", "phonetic"} <= w.keys() for w in words)


def test_vocab_by_id_indexes_every_word():
    by_id = vocab_by_id()
    assert by_id["w1"]["irish"] == "tá"
    assert len(by_id) == len(load_vocab())
