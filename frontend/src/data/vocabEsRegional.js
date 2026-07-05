// Accent-specific vocabulary: real words that only exist (or only mean
// this) in one Spanish-speaking country's everyday usage. These are
// ADDED to the shared ES_WORDS core list for whichever accent is active
// (see languagePacks.js's getWords), so picking a different country
// genuinely changes what you're taught — not just the theme and voice.
// Kept in sync with the "words that differ" panel in accentsEs.js.
export const ES_REGIONAL_WORDS = {
  'es-ES': [
    {id:'sr-es-1', irish:'coche', english:'car', pos:'noun', example_ga:'Voy al trabajo en coche.', example_en:'I go to work by car.', chunk:'el coche', freq:201, phonetic:'KOH-cheh'},
    {id:'sr-es-2', irish:'ordenador', english:'computer', pos:'noun', example_ga:'Necesito un ordenador nuevo.', example_en:'I need a new computer.', chunk:'el ordenador', freq:202, phonetic:'or-deh-nah-DOR'},
    {id:'sr-es-3', irish:'móvil', english:'cell phone', pos:'noun', example_ga:'¿Me dejas tu móvil?', example_en:'Can I use your phone?', chunk:'el móvil', freq:203, phonetic:'MOH-veel'},
    {id:'sr-es-4', irish:'conducir', english:'to drive', pos:'verb', example_ga:'No sé conducir todavía.', example_en:"I don't know how to drive yet.", chunk:'conducir un coche', freq:204, phonetic:'kon-doo-SEER'},
    {id:'sr-es-5', irish:'patatas fritas', english:'potato chips / fries', pos:'noun', example_ga:'Ponme una ración de patatas fritas.', example_en:'Get me an order of fries.', chunk:'patatas fritas', freq:205, phonetic:'pah-TAH-tahs FREE-tahs'},
    {id:'sr-es-6', irish:'zumo', english:'juice', pos:'noun', example_ga:'Un zumo de naranja, por favor.', example_en:'An orange juice, please.', chunk:'zumo de naranja', freq:206, phonetic:'THOO-moh'},
  ],
  'es-MX': [
    {id:'sr-mx-1', irish:'carro', english:'car', pos:'noun', example_ga:'Fuimos al centro en carro.', example_en:'We went downtown by car.', chunk:'el carro', freq:211, phonetic:'KAH-rroh'},
    {id:'sr-mx-2', irish:'computadora', english:'computer', pos:'noun', example_ga:'Mi computadora es muy vieja.', example_en:'My computer is very old.', chunk:'la computadora', freq:212, phonetic:'kom-poo-tah-DOH-rah'},
    {id:'sr-mx-3', irish:'celular', english:'cell phone', pos:'noun', example_ga:'Se me olvidó el celular en casa.', example_en:'I forgot my phone at home.', chunk:'el celular', freq:213, phonetic:'seh-loo-LAR'},
    {id:'sr-mx-4', irish:'popote', english:'drinking straw', pos:'noun', example_ga:'¿Me pasas un popote?', example_en:'Can you pass me a straw?', chunk:'un popote', freq:214, phonetic:'poh-POH-teh'},
    {id:'sr-mx-5', irish:'camión', english:'bus (in Mexico)', pos:'noun', example_ga:'Tomo el camión todos los días.', example_en:'I take the bus every day.', chunk:'el camión', freq:215, phonetic:'kah-mee-OHN'},
    {id:'sr-mx-6', irish:'chamaco', english:'kid (colloquial)', pos:'noun', example_ga:'Ese chamaco es muy listo.', example_en:'That kid is very smart.', chunk:'el chamaco', freq:216, phonetic:'chah-MAH-koh'},
  ],
  'es-AR': [
    {id:'sr-ar-1', irish:'vos', english:'you (informal, Río de la Plata)', pos:'pronoun', example_ga:'¿Vos tenés hambre?', example_en:'Are you hungry?', chunk:'vos tenés', freq:221, phonetic:'bohs'},
    {id:'sr-ar-2', irish:'auto', english:'car', pos:'noun', example_ga:'Vinimos en auto.', example_en:'We came by car.', chunk:'el auto', freq:222, phonetic:'OW-toh'},
    {id:'sr-ar-3', irish:'colectivo', english:'city bus', pos:'noun', example_ga:'Tomé el colectivo 60.', example_en:'I took the 60 bus.', chunk:'el colectivo', freq:223, phonetic:'koh-lek-TEE-voh'},
    {id:'sr-ar-4', irish:'celular', english:'cell phone', pos:'noun', example_ga:'Dejé el celular cargando.', example_en:'I left my phone charging.', chunk:'el celular', freq:224, phonetic:'seh-loo-LAR'},
    {id:'sr-ar-5', irish:'che', english:'hey / dude', pos:'interjection', example_ga:'Che, ¿qué hacés?', example_en:"Hey, what's up?", chunk:'che, boludo', freq:225, phonetic:'cheh'},
    {id:'sr-ar-6', irish:'agarrar', english:'to grab / take', pos:'verb', example_ga:'Agarrá la mochila.', example_en:'Grab the backpack.', chunk:'agarrar algo', freq:226, phonetic:'ah-gah-RRAR'},
  ],
  'es-CO': [
    {id:'sr-co-1', irish:'listo', english:'okay / got it', pos:'interjection', example_ga:'¿Listo? Nos vemos mañana.', example_en:'Got it? See you tomorrow.', chunk:'listo, pues', freq:231, phonetic:'LEES-toh'},
    {id:'sr-co-2', irish:'pitillo', english:'drinking straw', pos:'noun', example_ga:'¿Me regala un pitillo?', example_en:'Could I get a straw?', chunk:'un pitillo', freq:232, phonetic:'pee-TEE-yoh'},
    {id:'sr-co-3', irish:'parce', english:'buddy / mate', pos:'noun', example_ga:'¿Qué más, parce?', example_en:"What's up, buddy?", chunk:'quiubo parce', freq:233, phonetic:'PAR-seh'},
    {id:'sr-co-4', irish:'carro', english:'car', pos:'noun', example_ga:'Dejé el carro en el parqueadero.', example_en:'I left the car in the parking lot.', chunk:'el carro', freq:234, phonetic:'KAH-rroh'},
    {id:'sr-co-5', irish:'plata', english:'money (informal)', pos:'noun', example_ga:'No tengo plata ahorita.', example_en:"I don't have money right now.", chunk:'tener plata', freq:235, phonetic:'PLAH-tah'},
    {id:'sr-co-6', irish:'qué pena', english:"sorry / how embarrassing (Colombian apology)", pos:'phrase', example_ga:'Qué pena, se me hizo tarde.', example_en:"Sorry, I'm running late.", chunk:'qué pena con usted', freq:236, phonetic:'keh PEH-nah'},
  ],
  'es-CL': [
    {id:'sr-cl-1', irish:'cachai', english:'you know? (filler)', pos:'interjection', example_ga:'Está lloviendo mucho, ¿cachai?', example_en:"It's raining a lot, you know?", chunk:'¿cachai?', freq:241, phonetic:'kah-CHAI'},
    {id:'sr-cl-2', irish:'al tiro', english:'right away', pos:'phrase', example_ga:'Voy al tiro.', example_en:"I'm going right away.", chunk:'al tiro', freq:242, phonetic:'ahl TEE-roh'},
    {id:'sr-cl-3', irish:'po', english:'filler word (emphasis)', pos:'interjection', example_ga:'Sí, po.', example_en:'Yeah, of course.', chunk:'sí po', freq:243, phonetic:'poh'},
    {id:'sr-cl-4', irish:'auto', english:'car', pos:'noun', example_ga:'Andamos en auto.', example_en:'We get around by car.', chunk:'el auto', freq:244, phonetic:'OW-toh'},
    {id:'sr-cl-5', irish:'celular', english:'cell phone', pos:'noun', example_ga:'Perdí mi celular.', example_en:'I lost my phone.', chunk:'el celular', freq:245, phonetic:'seh-loo-LAR'},
    {id:'sr-cl-6', irish:'cabro/cabra', english:'kid / young person', pos:'noun', example_ga:'Los cabros están jugando afuera.', example_en:'The kids are playing outside.', chunk:'los cabros chicos', freq:246, phonetic:'KAH-broh'},
  ],
};
