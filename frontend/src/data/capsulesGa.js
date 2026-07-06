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
   quiz:{q:'What does “athbheochan” refer to here?', options:['The revival of the Irish language','A type of county','A Viking settlement','An Irish province'], answer:0},
   // Living Encounter built on a real generational tension: the same
   // year Conradh na Gaeilge was founded (1893), many older Irish
   // speakers still carried genuine shame from being punished for the
   // language as children — documented first-hand in folklore archive
   // accounts, not just a general claim.
   encounter: {
     visual: 'kitchen-1893',
     observeTitle: 'A family kitchen, 1893',
     teaser: "You come home excited about a new Irish class in town. Your grandmother's reaction isn't what you expected.",
     observeNote: 'Grounded in the real founding of Conradh na Gaeilge (1893) and documented first-hand accounts of school punishment for speaking Irish — this household is illustrative, not a verified family.',
     beats: [
       { type: 'narration', text: "A family kitchen, 1893. You've just come from a new class run by a group called Conradh na Gaeilge, founded in Dublin only weeks ago." },
       { type: 'line', speaker: 'You', irish: "D'fhoghlaim mé teanga inniu — an Ghaeilge!", phonetic: "GHOH-lim may TANG-a in-YOO — un GAY-lig", english: 'I learned a language today — Irish!' },
       { type: 'narration', text: 'Your grandmother goes quiet. She grew up hearing Irish at home — and hearing, from her own father, exactly what it cost him as a boy in school to be caught speaking it.' },
       { type: 'line', speaker: 'Your grandmother', irish: 'Buaileadh m\'athair as an teanga sin, agus anois tá tusa á foghlaim arís.', phonetic: 'BOO-uh-lah MAH-hir ahss un TANG-a shin, AH-gus uh-NISH taw TUSS-uh aw GHOH-lim uh-REESH', english: 'They beat my father over that language, and now you\'re learning it again.' },
     ],
     participatePrompt: "Your grandmother has gone quiet. What does she do next?",
     participateChoices: [
       {
         label: 'She starts teaching you the old songs she still remembers.',
         consequence: "This is what the revival actually looked like in thousands of households — grandparents becoming the last living link to words their own children had been taught to be ashamed of.",
       },
       {
         label: "She warns you it only ever brought her family trouble.",
         consequence: "Her caution is real and earned — for her generation, the language was genuinely tied to punishment and shame, not yet to pride. Both things can be true of the same word at once.",
       },
       {
         label: 'She says nothing at all — but you hear her humming an old song later that night.',
         consequence: "Nothing is resolved out loud, but something shifts anyway. Revivals like this one often moved through households exactly this quietly, one hummed verse at a time.",
       },
     ],
     reflectPoints: [
       'Conradh na Gaeilge (the Gaelic League) was founded in Dublin on 31 July 1893, by Douglas Hyde along with Eugene O\'Growney, Eoin Mac Néill, and others.',
       'It followed directly from Hyde\'s influential 1892 speech, "The Necessity for De-Anglicising Ireland," delivered to the Irish National Literary Society that November.',
       'First-hand accounts collected decades later in Ireland\'s folklore archives describe real tally-stick punishments — a notch cut into a stick for each Irish word a child was overheard speaking, with a strike given for every notch — used in some 19th-century National Schools, though historians caution this wasn\'t one single, uniform government policy.',
       "Today Irish is an official EU language, compulsory in Irish schools, and the first language of Gaeltacht communities — the revival that began in rooms like this one never fully stopped.",
     ],
   }},
  {id:'c12', year:-500, title:'The Celts', category:'History', difficulty:'intermediate',
   target:['w170','w168'],
   text:"The Ceiltigh — the Celts — arrived in Ireland during the Iron Age, roughly 2,500 years ago, bringing the language family that Irish descends from. Celtic Ireland was never one kingdom: it was a patchwork of small territories, each with its own rí (king), bound together by shared law, language, and mythology rather than a single state.",
   quiz:{q:'What did the Celts bring to Ireland that survives today?', options:['The ancestor of the Irish language','The county system','Christianity','The potato'], answer:0},
   // Living Encounter built on the real mechanics of early Irish kingship
   // — tanistry and the derbfhine — rather than a generic "ancient
   // Celts" scene. Puts the learner inside the actual succession system
   // Brehon law describes, with a real, recorded kind of choice.
   encounter: {
     visual: 'tuath-gathering',
     observeTitle: 'A túath in early Celtic Ireland',
     teaser: "The old rí is dying, and by law it isn't his eldest son who inherits — it's whichever eligible kinsman the derbfhine chooses.",
     observeNote: "Grounded in the real tanistry and derbfhine succession system described in early Irish law tracts — the specific túath and gathering are illustrative, not one verified event.",
     beats: [
       { type: 'narration', text: 'A túath — one of roughly a hundred and fifty small kingdoms across the island. The old rí is dying, and word has gone out to every eligible kinsman.' },
       { type: 'line', speaker: 'An elder', irish: 'Tá an rí ag fáil bháis. Caithfimid rí nua a thoghadh.', phonetic: 'taw un ree egg fawl vawss. KAH-hee-mid ree noo-ah uh HOH-uh', english: 'The king is dying. We must choose a new king.' },
       { type: 'narration', text: "It won't simply pass to the old king's eldest son. Every man descended from a shared great-grandfather — the derbfhine — has a claim, and the derbfhine itself will decide." },
       { type: 'line', speaker: 'Your cousin, also eligible', irish: 'Is mise an fear is fearr, agus tá a fhios agat é.', phonetic: 'iss MISH-eh un far iss far, AH-gus taw ah iss AH-gut ay', english: 'I am the best man, and you know it.' },
     ],
     participatePrompt: 'The derbfhine will choose within days. How do you make your own case as an eligible kinsman?',
     participateChoices: [
       {
         label: 'Point to your record in raids and cattle-taking — proven strength.',
         consequence: "It's a real argument here — martial reputation genuinely counted. Some of the derbfhine are convinced; your cousin now has to answer for his own quieter record.",
       },
       {
         label: 'Spend the coming days building quiet alliances among the derbfhine.',
         consequence: "This is how it actually worked as often as open contest did — by the time the derbfhine gathers to decide, half of them already owe you something.",
       },
       {
         label: 'Step back and support your cousin, to avoid a fight over it.',
         consequence: "You lose nothing real — the derbfhine remembers who kept the peace. Annals from the period are full of kin who fought each other over exactly this choice; refusing to is its own kind of reputation.",
       },
     ],
     reflectPoints: [
       'Early medieval Ireland had roughly 100 to 150 túatha (small kingdoms) at any one time, each with its own rí — there was no single Irish king or unified state.',
       'Kingship passed by tanistry, not simple father-to-son inheritance: any eligible male across four generations of shared descent — the derbfhine — could be chosen, and often was chosen for ability rather than birth order.',
       'This flexibility came at a real cost: annals from the period record frequent rivalries, depositions, and violence between kinsmen competing for the same succession.',
       'Brehon law — a detailed native legal system written down in law tracts by the 7th–8th centuries — governed succession, property, and disputes long before any Norman or English law reached Ireland.',
     ],
   }},
  {id:'c13', year:1169, title:'The Normans Arrive', category:'History', difficulty:'intermediate',
   target:['w180'],
   text:"In 1169, the Normannaigh — Normans — landed in Ireland, beginning eight centuries of English and later British involvement in Irish affairs. Over generations, many Norman families became, in the famous phrase, 'more Irish than the Irish themselves,' adopting the Irish language and customs.",
   quiz:{q:'When did the Normans arrive in Ireland?', options:['1169','795','1916','1845'], answer:0},
   // Living Encounter on the real, specific 1169 landing — not soldiers
   // arriving to conquer a stranger's land, but mercenaries invited by
   // Ireland's own exiled king, which is the detail that actually makes
   // this moment complicated rather than a simple invasion story.
   encounter: {
     visual: 'bannow-bay-landing',
     observeTitle: 'Bannow Bay, County Wexford — 1 May 1169',
     teaser: "Foreign ships on the horizon — sent for, not sent against you, by the king you used to answer to.",
     observeNote: "Grounded in the real landing at Bannow Bay, 1 May 1169 — the villagers themselves are illustrative, not verified individuals.",
     beats: [
       { type: 'narration', text: 'Bannow Bay, County Wexford. Ships you don\'t recognise are coming ashore — armoured men, more of them than the beach has seen in your lifetime.' },
       { type: 'line', speaker: 'A neighbour, pointing', irish: 'Sin iad na Normannaigh. Thug Diarmaid Mac Murchadha anseo iad.', phonetic: 'shin EE-ad nuh NOR-man-igh. hug DEER-mid mock MUR-uh-huh un-SHOH ee-ad', english: 'Those are the Normans. Diarmait Mac Murchada brought them here.' },
       { type: 'narration', text: "Mac Murchada was your king until two years ago, when the other Irish kings drove him out. He went to Wales and England looking for soldiers, and came back with exactly that." },
       { type: 'line', speaker: 'Your neighbour', irish: 'Tá sé ag iarraidh a ríocht ar ais. Ach ar phraghas cé mhéad, meas tú?', phonetic: 'taw shay egg EER-ee ah REE-okht air ash. ahkh air PRY-shus kay vayd, mass too', english: "He wants his kingdom back. But at what price, do you think?" },
     ],
     participatePrompt: 'Mac Murchada was your rightful king before his exile — now he\'s back, with foreign soldiers behind him. Where do you stand?',
     participateChoices: [
       {
         label: 'Support his return — he is still your king, whoever he brought with him.',
         consequence: "Plenty of his old subjects felt exactly this. It restores him to Leinster within the year — but the soldiers he brought don't simply leave once the debt is repaid.",
       },
       {
         label: "Refuse — inviting foreign mercenaries onto Irish soil isn't a king's right to spend.",
         consequence: "History mostly agrees with you in hindsight: this single invitation opens eight centuries of English and later British involvement in Ireland. But in 1169, that's a judgment only later generations get to make.",
       },
       {
         label: "Wait and see which way the wind actually blows.",
         consequence: "Realistic, and common — most people in Wexford in 1169 had no real say in any of this, and simply waited to find out who'd still be in charge by winter.",
       },
     ],
     reflectPoints: [
       "Diarmait Mac Murchada, deposed King of Leinster, spent two years in exile seeking help from Norman lords in Wales and, eventually, King Henry II of England.",
       "The first Norman force landed at Bannow Bay, County Wexford, on 1 May 1169 — the date this capsule's own text uses.",
       "Richard de Clare — Strongbow — arrived the following year, married Mac Murchada's daughter Aoife, and inherited his claim to Leinster; Henry II then invaded in person in 1171 to keep control of his own Norman lords.",
       'The phrase "more Irish than the Irish themselves" really does describe later generations of these Norman families assimilating into Gaelic culture — but the phrase itself was actually coined centuries afterward, in the late 1700s, not at the time.',
     ],
   }},
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
   quiz:{q:'What does críochdheighilt mean?', options:['Partition','Freedom','Peace','Republic'], answer:0},
   // A deliberately non-partisan Living Encounter: the human, practical
   // consequence of a border drawn along old county lines rather than
   // around actual communities — grounded in the real Drummully salient
   // and Clones cases — rather than any argument for or against partition
   // itself, which the base capsule already notes remains genuinely
   // contested.
   encounter: {
     visual: 'border-farm',
     observeTitle: 'A farm near the new border, 1921',
     teaser: "The line on the map follows an old county boundary. It doesn't follow your family's actual farm.",
     observeNote: "Grounded in real, documented cases like the Drummully salient and Clones, where the new border split communities from their own farmland and markets — this household is illustrative.",
     beats: [
       { type: 'narration', text: "A farm near the new border, 1921. Word has come that the line follows the old county boundary — straight through land your family has worked for generations." },
       { type: 'line', speaker: 'Your father', irish: 'Tá an chríochdheighilt ag dul díreach tríd an bportach s\'againne.', phonetic: 'taw un KREEKH-eye-iltch egg gul JEER-ukh tree un BOR-tukh SAH-gin-yeh', english: "The partition line goes straight through our own bog." },
       { type: 'narration', text: "Your family's usual market town — where you've sold cattle and bought supplies your whole life — is now across that same line, in the other jurisdiction entirely." },
       { type: 'line', speaker: 'Your mother', irish: 'Beidh custaim le híoc anois, díreach le dul chuig an margadh.', phonetic: 'bay KUS-tim leh EE-ock uh-NISH, JEER-ukh leh gul hig un MOR-uh-guh', english: 'There will be customs to pay now, just to get to the market.' },
     ],
     participatePrompt: "Your family's market town is now across the new border. What do you do?",
     participateChoices: [
       {
         label: 'Keep trading there anyway, despite the new customs stops.',
         consequence: "This is what plenty of border families actually did — accepting the delay and the paperwork rather than giving up trading relationships built over generations.",
       },
       {
         label: 'Start selling to a town on your own side instead, even though it\'s farther.',
         consequence: "Also common, and it slowly reshaped which towns thrived and which declined — Clones, cut off from its natural hinterland in Fermanagh, is the case historians point to most.",
       },
       {
         label: 'Submit a petition to the Boundary Commission when it convenes, asking for your area to be reassigned.',
         consequence: "You join thousands of others doing exactly this in 1925. It changes nothing in the end — the governments involved bury the commission's findings entirely rather than act on them.",
       },
     ],
     reflectPoints: [
       "The 1921 border mostly followed old county lines, not any survey of where communities, roads, or farms actually sat — it cut through houses, farms, and at least one village.",
       "The Drummully salient, a pocket of Free State territory home to 63 families and over 400 people, ended up reachable only by passing through Northern Ireland — one of many such anomalies.",
       'Customs posts appeared on the border in April 1923, limited to just sixteen crossing points for the entire boundary, and farmers had to pay duties simply to move produce across it.',
       "A Boundary Commission convened in 1925 to review the line, gathering petitions from thousands of affected residents — but its final report was leaked, then buried by agreement of all three governments involved, and wasn't made public until 1968.",
     ],
   }},
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
   quiz:{q:'What does "farraige" mean?', options:['Sea','Mountain','River','Island'], answer:0},
   // A crossing-to-the-island Living Encounter structured around the
   // capsule's own four target words in sequence — mountains and a river
   // on the mainland, the sea crossing, then arrival on the oileán — built
   // around the real, still-standing Dún Aonghasa fort.
   encounter: {
     visual: 'dun-aonghasa-cliff',
     observeTitle: 'Crossing to Inis Mór',
     teaser: "A prehistoric fort, three thousand years old, standing right at the edge of a hundred-metre drop — with no fence to stop you going closer.",
     observeNote: 'A composite crossing-and-visit scene of the real Dún Aonghasa site — the boatman and the specific crossing are illustrative.',
     beats: [
       { type: 'narration', text: 'The Connemara coast, where a small abhainn meets the sea. Behind you, the sliabh of Na Beanna Beola — the Twelve Bens — fade into cloud.' },
       { type: 'line', speaker: 'The boatman', irish: 'Tá an fharraige garbh inniu, ach ní stopfaidh sé sinn.', phonetic: 'taw un AR-i-geh GAR-uv in-YOO, ahkh nee STOP-hee shay shin', english: "The sea is rough today, but it won't stop us." },
       { type: 'narration', text: "Forty minutes out, the oileán rises out of the water ahead — Inis Mór, largest of the Aran Islands, where Irish is still the language of the shop, the pub, and the schoolyard." },
       { type: 'line', speaker: 'Your guide, on the island', irish: 'Sin é Dún Aonghasa — trí mhíle bliain d\'aois, agus gan aon fhál ag an imeall.', phonetic: 'shin ay DOON AYN-goo-sah — tree veel BLEE-un DEESH, AH-gus gon ayn AWL egg un IM-al', english: "That's Dún Aonghasa — three thousand years old, and no fence at the edge." },
     ],
     participatePrompt: "The path leads right to Dún Aonghasa's cliff edge — a hundred-metre drop, and nothing between you and it. How close do you go?",
     participateChoices: [
       {
         label: 'Right up to the edge, to look straight down.',
         consequence: "The view is exactly as dramatic as promised — and exactly as unguarded as your guide warned. Thousands of visitors do this safely every year, but the site keeps it deliberately, historically bare.",
       },
       {
         label: 'Close enough to see the drop, but staying well back from the actual lip.',
         consequence: "You still get the view — a hundred metres of sheer limestone straight to the Atlantic — without testing exactly where the edge gives way.",
       },
       {
         label: "You stay with the inner stone walls and skip the cliff edge entirely.",
         consequence: "No less real a visit for it — the fort's concentric walls and the stone spikes of its ancient defences are worth the trip on their own.",
       },
     ],
     reflectPoints: [
       "Dún Aonghasa's first stone enclosure dates to around 1100 BC — Bronze Age construction, added to through the Iron Age.",
       "It sits on a cliff roughly 100 metres above the Atlantic — with no fence or barrier at the edge, by deliberate choice, to preserve the site as it's always been.",
       "Its outer defences include a cheval de frise — a field of upright, closely-set limestone spikes — one of the more unusual defensive features surviving from prehistoric Europe.",
       "The Aran Islands remain part of the Gaeltacht today, where Irish survived as the everyday language in part because the west's rougher, more remote geography — sea, mountain, and island together — slowed the same decline that reached the east far earlier.",
     ],
   }},
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
