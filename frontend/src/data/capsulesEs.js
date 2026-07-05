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
  {id:'es-c4', title:'Ciudad de México, la megaciudad', category:'Geography', difficulty:'beginner', country:'es-MX',
   target:['s70'],
   text:"Ciudad de México fue construida sobre Tenochtitlan, la capital azteca, en un lago que ya no existe. Hoy es una de las ciudades más grandes del mundo, con más de 20 millones de personas en su área metropolitana. El Zócalo, su plaza central, es una de las plazas públicas más grandes del planeta.",
   quiz:{q:'What ancient city was Ciudad de México built on top of?', options:['Tenochtitlan','Machu Picchu','Cusco','Teotihuacán'], answer:0}},
  {id:'es-c5', title:'Buenos Aires y el tango', category:'Culture', difficulty:'beginner', country:'es-AR',
   target:['s86'],
   text:"El tango nació en los barrios portuarios de Buenos Aires a finales del siglo XIX, mezclando influencias africanas, europeas y criollas. Hoy se baila en milongas (salones de baile) por toda la ciudad, y la UNESCO lo declaró Patrimonio Cultural Inmaterial de la Humanidad en 2009.",
   quiz:{q:'In which city did tango originate?', options:['Buenos Aires','Madrid','Bogotá','Santiago'], answer:0}},
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
