// Province data for the interactive Ireland map (culture view).
// Dialect notes are deliberately broad-strokes and factual — the standard
// three-way division of living Irish dialects, described without ranking.
// `vocab` lists WORDS ids so place/geography terms link straight into the
// review system with real audio.
export const PROVINCES = [
  {
    id: 'ulaidh',
    irish: 'Cúige Uladh',
    english: 'Ulster',
    wordId: 'w147',
    dialect: 'Ulster Irish (Gaeilge Uladh) — spoken in the Donegal Gaeltacht — has its own melody, closer in some ways to Scottish Gaelic: lighter word endings, and stress kept on the first syllable.',
    gaeltacht: 'Gaoth Dobhair, Rann na Feirste and Gleann Cholm Cille in Donegal form one of the strongest Gaeltacht regions.',
    places: [
      { irish: 'Dún na nGall', english: 'Donegal — "fort of the foreigners"' },
      { irish: 'Béal Feirste', english: 'Belfast — "mouth of the sandbank ford"' },
    ],
    vocab: ['w147', 'w154', 'w100'],
  },
  {
    id: 'connachta',
    irish: 'Cúige Chonnacht',
    english: 'Connacht',
    wordId: 'w149',
    dialect: 'Connacht Irish (Gaeilge Chonnacht) — the Connemara and Mayo dialect — is what learners hear most often: much broadcast Irish (TG4, Raidió na Gaeltachta) comes from here.',
    gaeltacht: 'Conamara (Connemara) west of Galway city is the largest Gaeltacht by speakers; also Tourmakeady and Erris in Mayo, and the Aran Islands.',
    places: [
      { irish: 'Gaillimh', english: 'Galway — likely from gall, "stony river"' },
      { irish: 'Oileáin Árann', english: 'the Aran Islands' },
    ],
    vocab: ['w149', 'w153', 'w144', 'w99'],
  },
  {
    id: 'laighin',
    irish: 'Cúige Laighean',
    english: 'Leinster',
    wordId: 'w150',
    dialect: 'Leinster has no surviving traditional dialect — its Irish faded earliest under English rule. Today it has the most new speakers: Dublin\'s schools, clubs and the growing urban Irish scene.',
    gaeltacht: 'No historic Gaeltacht, but Ráth Chairn in Meath is a 1930s "planted" Gaeltacht — Connemara families resettled there, and it still speaks Connacht Irish.',
    places: [
      { irish: 'Baile Átha Cliath', english: 'Dublin — "town of the hurdled ford"' },
      { irish: 'Cill Dara', english: 'Kildare — "church of the oak"' },
    ],
    vocab: ['w150', 'w151', 'w152', 'w159'],
  },
  {
    id: 'mumhain',
    irish: 'Cúige Mumhan',
    english: 'Munster',
    wordId: 'w148',
    dialect: 'Munster Irish (Gaeilge na Mumhan) — Kerry, Cork and Waterford — is known for stressing later syllables of a word (cailín sounds like "col-EEN" here) and keeping some older verb endings.',
    gaeltacht: 'Corca Dhuibhne (the Dingle Peninsula) in Kerry, Múscraí in Cork, and An Rinn in Waterford.',
    places: [
      { irish: 'Corcaigh', english: 'Cork — "marsh"' },
      { irish: 'Trá Lí', english: 'Tralee — "strand of the Lee"' },
    ],
    vocab: ['w148', 'w99', 'w101', 'w22'],
  },
];
