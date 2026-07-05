// Each capsule teaches Ireland through language: mostly English, with a
// handful of Irish target words woven in and glossed. Facts here are kept
// deliberately factual/neutral, especially the Northern Ireland capsule —
// history and current politics are summarized, not editorialized.
export const GA_CAPSULES = [
  {id:'c1', title:'Éire — Ireland', category:'Geography', difficulty:'beginner',
   target:['w143','w144'],
   text:"Éire is the Irish name for Ireland. Ireland is an oileán — an island — sitting in the Atlantic just west of Great Britain. Irish speakers use Éire constantly: it's on coins, passports, and is simply the country's own name for itself.",
   quiz:{q:'What does “oileán” mean?', options:['Island','County','River','King'], answer:0}},
  {id:'c2', title:'The Four Provinces', category:'Geography', difficulty:'beginner',
   target:['w146','w147','w148','w149','w150'],
   text:"Ireland has traditionally been divided into four cúigí — provinces: Cúige Uladh (Ulster) in the north, Cúige Chonnacht (Connacht) in the west, Cúige Laighean (Leinster) in the east, and Cúige Mumhan (Munster) in the south. They aren't official administrative units today, but they're still everywhere — especially in sport, where county teams compete within their cúige.",
   quiz:{q:'Which province is in the west?', options:['Cúige Chonnacht (Connacht)','Cúige Uladh (Ulster)','Cúige Laighean (Leinster)','Cúige Mumhan (Munster)'], answer:0}},
  {id:'c3', title:'The Counties', category:'Counties', difficulty:'beginner',
   target:['w145'],
   text:"Ireland is divided into 32 contaetha — counties. 26 make up the Republic of Ireland, and 6 make up Northern Ireland. Counties predate the modern state by centuries and are still the basis for local identity, sports rivalries, and postal addresses.",
   quiz:{q:'How many counties are on the island of Ireland?', options:['32','4','26','6'], answer:0}},
  {id:'c4', title:'Dublin / Baile Átha Cliath', category:'Geography', difficulty:'beginner', province:'laighin',
   target:['w151','w152'],
   text:"Baile Átha Cliath — literally 'town of the hurdled ford' — is the Irish name for Dublin, the príomhchathair (capital city) of the Republic of Ireland. It sits on the east coast, at the mouth of the River Liffey.",
   quiz:{q:'What is the Irish name for Dublin?', options:['Baile Átha Cliath','Gaillimh','Cúige Laighean','An Ghaeltacht'], answer:0}},
  {id:'c5', title:'Galway / Gaillimh', category:'Geography', difficulty:'beginner', province:'connachta',
   target:['w153'],
   text:"Gaillimh (Galway) is a city on Ireland's west coast, known for its arts scene, festivals, and closeness to the Connemara Gaeltacht. It's one of the places you're most likely to hear Irish spoken casually on the street.",
   quiz:{q:'Which part of Ireland is Gaillimh in?', options:['The west','The east','The north','The south'], answer:0}},
  {id:'c6', title:'The Gaeltacht', category:'Gaeltacht', difficulty:'intermediate',
   target:['w154','w155'],
   text:"A Ghaeltacht is a region — mostly along the west coast, in places like Donegal, Connemara, and Kerry — where Irish remains the everyday community language, not just a school subject. Labhraítear Gaeilge sa Ghaeltacht: Irish is spoken in the Gaeltacht, at home and in daily life, by the local pobal (community).",
   quiz:{q:'What is a Gaeltacht?', options:['A region where Irish is the community language','A type of county','A river','A province'], answer:0}},
  {id:'c7', year:432, title:'Saint Patrick', category:'Mythology', difficulty:'beginner',
   target:['w156','w157'],
   text:"Naomh Pádraig — Saint Patrick — is Ireland's patron saint, traditionally credited with bringing Christianity to Ireland in the 5th century. Lá Fhéile Pádraig, March 17th, is Ireland's national holiday. The famous story of him driving snakes out of Ireland is a legend, not history — Ireland likely never had snakes to begin with.",
   quiz:{q:'What is Naomh Pádraig in English?', options:['Saint Patrick','Saint Brigid','A Viking king','A province'], answer:0},
   // Living Encounter drawn from Patrick's own Confessio — one of the only
   // surviving first-person accounts from 5th-century Britain or Ireland.
   // A striking parallel for this app specifically: a captive Briton
   // learning enough Irish to get by, out of necessity, on a cold
   // hillside — not so different from why someone opens this app.
   encounter: {
     visual: 'slemish-shepherd',
     observeTitle: 'Sliabh Mis, County Antrim — 5th century',
     teaser: "Six years enslaved on a cold mountainside. Then, one night, a voice that isn't his master's.",
     observeNote: "Grounded in Patrick's own Confessio, his surviving first-person account — the only detailed source for his life, written in his own admittedly rough Latin.",
     senseOfPlace: [
       'Wind with nothing to stop it.',
       'Wet wool and cold hands.',
       'A mountain that isn\'t yours, and isn\'t going anywhere.',
     ],
     beats: [
       { type: 'narration', text: "Sliabh Mis. Six years since Irish raiders took you from Britain at sixteen. You tend another man's sheep now, half-starved, and you've stopped counting the days." },
       { type: 'line', speaker: 'The chieftain, from below', irish: 'Tabhair na caoirigh isteach! Tá stoirm ag teacht.', phonetic: 'TOOR nuh KEER-ig ISH-tchuh! Taw STIR-em egg TCHAHK-tin', english: 'Bring the sheep in! A storm is coming.' },
       { type: 'narration', text: "You understand him without thinking now — six years does that to a language. Alone with the flock again that night, the same dream returns: a voice, calling you home to a country you've never actually lived in." },
       { type: 'narration', text: '"The ship is ready," the voice says. Two hundred miles away, at a harbour you\'ve never seen, with nothing but the clothes on your back.' },
     ],
     participatePrompt: "The voice said the ship is ready — two hundred miles off, through land that was never yours, with everything to lose if you're caught. What do you do?",
     participateChoices: [
       {
         label: 'Leave that night, trusting the dream completely.',
         consequence: "This is what he actually did. He walked roughly two hundred miles, found the ship, and was refused passage at first — the captain only relented after Patrick pressed him. He made it home to Britain, and years later, went back to Ireland by choice.",
       },
       {
         label: 'Wait a few days to plan supplies and a safer route.',
         consequence: "A few days pass. The chieftain notices you've gone quiet and withdrawn, and starts watching you more closely at exactly the wrong moment — the window the dream promised may not stay open.",
       },
       {
         label: "Tell no one, and stay — six years is what you know now.",
         consequence: "You stay. Whatever called you that night doesn't come back. History remembers the version where he left; this quieter version, where a nameless shepherd lived out his life on Sliabh Mis, is the one that almost happened instead.",
       },
     ],
     reflectPoints: [
       "Patrick's own account, the Confessio, is one of the only surviving personal writings from 5th-century Britain or Ireland — he apologizes in it for his rough Latin, having had his education interrupted at sixteen.",
       'He was captured by Irish raiders at sixteen and enslaved for six years, traditionally on or near Sliabh Mis (Slemish), County Antrim, tending sheep.',
       'He described a dream of a voice — later a letter headed "the voice of the Irish" — calling him back, and walked roughly 200 miles to reach a waiting ship after his escape.',
       'He returned to Ireland years later by choice, this time as a missionary bishop — driven, in his own words, by that same voice.',
       'Most of the familiar legend — driving out snakes, the shamrock explaining the Trinity — dates from centuries after his death, not from anything he wrote himself.',
     ],
     primarySource: {
       text: "I read the beginning of the letter, and it contained the words, 'The voice of the Irish.' And as I read out the beginning of the letter I thought that at that moment I heard the voice of those very people who were near the wood of Foclut.",
       attribution: 'Saint Patrick, Confessio, section 23 (5th century)',
     },
   }},
  {id:'c8', year:795, title:'The Vikings in Ireland', category:'History', difficulty:'intermediate',
   target:['w158','w159'],
   text:"The Lochlannaigh — Vikings — began raiding Ireland's coast in the late 8th century, starting around 795 CE. Over time they shifted from raiding to settling, founding or expanding many of Ireland's major coastal cities, including Dublin, Waterford, Wexford, Cork, and Limerick.",
   quiz:{q:'What were the Lochlannaigh known for founding in Ireland?', options:['Coastal trading cities like Dublin','The Gaeltacht regions','The four provinces','The Irish constitution'], answer:0},
   // Living Encounter opening on the actual first recorded raid (795 CE),
   // then bridging forward in the same scene to the founding of Dublin as
   // a longphort in 841 — the "raiding to settling" arc the capsule's own
   // text describes, and where the second target word (cathair) belongs.
   encounter: {
     visual: 'rathlin-raid',
     observeTitle: 'Rathlin Island, 795 CE',
     teaser: 'Ships on the horizon at dawn, and only minutes to decide what a monastery is worth saving.',
     observeNote: 'Grounded in the earliest recorded Viking raid on Ireland, at Rathlin — the specific monks and moment are illustrative, not a verified record.',
     beats: [
       { type: 'narration', text: 'Rathlin Island, off the north coast. Dawn. The bell hasn\'t rung yet, but you\'ve already seen what\'s coming across the water.' },
       { type: 'line', speaker: 'A fellow monk, running', irish: 'Longa! Tá na Lochlannaigh ag teacht!', phonetic: 'LONG-uh! taw nuh LOKH-lun-igh egg TCHAHK-tin', english: 'Ships! The Vikings are coming!' },
       { type: 'narration', text: "There's no wall here, no soldiers — just a bell, a handful of monks, and whatever this monastery has spent generations gathering." },
       { type: 'narration', text: 'Decades later, some of those same raiders\' grandchildren would build a winter camp at the mouth of a river to the south. It would grow into a cathair — a city. Baile Átha Cliath. Dublin.' },
     ],
     participatePrompt: "The ships are minutes from shore. What do you save first?",
     participateChoices: [
       {
         label: 'The illuminated gospel book, generations in the making.',
         consequence: "You run with it inland, into the bog country. Manuscripts like this one are exactly why some of Ireland's greatest illustrated books — like the Book of Kells — survive today: monks who ran rather than fought.",
       },
       {
         label: "Ring the bell as long as you can, to warn the rest of the island.",
         consequence: "The warning reaches a few households in time to scatter into the hills. You're among the last off the grounds — it costs you almost everything but time.",
       },
       {
         label: 'Run for the shore path yourself, immediately.',
         consequence: "You survive. It isn't heroic, and you know it — but Rathlin's monks who lived to tell of this raid are the only reason anyone wrote it down at all.",
       },
     ],
     reflectPoints: [
       "The first recorded Viking raid on Ireland struck Rathlin Island in 795 CE — the annals call it \"the burning of Rechru by heathens\" — the same year islands off Sligo and Galway were also hit.",
       'Monasteries were targeted because they were Ireland\'s main concentrations of portable wealth — precious metalwork, relics, manuscripts — and had no military defence.',
       'Round towers are popularly believed to have been built as refuges against exactly this kind of raid, but most were actually built well after the main raiding period, mainly as bell towers and treasuries — a few even became death traps when monks were caught inside during rarer, later attacks.',
       'Dublin began in 841 CE as a longphort — a Viking winter naval camp — used first for raiding and slave-trading before growing into the most important trading city in the western Viking world.',
       'Vikings founded or expanded most of Ireland\'s major port cities — Dublin, Waterford, Wexford, Cork, and Limerick — and, over generations, settled, intermarried, and were absorbed into Irish society.',
     ],
   }},
  {id:'c9', year:1916, title:'The Easter Rising', category:'History', difficulty:'intermediate',
   target:['w160','w161','w162'],
   text:"Éirí Amach na Cásca — the Easter Rising — was an armed uprising against British rule in Dublin during Easter week, 1916. It was militarily defeated within a week, but the British response hardened public support for saoirse — freedom — and full independence in the years that followed.",
   quiz:{q:'In what year did Éirí Amach na Cásca happen?', options:['1916','1921','1949','1845'], answer:0},
   // Second Living Encounter for the Irish pack — same beat-by-beat scene
   // format as An Gorta Mór, applied to a different kind of moment
   // (a single Easter Monday, not a years-long catastrophe) to test that
   // the pattern flexes rather than only fitting one story shape.
   encounter: {
     visual: 'dublin-1916',
     observeTitle: 'Dublin, Easter Monday, 1916',
     teaser: "Gunfire on the streets outside. A brother who won't stay, and a mother who can't stop him.",
     observeNote: 'An illustrative household scene grounded in real, well-documented events of Easter Week — not a specific verified family.',
     senseOfPlace: [
       'Bells, then gunfire, then bells again.',
       'Boots on cobblestone, somewhere close.',
       'A pot of tea going cold on the table.',
     ],
     beats: [
       { type: 'narration', text: 'Dublin, Easter Monday, 1916. Church bells still ring, but gunfire has already started near the GPO.' },
       { type: 'line', speaker: 'Your brother', irish: 'Caithfidh mé dul. Tá mé ag troid ar son saoirse.', phonetic: 'KAH-hee meh dull. Taw meh egg TRID air suhn SEER-sheh', english: "I have to go. I'm fighting for freedom." },
       { type: 'line', speaker: 'Your mother', irish: 'Fan anseo, le do thoil.', phonetic: 'fon un-SHOH, leh duh HULL', english: 'Stay here, please.' },
       { type: 'narration', text: "He presses something wrapped in an old coat into your hands before he leaves — his rifle. 'Keep it safe,' he says, and is gone." },
       { type: 'narration', text: 'He goes anyway. By Saturday, the Rising is over — crushed within a week.' },
       { type: 'line', speaker: 'Your brother, from Kilmainham Gaol, days later', irish: 'Ní bhfuaireamar an phoblacht an tseachtain seo. Ach gheobhaimid saoirse fós.', phonetic: 'nee VOO-ur-a-mar un FUB-lukht un CHAHK-tin shuh. Ahkh YOH-vim-id SEER-sheh fohss', english: "We didn't win the republic this week. But we'll still win freedom." },
     ],
     participatePrompt: 'Soldiers are searching houses on your street. What do you do with the rifle he left behind?',
     participateChoices: [
       {
         label: 'Hide it under the floorboards and say nothing.',
         consequence: "The search passes over your house. Weeks later, executions at Kilmainham Gaol turn public opinion your brother's way — the very opinion he'd hoped for.",
       },
       {
         label: 'Bury it in the garden overnight.',
         consequence: "You bury it before dawn. It isn't found for sixty years, when a new owner digs up the garden and hands it to a local museum.",
       },
       {
         label: 'Turn it in and tell the soldiers everything you know.',
         consequence: 'The soldiers take the rifle and note your name. Neighbours whisper about it for years — but your brother comes home eventually anyway; the executions did more for saoirse than any single rifle.',
       },
     ],
     reflectPoints: [
       'Éirí Amach na Cásca lasted six days (24–29 April 1916) and was militarily defeated — the rebel leaders surrendered unconditionally.',
       "British forces executed 16 of the Rising's leaders by firing squad over the following weeks, which shocked Irish public opinion and hardened support for full independence.",
       'Support for Irish nationalism, previously a minority position, grew sharply after the Rising — feeding directly into the War of Independence (1919–1921).',
       "The GPO (General Post Office) on O'Connell Street, the rebels' headquarters, still bears bullet-scarred pillars today.",
     ],
     primarySource: {
       text: 'Irishmen and Irishwomen: In the name of God and of the dead generations from which she receives her old tradition of nationhood, Ireland, through us, summons her children to her flag and strikes for her freedom.',
       attribution: 'Opening line, Proclamation of the Irish Republic, read outside the GPO on Easter Monday, 1916',
     },
   }},
  {id:'c10', year:1921, title:'Northern Ireland & the Republic', category:'Northern Ireland', difficulty:'intermediate',
   target:['w163','w164','w165'],
   text:"Ireland's island today has two jurisdictions: Poblacht na hÉireann, the Republic of Ireland, and Tuaisceart Éireann, Northern Ireland, which is part of the United Kingdom. This partition dates to 1921, following the Anglo-Irish Treaty. Both remain distinct stáit today, and the relationship between them continues to be an active, sometimes contested, political topic.",
   quiz:{q:'What is Tuaisceart Éireann in English?', options:['Northern Ireland','The Republic of Ireland','A Gaeltacht region','A Viking city'], answer:0}},
  {id:'c11', year:1893, title:'The Irish Language Revival', category:'Language', difficulty:'intermediate',
   target:['w166','w167'],
   text:"By the early 1900s, Irish had declined sharply as a spoken language, accelerated by the Great Famine of the 1840s and decades of English-only schooling. Athbheochan na Gaeilge — the Irish language revival — began with groups like Conradh na Gaeilge (founded 1893) and continues today: Irish is an official EU language, compulsory in Irish schools, and the first language of Gaeltacht communities.",
   quiz:{q:'What does “athbheochan” refer to here?', options:['The revival of the Irish language','A type of county','A Viking settlement','An Irish province'], answer:0}},
  {id:'c12', year:-500, title:'The Celts', category:'History', difficulty:'intermediate',
   target:['w170','w168'],
   text:"The Ceiltigh — the Celts — arrived in Ireland during the Iron Age, roughly 2,500 years ago, bringing the language family that Irish descends from. Celtic Ireland was never one kingdom: it was a patchwork of small territories, each with its own rí (king), bound together by shared law, language, and mythology rather than a single state.",
   quiz:{q:'What did the Celts bring to Ireland that survives today?', options:['The ancestor of the Irish language','The county system','Christianity','The potato'], answer:0}},
  {id:'c13', year:1169, title:'The Normans Arrive', category:'History', difficulty:'intermediate',
   target:['w180'],
   text:"In 1169, the Normannaigh — Normans — landed in Ireland, beginning eight centuries of English and later British involvement in Irish affairs. Over generations, many Norman families became, in the famous phrase, 'more Irish than the Irish themselves,' adopting the Irish language and customs.",
   quiz:{q:'When did the Normans arrive in Ireland?', options:['1169','795','1916','1845'], answer:0}},
  {id:'c14', year:1845, title:'An Gorta Mór — The Great Famine', category:'History', difficulty:'intermediate',
   target:['w171','w172','w173'],
   text:"An Gorta Mór — the Great Famine, or Great Hunger — devastated Ireland from 1845 to 1852 after potato blight destroyed the crop most of the rural poor depended on. Around one million people died of ocras (hunger) and disease, and over a million more left on imirce — emigration. Ireland's population has still not returned to its pre-famine level, and the Famine dealt a heavy blow to the Irish language, which was strongest in the poorest regions.",
   quiz:{q:'What does imirce mean?', options:['Emigration','Hunger','A potato','A government'], answer:0},
   // A fuller "Living Encounter" treatment for this one capsule, as a
   // blueprint — see ui/views/lesson.js. Illustrative composite grounded in
   // well-documented historical patterns (coffin ships, chain migration,
   // workhouse and famine-road mortality), not a specific verified family;
   // said so explicitly in the UI rather than implying it's a real account.
   encounter: {
     visual: 'famine-coast',
     observeTitle: 'Spring, 1847 — near Skibbereen',
     teaser: "One ticket. One family. An impossible choice in the spring they were already calling Black '47.",
     observeNote: 'An illustrative scene grounded in real, well-documented patterns of the time — not a specific historical record.',
     ambience: 'wind',
     senseOfPlace: [
       'Wind off the water.',
       'Turf smoke, thin as it burns.',
       'A silence where a conversation used to be.',
     ],
     // A short scene, one beat at a time — narration sets the moment,
     // dialogue carries the target words in an actual exchange between
     // people, each line spoken aloud as it appears. Deliberately short:
     // comprehensible input means small, digestible pieces, not a wall
     // of text read all at once.
     beats: [
       { type: 'narration', text: "Your family's cottage. The potato crop has failed for the second year running." },
       { type: 'line', speaker: 'Your little sister', irish: 'Tá ocras orm.', phonetic: 'taw UK-russ orm', english: "I'm hungry." },
       { type: 'line', speaker: 'Your mother', irish: 'Tá ocras ar gach duine, a stór.', phonetic: 'taw UK-russ air gokh DIN-eh, uh stohr', english: 'Everyone is hungry, love.' },
       { type: 'narration', text: 'A letter has come from a cousin in Boston — enough money for exactly one ticket.' },
       { type: 'line', speaker: 'Your father', irish: 'Caithfidh duine againn dul ar imirce.', phonetic: 'KAH-hee DIN-eh AH-gin dull air IM-ir-keh', english: 'One of us has to emigrate.' },
       { type: 'narration', text: 'Nobody speaks for a moment. Everyone is thinking the same thing: which one of us?' },
     ],
     participatePrompt: 'Only one ticket. Who goes?',
     participateChoices: [
       {
         label: 'Send the eldest son — strongest, most likely to survive the crossing and send money back.',
         consequence: 'He survives the crossing and finds dock work in Boston. Two years on, he sends home enough to bring over one more sister — but it will be decades before you see him again.',
       },
       {
         label: 'Send the youngest daughter — a cousin in New York has already offered to take her in.',
         consequence: 'She is twelve, seasick for most of the six-week crossing, and arrives frightened and alone. The cousin keeps her word — but it will be nineteen years before any of you see her again.',
       },
       {
         label: 'Keep everyone together and stay — sell what remains, try to hold on until the next harvest.',
         consequence: "You stay. The next harvest is better — but by then two more of the family are gone anyway, to hunger, to fever, to the emigrant ship after all. Staying together didn't mean staying whole.",
       },
     ],
     reflectPoints: [
       "An Gorta Mór (1845–1852) killed roughly one million people and drove over a million more to imirce — about a quarter of Ireland's population, gone within a decade.",
       'Some counties, including Cork and Mayo, lost more than a third of their people.',
       'Blight struck much of Europe, but only in Ireland did it become mass starvation on this scale — British government policy was as responsible as the crop failure, including the continued export of other Irish-grown food during the worst years.',
       "Ireland's population still hasn't recovered to its pre-Famine level.",
     ],
     primarySource: {
       text: 'In the first, six famished and ghastly skeletons, to all appearance dead, were huddled in a corner on some filthy straw, their sole covering what seemed a ragged horse-cloth, naked above the knees.',
       attribution: 'Nicholas Cummins, magistrate, letter describing Skibbereen — published in The Times, 24 December 1846',
     },
   }},
  {id:'c15', year:1919, title:'The War of Independence', category:'History', difficulty:'intermediate',
   target:['w174','w181'],
   text:"Cogadh na Saoirse — the War of Independence — was fought between Irish republican forces and British forces from 1919 to 1921. It ended with the Anglo-Irish Treaty, which created the Irish Free State but also led to partition and a bitter civil war among former comrades over the treaty's terms. The word síocháin (peace) carries weight in Irish history precisely because it was so hard-won.",
   quiz:{q:'What is Cogadh na Saoirse in English?', options:['The War of Independence','The Great Famine','The Easter Rising','The Norman invasion'], answer:0},
   // Living Encounter set at the real Truce (noon, 11 July 1921) rather
   // than combat itself — the documented reaction among IRA volunteers was
   // genuine bewilderment and distrust, which maps directly onto a real
   // decision instead of an invented one, and gives "síocháin" (peace) its
   // full weight as something genuinely uncertain in the moment.
   encounter: {
     visual: 'truce-farmhouse',
     observeTitle: 'A farmhouse, County Cork — 11 July 1921',
     teaser: "Word says the fighting is over at noon today. Nobody on the run believes it that easily.",
     observeNote: "Grounded in the real, documented uncertainty among IRA volunteers on the day of the Truce — the household itself is illustrative, not a specific verified family.",
     beats: [
       { type: 'narration', text: "A farmhouse outside town. You've been sleeping in barns and ditches for months, moving with your flying column. This morning, a runner arrives out of breath." },
       { type: 'line', speaker: 'Your sister, breathless', irish: 'Tá an cogadh thart! Tá síocháin ann, ó mheán lae inniu!', phonetic: 'taw un KUG-uh hart! taw SHEE-khawn on, oh vyawn lay in-YOO', english: 'The war is over! There is peace, from noon today!' },
       { type: 'line', speaker: 'You', irish: 'An bhfuil muinín agat as?', phonetic: 'un vwil MWIN-een AH-gut ahss', english: 'Do you trust it?' },
       { type: 'narration', text: "You don't, not really — not yet. Word like this has never held before. Word like this is exactly what gets a column caught off guard." },
     ],
     participatePrompt: "Noon comes and goes. No shots, no raids — but do you trust it enough to go home?",
     participateChoices: [
       {
         label: 'Go home. If it holds, it holds — you\'re tired of ditches.',
         consequence: "This is what most volunteers eventually did. The Truce held, messily, for months — long enough for a Treaty to be negotiated, though not long enough to stop a bitter split over its terms the following year.",
       },
       {
         label: 'Stay hidden a while longer, certain it won\'t last.',
         consequence: "This is exactly how many officers genuinely reacted — one Monaghan volunteer later admitted his 'lust for blood had not been satisfied' and doubted the Truce outright. You lose nothing by waiting, except time.",
       },
       {
         label: 'Go home, but keep the rifle within reach, just in case.',
         consequence: "You go home cautious rather than certain — which, as it turns out, is closer to how the next eighteen months actually unfold than either full trust or full suspicion alone.",
       },
     ],
     reflectPoints: [
       'The Truce was agreed on 8 July 1921 but deliberately delayed until noon on 11 July, to allow time for ceasefire orders to reach every unit around the country.',
       "Many IRA volunteers on the ground were genuinely bewildered by the sudden order and distrusted it — some assumed it was temporary and kept recruiting and training regardless.",
       "The British commander-in-chief in Ireland reportedly arrived at the truce talks with a concealed pistol — distrust cut in both directions.",
       "The Truce held long enough for the Anglo-Irish Treaty (December 1921), which created the Irish Free State — but its terms split former comrades so bitterly that civil war followed within a year.",
       "Síocháin (peace) carries real weight in Irish historical memory precisely because it was this fragile, and this short-lived, the first time it came.",
     ],
   }},
  {id:'c16', year:1921, title:'Partition', category:'Northern Ireland', difficulty:'intermediate',
   target:['w175'],
   text:"The chríochdheighilt — partition — of Ireland in 1921 divided the island into two jurisdictions: what became the Republic of Ireland, and Northern Ireland, which remained part of the United Kingdom. Partition and its consequences shaped the century that followed, including the Troubles in Northern Ireland (late 1960s–1998), which ended with the Good Friday Agreement. It remains a defining fact of Irish politics, and views on the island's constitutional future continue to differ across communities.",
   quiz:{q:'What does críochdheighilt mean?', options:['Partition','Freedom','Peace','Republic'], answer:0}},
  {id:'c17', year:2026, title:'How Ireland Is Governed', category:'Politics', difficulty:'intermediate',
   target:['w176','w177','w178','w179'],
   text:"The Republic of Ireland is a parliamentary democracy. The rialtas (government) is led by the Taoiseach — the head of government, comparable to a prime minister. Laws are made in the Dáil (Dáil Éireann), the main chamber of parliament, whose members are called TDs. The uachtarán (president) is the directly elected head of state, with a largely ceremonial and constitutional role. Nearly all Irish political vocabulary is used in Irish even in English-language news — Taoiseach, Dáil, and TD are everyday words in Ireland.",
   quiz:{q:'Who is the head of government in Ireland?', options:['The Taoiseach','The uachtarán','The rí','The TD'], answer:0}},

  // ---- Geography set (hand-written; targets stay within the audio-backed vocabulary) ----
  {id:'c18', title:'The Three Dialects', category:'Geography', difficulty:'beginner',
   target:['w146','w167','w154'],
   text:"Living Irish comes in three broad flavours, one per Gaeltacht cúige (province): Ulster Irish in Donegal, Connacht Irish in Connemara and Mayo, and Munster Irish in Kerry, Cork and Waterford. They differ in melody and stress more than in vocabulary — the teanga (language) is one, and speakers understand each other. Most learning materials (and this app's audio) use a standard close to Connacht pronunciation.",
   quiz:{q:'How many main living dialects does Irish have?', options:['Three','One','Seven','Twelve'], answer:0}},
  {id:'c19', title:'The Wild Western Edge', category:'Geography', difficulty:'beginner',
   target:['w99','w100','w144','w101'],
   text:"Ireland's west coast — where the Gaeltacht mostly survives — is a landscape of farraige (sea), sliabh (mountain) and abhainn (river). Connemara's bogs run down to the Atlantic, and offshore sit islands like the Aran Islands, each an oileán where Irish is the daily language. The rougher, remoter land is part of why the language held on here when it faded in the east.",
   quiz:{q:'What does "farraige" mean?', options:['Sea','Mountain','River','Island'], answer:0}},
  {id:'c20', title:'What Place Names Say', category:'Geography', difficulty:'beginner',
   target:['w24','w159','w151','w153'],
   text:"Nearly every place name in Ireland is Irish wearing an English spelling. Baile (town/home) begins hundreds of them — anglicised as 'Bally'. Dublin's Irish name, Baile Átha Cliath, means 'town of the hurdled ford'; Gaillimh (Galway) is a cathair (city) named for its stony river. Reading place names in Irish turns any road sign into a tiny history lesson — signs in the Republic show both languages.",
   quiz:{q:'What does "baile" — the "Bally-" in Irish place names — mean?', options:['Town or home','Mountain','Church','King'], answer:0}},
  {id:'c21', title:'Weather off the Atlantic', category:'Geography', difficulty:'beginner',
   target:['w128','w129','w35','w98'],
   text:"Ireland's weather arrives from the Atlantic: báisteach (rain) in soft persistent forms English barely has words for, gaoth (wind) that shapes the bent trees of the west coast, and a famously changeable spéir (sky). It is rarely truly fuar (cold) — the Gulf Stream keeps winters mild — which is why the island stays green enough to earn the name 'the Emerald Isle'. Small talk about weather is a national pastime in both languages.",
   quiz:{q:'What does "báisteach" mean?', options:['Rain','Wind','Sky','Snow'], answer:0}},
  {id:'c22', title:'A Day in the Gaeltacht', category:'Geography', difficulty:'intermediate', province:'connachta',
   target:['w123','w79','w25','w124','w23'],
   text:"In a Gaeltacht village, Irish carries the whole day: maidin (morning) greetings at the shop, tae (tea) with neighbours, obair (work) on land or sea or — increasingly — remote for a city employer, music in the pub come tráthnóna (evening), and oíche mhaith (good night) at the door. Thousands of Irish teenagers spend summer weeks boarding in these villages at Irish colleges — for many it's where the school subject first becomes a living language.",
   quiz:{q:'What does "maidin" mean?', options:['Morning','Evening','Night','Tea'], answer:0},
   // A present-day, everyday-conversation Living Encounter — same format as
   // Buenos Aires/Madrid, but rural Ireland, proving the format fits
   // ordinary contemporary Gaeltacht life, not just historical drama.
   // Structured around the five target words as the five parts of the day
   // the capsule's own text describes.
   encounter: {
     visual: 'conamara-village',
     observeTitle: 'An Cheathrú Rua, Conamara — today',
     teaser: 'One ordinary day, five parts to it, and Irish carrying every one of them.',
     observeNote: 'A composite, everyday day-in-the-life scene of Gaeltacht Conamara — not one specific household.',
     senseOfPlace: [
       'Turf smoke on cold morning air.',
       'Irish first — English only for the odd tourist at the till.',
       'The sea, always somewhere in view.',
     ],
     beats: [
       { type: 'narration', text: 'An Cheathrú Rua, Conamara, Contae na Gaillimhe. Ten in the morning — the village shop is the first stop of the day.' },
       { type: 'line', speaker: 'The shopkeeper', irish: 'Maidin mhaith! Cén chaoi a bhfuil tú?', phonetic: 'MOD-in wah! kayn khee uh vwil too', english: 'Good morning! How are you?' },
       { type: 'line', speaker: 'Your neighbour, stopping by at midday', irish: 'An bhfuil tú ag iarraidh cupán tae?', phonetic: 'un vwil too egg EER-ee KUP-awn tay', english: 'Do you want a cup of tea?' },
       { type: 'line', speaker: 'You', irish: 'Tá obair agam tráthnóna — ach tae anois, cinnte.', phonetic: 'taw UB-ir AH-gum traw-NOH-na — ahkh tay uh-NISH, KIN-cheh', english: 'I have work this afternoon — but tea now, definitely.' },
       { type: 'narration', text: "The work is logging into a Dublin office from the gteic hub down the road — you've done it for two years now, and the broadband here beats the flat you left behind." },
       { type: 'line', speaker: 'A voice from the pub, that evening', irish: 'Tar isteach! Tá ceol ann anocht.', phonetic: 'tar ISH-tchuh! taw kyoll on uh-NOKHT', english: "Come in! There's music tonight." },
       { type: 'line', speaker: 'Your neighbour, at the door, later', irish: 'Oíche mhaith, agus feicfidh mé amárach thú.', phonetic: 'EE-heh wah, AH-gus FECK-hee may uh-MAW-rakh hoo', english: "Good night, and I'll see you tomorrow." },
     ],
     participatePrompt: "The pub has music tonight, but your neighbour mentioned needing a hand stacking turf before tomorrow's rain. What do you do?",
     participateChoices: [
       {
         label: 'Help with the turf first — the music will still be there after.',
         consequence: "You're both soaked and laughing by the time it's stacked. You get to the pub late, but your neighbour buys the first round, and everyone already knows why.",
       },
       {
         label: "Go to the session — you'll help with the turf tomorrow.",
         consequence: "The music is worth it. It rains overnight, and you spend an hour tomorrow helping re-stack turf that got wet anyway — good company either way.",
       },
       {
         label: 'Do an hour of turf, then head to the session.',
         consequence: 'You arrive at the pub with hay in your hair and turf dust on your hands. Nobody minds — half the room clearly came from somewhere similar.',
       },
     ],
     reflectPoints: [
       "Údarás na Gaeltachta's gteic network — over 30 digital hubs across every Gaeltacht region, from Donegal to Cape Clear — has drawn hundreds of remote workers back to Irish-speaking areas since 2019, drawn by broadband as much as anything else.",
       'Communities like Conamara Láir have run active campaigns encouraging families and remote workers specifically to relocate there, citing quality of life alongside the digital infrastructure.',
       'Thousands of Irish secondary students spend one to three summer weeks boarding with Gaeltacht families at coláistí samhraidh (summer colleges) — for many, it\'s the first time Irish feels like a living language rather than a school subject.',
       "Conamara is one of the largest and strongest Gaeltacht regions, forming part of Connacht (Cúige Chonnachta) on Ireland's west coast.",
     ],
   }},
];
