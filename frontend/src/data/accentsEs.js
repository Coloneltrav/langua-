// Country/accent system for the Spanish pack. Picking a country swaps the
// TTS voice, the visual theme, and the culture content — Spanish spoken in
// Madrid, Mexico City, and Buenos Aires is genuinely different, not just a
// cosmetic skin. Five countries widely recognized as having distinct,
// well-known accents; more can be added the same way later.
export const ES_ACCENTS = {
  'es-ES': {
    code: 'es-ES', country: 'España', flag: '🇪🇸', capital: 'Madrid',
    voice: { id: 'es-ES-ElviraNeural', label: 'Elvira (female)' },
    voiceAlt: { id: 'es-ES-AlvaroNeural', label: 'Álvaro (male)' },
    blurb: "Peninsular Spanish is known for distinción — pronouncing c (before e/i) and z like the 'th' in \"think\", not like s — and for using vosotros as the everyday plural \"you\", which Latin America doesn't.",
    regions: ['Madrid', 'Cataluña', 'Andalucía', 'País Vasco', 'Galicia'],
    theme: {
      bg:'#1a1410', surface:'#241c16', surface2:'#2e241c', border:'#3d2f24',
      text:'#f1e9e0', textDim:'#a89a8c', onAccent:'#1a1410',
      accent:'#d4a017', accentBright:'#f0c14b', accentDim:'#a67c0a',
      flagOrange:'#aa151b', rubric:'#aa151b',
      flagStripe: ['#aa151b', '#f1bf00', '#aa151b'],
      motif: 'rings', wordmarkFont: "'Cormorant Garamond', serif",
    },
  },
  'es-MX': {
    code: 'es-MX', country: 'México', flag: '🇲🇽', capital: 'Ciudad de México',
    voice: { id: 'es-MX-DaliaNeural', label: 'Dalia (female)' },
    voiceAlt: { id: 'es-MX-JorgeNeural', label: 'Jorge (male)' },
    blurb: 'Mexican Spanish keeps consonants crisp and is the accent most widely heard in media across the Americas — it drops vosotros entirely in favor of ustedes for every "you all".',
    regions: ['Ciudad de México', 'Jalisco', 'Yucatán', 'Oaxaca', 'Nuevo León'],
    theme: {
      bg:'#12190f', surface:'#1a2416', surface2:'#22301c', border:'#2f4025',
      text:'#eef1e6', textDim:'#9bab8e', onAccent:'#12190f',
      accent:'#2e8b3d', accentBright:'#4cb85f', accentDim:'#1f6b2b',
      flagOrange:'#ce1126', rubric:'#ce1126',
      flagStripe: ['#006847', '#ffffff', '#ce1126'],
      motif: 'rings', wordmarkFont: "'Cormorant Garamond', serif",
    },
  },
  'es-AR': {
    code: 'es-AR', country: 'Argentina', flag: '🇦🇷', capital: 'Buenos Aires',
    voice: { id: 'es-AR-ElenaNeural', label: 'Elena (female)' },
    voiceAlt: { id: 'es-AR-TomasNeural', label: 'Tomás (male)' },
    blurb: 'Rioplatense Spanish uses vos instead of tú (with its own verb endings — vos tenés, not tú tienes) and pronounces ll/y like the "sh" in "shoe", both giveaways of the Buenos Aires accent.',
    regions: ['Buenos Aires', 'Córdoba', 'Mendoza', 'Patagonia', 'Santa Fe'],
    theme: {
      bg:'#141a24', surface:'#1c2530', surface2:'#26313e', border:'#374252',
      text:'#eaf1f8', textDim:'#93a5b8', onAccent:'#141a24',
      accent:'#3f8de3', accentBright:'#6fb0f2', accentDim:'#2c6bb0',
      flagOrange:'#f6b40e', rubric:'#75aadb',
      flagStripe: ['#75aadb', '#ffffff', '#75aadb'],
      motif: 'rings', wordmarkFont: "'Cormorant Garamond', serif",
    },
  },
  'es-CO': {
    code: 'es-CO', country: 'Colombia', flag: '🇨🇴', capital: 'Bogotá',
    voice: { id: 'es-CO-SalomeNeural', label: 'Salomé (female)' },
    voiceAlt: { id: 'es-CO-GonzaloNeural', label: 'Gonzalo (male)' },
    blurb: "Bogotá Spanish is often cited as one of the clearest, most evenly-paced accents in Latin America, though the country's regions (coast, interior, Amazon) vary widely from each other.",
    regions: ['Bogotá', 'Antioquia', 'Valle del Cauca', 'Costa Caribe', 'Eje Cafetero'],
    theme: {
      bg:'#1a1710', surface:'#251f16', surface2:'#302920', border:'#42392a',
      text:'#f2ecdf', textDim:'#a89e88', onAccent:'#1a1710',
      accent:'#e8b800', accentBright:'#ffd23f', accentDim:'#b08e00',
      flagOrange:'#003893', rubric:'#ce1126',
      flagStripe: ['#fcd116', '#003893', '#ce1126'],
      motif: 'rings', wordmarkFont: "'Cormorant Garamond', serif",
    },
  },
  'es-CL': {
    code: 'es-CL', country: 'Chile', flag: '🇨🇱', capital: 'Santiago',
    voice: { id: 'es-CL-CatalinaNeural', label: 'Catalina (female)' },
    voiceAlt: { id: 'es-CL-LorenzoNeural', label: 'Lorenzo (male)' },
    blurb: 'Chilean Spanish is fast and dense with its own slang (po, cachai, al tiro) and often softens or drops the s at the end of syllables — famously tricky for other Spanish speakers to follow at full speed.',
    regions: ['Santiago', 'Valparaíso', 'Patagonia chilena', 'Norte Grande', 'Los Lagos'],
    theme: {
      bg:'#161a1c', surface:'#1f2528', surface2:'#283034', border:'#39434a',
      text:'#eef2f3', textDim:'#96a3a8', onAccent:'#161a1c',
      accent:'#3a6fd8', accentBright:'#6a94ea', accentDim:'#2a51a3',
      flagOrange:'#d52b1e', rubric:'#d52b1e',
      flagStripe: ['#ffffff', '#d52b1e', '#0039a6'],
      motif: 'rings', wordmarkFont: "'Cormorant Garamond', serif",
    },
  },
};

