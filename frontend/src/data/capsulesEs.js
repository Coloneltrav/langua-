// Culture capsules for the Spanish pack. Most are tagged to a specific
// country (shown only when that accent is active); a few are general
// enough to show regardless of which accent is selected.
export const ES_CAPSULES = [
  {id:'es-c1', title:'Vos, tú, or usted?', category:'Language', difficulty:'beginner', country:null,
   target:['s7'],
   text:"Spanish has more than one word for \"you\". Most of the Spanish-speaking world uses tú informally, but Argentina, Uruguay, and much of Central America use vos instead — with its own verb endings (vos tenés, not tú tienes). Nearly everywhere, usted is the polite/formal form, used with strangers, elders, or in business.",
   quiz:{q:'Which pronoun does Argentina use instead of tú?', options:['vos','usted','vosotros','ustedes'], answer:0}},
  {id:'es-c2', title:'21 Countries, One Language', category:'Geography', difficulty:'beginner', country:null,
   target:['s75'],
   text:"Spanish is an official language in 21 países (countries) across four continents — most of Latin America, Spain, and Equatorial Guinea in Africa. It's the world's second most-spoken native language after Mandarin. Accents, slang, and even some grammar (like vos vs. tú) vary widely, but a Spanish speaker from Madrid and one from Mexico City can understand each other easily.",
   quiz:{q:'Roughly how many countries have Spanish as an official language?', options:['21','5','50','12'], answer:0}},
  {id:'es-c3', title:'Madrid, capital de España', category:'Geography', difficulty:'beginner', country:'es-ES',
   target:['s74'],
   text:"Madrid es la capital de España desde 1561, cuando el rey Felipe II trasladó la corte allí. Está justo en el centro de la península ibérica, la ciudad más alta de Europa Occidental entre las grandes capitales. El Museo del Prado, uno de los mejores museos de arte del mundo, está en Madrid.",
   quiz:{q:'What is the capital of Spain?', options:['Madrid','Barcelona','Sevilla','Valencia'], answer:0}},
  {id:'es-c10', title:'Tapas en Madrid', category:'Language', difficulty:'beginner', country:'es-ES',
   target:['sr-es-6','s17','s138'],
   text:"Peninsular Spanish has two features Latin America doesn't: distinción — pronouncing c (before e/i) and z like the \"th\" in \"think\" — and vosotros, the everyday informal \"you all\" (with its own verb endings: queréis, sois, tenéis), used instead of ustedes for casual groups.",
   quiz:{q:'What does distinción refer to in Peninsular Spanish?', options:['Pronouncing c/z like "th"','A verb tense','A regional accent name only','A type of tapa'], answer:0},
   // Fourth Living Encounter — another everyday-conversation scene (like
   // Buenos Aires), this time built around Spain's two most distinctive,
   // learnable features: distinción and vosotros, heard directly in the
   // dialogue rather than just described.
   encounter: {
     visual: 'madrid-tapas-bar',
     observeTitle: 'A tapas bar near Plaza Mayor',
     teaser: "Order wrong, laugh it off, and find out why Madrid sounds like nowhere else in the Spanish-speaking world.",
     observeNote: 'A composite, everyday scene of ordinary bar Spanish in Madrid — not a specific real conversation.',
     beats: [
       { type: 'narration', text: 'A tapas bar near Plaza Mayor, Madrid. Saturday evening, the bar three-deep with people.' },
       { type: 'line', speaker: 'Your friend', irish: '¿Qué queréis vosotros?', phonetic: 'keh keh-REH-ees boh-SOH-trohs', english: 'What do you all want?' },
       { type: 'line', speaker: 'You', irish: 'Yo quiero un zumo de naranja.', phonetic: 'yoh kee-EH-roh oon THOO-moh deh nah-RAHN-hah', english: 'I want an orange juice.' },
       { type: 'line', speaker: 'The bartender', irish: '¿Un zumo? Aquí solo tenemos cerveza y vino — ¡qué gracioso!', phonetic: 'oon THOO-moh? ah-KEE SOH-loh teh-NEH-mohs ther-VEH-sah ee VEE-noh, keh grah-see-OH-soh', english: "A juice? We've only got beer and wine here — that's a first!" },
       { type: 'narration', text: 'Everyone laughs. You settle for a caña instead — when in Madrid. Zumo, cerveza — both carry that "th" sound distinción gives peninsular Spanish.' },
       { type: 'narration', text: "An hour and several empty plates later, it's time to go." },
       { type: 'line', speaker: 'You', irish: 'Camarero, la cuenta, por favor.', phonetic: 'kah-mah-REH-roh, lah KWEN-tah, por fah-VOR', english: 'Waiter, the check, please.' },
     ],
     participatePrompt: 'The bartender brings a single bill for the whole table. What do you leave for a tip?',
     participateChoices: [
       {
         label: 'A few coins, rounding up the bill.',
         consequence: 'Exactly right for Madrid — locals round up or leave small change, if anything at all.',
       },
       {
         label: '20% of the bill, like back home.',
         consequence: 'The bartender is pleasantly surprised, but no one at the table expected it — tipping generously isn\'t the norm here.',
       },
       {
         label: 'Nothing — the menu prices already felt fair.',
         consequence: 'Completely normal. Spanish service workers earn a proper wage, so tipping is a nice bonus, never an obligation.',
       },
     ],
     reflectPoints: [
       'Distinción: c (before e/i) and z are pronounced like the "th" in "think" in Spain — so zumo, cerveza, and gracias all carry that sound. Latin American Spanish doesn\'t make this distinction.',
       'Vosotros is the everyday informal "you all" in Spain, conjugated uniquely (queréis, sois, tenéis) — Latin America dropped it centuries ago in favor of ustedes for every "you all".',
       'Tipping in Spain is modest and optional — rounding up or leaving small change is normal; there\'s no expected percentage like in the US.',
       'Tapas culture means small plates shared over drinks, often standing at the bar — a caña (small draft beer) is the classic order.',
       'Some Spanish cities, especially in the south like Granada, still serve a free tapa with every drink ordered — though this varies by region and is increasingly rare in big cities.',
     ],
   }},
  {id:'es-c4', title:'Ciudad de México, la megaciudad', category:'Geography', difficulty:'beginner', country:'es-MX',
   target:['s70'],
   text:"Ciudad de México fue construida sobre Tenochtitlan, la capital azteca, en un lago que ya no existe. Hoy es una de las ciudades más grandes del mundo, con más de 20 millones de personas en su área metropolitana. El Zócalo, su plaza central, es una de las plazas públicas más grandes del planeta.",
   quiz:{q:'What ancient city was Ciudad de México built on top of?', options:['Tenochtitlan','Machu Picchu','Cusco','Teotihuacán'], answer:0}},
  {id:'es-c5', title:'Buenos Aires y el tango', category:'Culture', difficulty:'beginner', country:'es-AR',
   target:['s86'],
   text:"El tango nació en los barrios portuarios de Buenos Aires a finales del siglo XIX, mezclando influencias africanas, europeas y criollas. Hoy se baila en milongas (salones de baile) por toda la ciudad, y la UNESCO lo declaró Patrimonio Cultural Inmaterial de la Humanidad en 2009.",
   quiz:{q:'In which city did tango originate?', options:['Buenos Aires','Madrid','Bogotá','Santiago'], answer:0}},
  {id:'es-c9', title:'Un café en Buenos Aires', category:'Language', difficulty:'beginner', country:'es-AR',
   target:['sr-ar-1','s17'],
   text:"In Argentina and Uruguay, you'll rarely hear tú in daily conversation — vos has taken over completely, with its own verb endings: vos tenés (not tú tienes), vos querés (not tú quieres). It's such a core part of rioplatense identity that using tú instead marks you as a foreigner instantly.",
   quiz:{q:'What does "vos tenés" use instead of standard "tú tienes"?', options:['vos + its own verb ending','usted + a formal verb','tú with no change','ustedes'], answer:0},
   // Third Living Encounter, and the first built around an everyday
   // conversation rather than a historical event — proving the format
   // also fits ordinary moments, not just big/heavy ones. Directly
   // demonstrates the vos conjugation the capsule teaches, in use.
   encounter: {
     visual: 'buenos-aires-cafe',
     observeTitle: 'A café on Avenida Corrientes',
     teaser: 'Rain on the window, coffee on the table — and a whole grammar lesson hiding in how the waiter asks what you want.',
     observeNote: 'A composite, everyday scene of ordinary café Spanish in Buenos Aires — not a specific real conversation.',
     ambience: 'rain',
     senseOfPlace: [
       'Rain on the glass.',
       'Low voices, close together.',
       'The smell of coffee, everywhere.',
       'Nobody in a hurry.',
     ],
     beats: [
       { type: 'narration', text: 'A café on Avenida Corrientes, Buenos Aires. Rain outside; the windows are fogged.' },
       { type: 'line', speaker: 'The waiter', irish: '¿Qué querés tomar?', phonetic: 'keh keh-ROHS toh-MAR', english: 'What do you want to drink?' },
       { type: 'line', speaker: 'You', irish: 'Quiero un café con leche, por favor.', phonetic: 'kee-EH-roh oon kah-FEH kon LEH-cheh, por fah-VOR', english: 'I want a coffee with milk, please.' },
       { type: 'line', speaker: 'The waiter', irish: '¿Vos tenés hambre también? Hay medialunas.', phonetic: 'bohs teh-NEHS AHM-breh tam-bee-EN? eye meh-dee-ah-LOO-nahs', english: 'Are you hungry too? We have croissants.' },
       { type: 'narration', text: "You've just heard vos twice — tenés, querés — verb endings you'd never hear in Madrid or Mexico City." },
     ],
     participatePrompt: 'The waiter asks if you want anything else. What do you say?',
     participateChoices: [
       {
         label: 'Sí, dale, una medialuna más. ("Yes, go on, one more croissant.")',
         consequence: 'He laughs — dale is pure Argentine filler, and you\'ve just ordered like a local.',
       },
       {
         label: 'No, así está bien, gracias. ("No, that\'s fine, thanks.")',
         consequence: 'Perfectly polite, perfectly correct — and just a touch too formal for a neighbourhood café like this one.',
       },
       {
         label: '¿Qué me recomendás vos? ("What do you recommend?")',
         consequence: "He grins — you used vos right back at him, unprompted. For the rest of the visit, he treats you like a regular, not a tourist.",
       },
     ],
     reflectPoints: [
       'Vos replaced tú almost entirely in Argentina, Uruguay, and parts of Central America — it\'s not slang there, it\'s the standard second-person singular.',
       'Vos verb forms drop a syllable from the standard tú conjugation and stress the last syllable: tenés (not tienes), querés (not quieres), sos (not eres).',
       'Rioplatense Spanish also pronounces ll and y like the "sh" in "shoe" — so calle sounds closer to "cashe" than "kaye".',
       'Medialunas ("half moons") are Argentina\'s answer to croissants — a standard breakfast and café order.',
     ],
   }},
  {id:'es-c6', title:'Café de Colombia', category:'Culture', difficulty:'beginner', country:'es-CO',
   target:['s76'],
   text:"Colombia es uno de los mayores productores de café del mundo, especialmente en la región del Eje Cafetero. El paisaje cultural cafetero fue declarado Patrimonio de la Humanidad por la UNESCO en 2011, gracias al esfuerzo de generaciones de familias cafeteras en las montañas.",
   quiz:{q:'What is Colombia famous for producing?', options:['Coffee','Wine','Tango','Tequila'], answer:0}},
  {id:'es-c7', title:'Los Andes y el desierto de Atacama', category:'Geography', difficulty:'beginner', country:'es-CL',
   target:['s82'],
   text:"Chile es un país extremadamente largo y delgado — más de 4.000 kilómetros de norte a sur — atrapado entre los Andes y el océano Pacífico. En el norte está el desierto de Atacama, el más seco del mundo; en el sur, glaciares y fiordos de la Patagonia. Pocos países tienen tanta variedad geográfica en un solo territorio.",
   quiz:{q:"What is Chile's shape known for?", options:['Extremely long and narrow','Perfectly round','Very small','Mostly islands'], answer:0}},
  {id:'es-c8', title:'Día de los Muertos', category:'Culture', difficulty:'beginner', country:'es-MX',
   target:['s137','s136'],
   text:"El Día de los Muertos (November 1–2) honra a los familiares que han fallecido — not a sad occasion, but a celebration of remembering them. Families build ofrendas (altars) with photos, food, and cempasúchil (marigold) flowers, whose scent is said to guide spirits home for the night. UNESCO declared it Intangible Cultural Heritage in 2008.",
   quiz:{q:'What does an ofrenda (altar) usually include?', options:['Photos, food, and marigold flowers','Just candles','Nothing, it stays empty','Presents for the living'], answer:0},
   // Second Living Encounter, first for the Spanish pack — same
   // beat-by-beat scene format as An Gorta Mór (see capsulesGa.js/
   // lesson.js), proving the pattern isn't Irish-specific.
   encounter: {
     visual: 'ofrenda-table',
     observeTitle: 'The night before Día de Muertos',
     teaser: 'A grandmother lights candles for the grandfather you never met — and tells you why remembering is the whole point.',
     observeNote: 'A composite, everyday scene of a tradition practiced across Mexico — not one specific family.',
     beats: [
       { type: 'narration', text: "Your family's kitchen table, the night before Día de Muertos. Marigold petals cover the floor." },
       { type: 'line', speaker: 'Your abuela', irish: 'Vamos a recordar a tu abuelo esta noche.', phonetic: 'BAH-mohs ah reh-kor-DAR ah too ah-BWEH-loh EHS-tah NOH-cheh', english: "We're going to remember your grandfather tonight." },
       { type: 'line', speaker: 'You', irish: '¿Por qué ponemos su foto en el altar?', phonetic: 'por keh poh-NEH-mohs soo FOH-toh en el al-TAR', english: 'Why do we put his photo on the altar?' },
       { type: 'line', speaker: 'Your abuela', irish: 'Para que su familia nunca lo olvide.', phonetic: 'PAH-rah keh soo fah-MEE-lyah NOON-kah loh ol-VEE-deh', english: 'So his family never forgets him.' },
       { type: 'narration', text: 'She lights a candle and sets out his favorite comida — pan de muerto and dark coffee.' },
       { type: 'line', speaker: 'Your abuela', irish: 'La muerte no es el final si lo recordamos.', phonetic: 'lah MWER-teh noh ehs el fee-NAL see loh reh-kor-DAH-mohs', english: 'Death is not the end if we remember him.' },
     ],
     participatePrompt: 'What do you add to the altar?',
     participateChoices: [
       {
         label: 'A handwritten letter to him, telling him about this past year.',
         consequence: 'Your abuela reads it over your shoulder and cries a little, smiling. She tucks it under his photo — she says he always liked hearing about family news.',
       },
       {
         label: 'His favorite food — the tamales he always asked for.',
         consequence: 'The kitchen fills with the smell of the tamales he loved. Your abuela says the smell alone brings back more memories of him than anything else could.',
       },
       {
         label: 'A marigold flower collage the kids made at school.',
         consequence: 'Your abuela pins it above the altar. She says cempasúchil have marked this night for generations — old enough that nobody remembers when it started, only that it never stopped.',
       },
     ],
     reflectPoints: [
       'Día de los Muertos (Nov 1–2) honors deceased family members — it is a celebration of remembering them, not a mourning ritual.',
       "Ofrendas (altars) hold photos, favorite foods, and cempasúchil (marigold) flowers, whose scent is believed to guide spirits home for the night.",
       'Despite the calendar proximity to Halloween, the two have separate origins — this tradition blends Indigenous Mexica (Aztec) practices with Catholic All Souls\' Day.',
       'UNESCO declared it Intangible Cultural Heritage of Humanity in 2008.',
     ],
   }},
];