export const ES_ACCENT_ORDER = ['es-ES', 'es-MX', 'es-AR', 'es-CO', 'es-CL'];
export const ES_DEFAULT_ACCENT = 'es-ES';

// A small, well-documented set of everyday words that genuinely differ by
// country — not an attempt to duplicate the whole vocabulary per accent,
// just the well-known cases learners actually run into when they travel or
// switch media between Spanish-speaking countries.
export const ES_REGIONAL_VOCAB = {
  'es-ES': [
    {concept:'car', term:'coche', note:'"carro" sounds Latin American here'},
    {concept:'computer', term:'ordenador', note:'"computadora" is the Latin American term'},
    {concept:'cell phone', term:'móvil', note:'"celular" is used across Latin America'},
    {concept:'to drive', term:'conducir', note:'"manejar" is more common in the Americas'},
    {concept:'potato chips', term:'patatas fritas', note:'"papas fritas" everywhere else'},
    {concept:'juice', term:'zumo', note:'"jugo" in Latin America'},
  ],
  'es-MX': [
    {concept:'car', term:'carro', note:'also "coche" — both used in Mexico'},
    {concept:'computer', term:'computadora', note:'"ordenador" is the Spain term'},
    {concept:'cell phone', term:'celular', note:'"móvil" in Spain'},
    {concept:'straw (for drinking)', term:'popote', note:'"pajita"/"sorbete" elsewhere'},
    {concept:'bus', term:'camión', note:'means "truck" in most other countries!'},
    {concept:'child/kid', term:'chamaco', note:'colloquial, very Mexican'},
  ],
  'es-AR': [
    {concept:'you (informal)', term:'vos', note:'with its own verb forms: vos tenés, vos sos, vos hablás'},
    {concept:'car', term:'auto', note:'"coche" is understood but sounds foreign'},
    {concept:'bus', term:'colectivo', note:'unique to the Río de la Plata region'},
    {concept:'cell phone', term:'celular', note:'same as most of Latin America'},
    {concept:'guy/dude', term:'che', note:"iconic filler word/address term — Argentina's verbal fingerprint"},
    {concept:'to grab/take', term:'agarrar', note:'used constantly in everyday speech'},
  ],
  'es-CO': [
    {concept:'okay/cool', term:'listo', note:'used constantly to mean "okay, got it, done"'},
    {concept:'straw', term:'pitillo', note:'"pajita"/"popote" elsewhere'},
    {concept:'guy/dude', term:'parce', note:'very Colombian, roughly "buddy/mate"'},
    {concept:'car', term:'carro', note:'like most of Latin America, not "coche"'},
    {concept:'money (slang)', term:'plata', note:'widely used informally for money'},
    {concept:'thanks a lot', term:'muchas gracias', note:'often shortened to just "gracias, pues"'},
  ],
  'es-CL': [
    {concept:'you know? (filler)', term:'cachai', note:'from "cachar" — extremely characteristic of Chilean speech'},
    {concept:'right away', term:'al tiro', note:'uniquely Chilean idiom'},
    {concept:'dude/man (filler)', term:'po', note:'tacked onto sentences constantly, e.g. "sí po"'},
    {concept:'car', term:'auto', note:'like Argentina, not "coche"'},
    {concept:'cell phone', term:'celular', note:'same as most of Latin America'},
    {concept:'kid', term:'cabro/cabra', note:'colloquial for boy/girl, very Chilean'},
  ],
};
