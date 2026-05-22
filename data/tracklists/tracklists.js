// Tracklist data loader for DJ Sets and 3D Brain
// Loads tracklist data from JSON files and provides search/filter APIs

const TRACKLISTS = {
  "folamour": {
    artist: "Folamour",
    artist_id: "folamour",
    sets: [
      {
        id: "folamour-cercle-geneva-2023",
        title: "Cercle @ Cathédrale Saint-Pierre, Geneva",
        venue: "Cercle, St. Pierre Cathedral, Geneva, Switzerland",
        date: "2023-07-10",
        duration: "1:53:43",
        youtube: "YDJEo-rQrfw",
        views: 3000000,
        genre: ["House", "Nu Disco", "Disco"],
        tracks_identified: 22,
        tracks_total: 22,
        source: "YouTube description + 1001tracklists + MixesDB",
        tracklist: [
          { time: "00:00", artist: "September", title: "Ostavi Trag" },
          { time: "00:45", artist: "General Ehi Duncan, The Africa Army", title: "Express ft. The Ibibio Horns - Africa (My No. 1) (Captain Planet Remix)" },
          { time: "05:52", artist: "Mike Simonetti", title: "Midnight Or Late Afternoon" },
          { time: "09:20", artist: "Donna Washington", title: "You Can't Hide From The Boogie" },
          { time: "12:40", artist: "Crown Heights Affair", title: "I See The Light" },
          { time: "16:23", artist: "Folamour", title: "Fearless", label: "FHUO" },
          { time: "20:38", artist: "Cotonete, Dimitri From Paris", title: "The Hustle Parisian", label: "Heavenly Sweetness" },
          { time: "26:10", artist: "Ten City", title: "Be Free (Emmaculate & Shannon Chambers Mix)", label: "Ultra" },
          { time: "30:40", artist: "Folamour ft. Amadou & Mariam", title: "Voyage", label: "FHUO" },
          { time: "34:50", artist: "Easttown", title: "Breeze", label: "House Of Love" },
          { time: "38:20", artist: "Folamour", title: "Paradiso" },
          { time: "44:24", artist: "Folamour", title: "Poundland Anthem", label: "FHUO" },
          { time: "49:19", artist: "Udo Jürgens", title: "Peace Now (Folamour Remix)", label: "Sony" },
          { time: "53:20", artist: "Kathy Brown", title: "Get Another Love (Warren Clarke Dub Mix)", label: "Glitterbox" },
          { time: "57:36", artist: "Jamie Lewis ft. Michael Watford", title: "For You (Original Demo Mix)", label: "Purple Music" },
          { time: "01:02:45", artist: "Saison", title: "Man Of Soul", label: "No Fuss" },
          { time: "01:07:54", artist: "Ferry Ultra ft. Gwen McCrae", title: "Happy (Folamour Remix)", label: "Peppermint Jam" },
          { time: "01:12:17", artist: "Folamour", title: "Bonifacio" },
          { time: "01:18:02", artist: "Dasco", title: "Feel My Love" },
          { time: "01:22:46", artist: "Danny Snowden", title: "Energy" },
          { time: "01:26:32", artist: "Folamour", title: "Post Tenebras Lux" },
          { time: "01:31:08", artist: "Folamour", title: "When A Piano Saves The Day", label: "FHUO" }
        ]
      },
      {
        id: "folamour-br-sugar-mountain-2024",
        title: "Boiler Room x Sugar Mountain 2024",
        venue: "Sugar Mountain, Melbourne, Australia",
        date: "2024-01-20",
        duration: "59:45",
        youtube: "IC5EOU0vZjw",
        views: 3691617,
        genre: ["House", "Tech House"],
        tracks_identified: 12,
        tracks_total: 12,
        source: "1001tracklists + MixesDB",
        tracklist: [
          { time: "00:00", artist: "D Stone", title: "Total Unison", label: "Cécille" },
          { time: "00:00", artist: "Folamour", title: "Manifesto (Vocal)", note: "ID - Unreleased" },
          { time: "07:00", artist: "Urban Blues Project ft. Bobby Pruitt", title: "We Are One (Jazz-N-Groove Hands Up Vocal Remix)" },
          { time: "13:00", artist: "Da Lukas", title: "Satisfy Your Soul (Extended Mix)", label: "Groove Culture" },
          { time: "18:00", artist: "Dam Swindle", title: "That's Right", label: "Heist" },
          { time: "23:00", artist: "MoD, Luisen", title: "Small Town Boy (Supermini Mega Dub)" },
          { time: "28:00", artist: "Lone Dog", title: "Straight From The Underground", label: "Frappé" },
          { time: "32:00", artist: "Bongoloverz ft. An-Tonic", title: "Power Of Music", label: "Soulfuric Trax" },
          { time: "39:00", artist: "Folamour", title: "Pressure Makes Diamonds", note: "Unreleased" },
          { time: "44:00", artist: "Madonna", title: "Vogue (DJ Meme Remix)", label: "Sire" },
          { time: "50:00", artist: "Melon Bomb", title: "Fantazia", label: "Melon Bomb", note: "w/ Jayforce - When I Was Seventeen (ID Remix)" },
          { time: "55:00", artist: "Folamour", title: "Unreleased", note: "ID" }
        ]
      },
      {
        id: "folamour-dj-mag-hq-2019",
        title: "DJ Mag HQ Sessions",
        venue: "DJ Mag HQ, London, UK",
        date: "2019-04-18",
        duration: "1:03:51",
        youtube: "",
        views: 0,
        genre: ["Nu Disco", "Disco"],
        tracks_identified: 14,
        tracks_total: 14,
        source: "1001tracklists + MixesDB",
        tracklist: [
          { time: "00:00", artist: "Brian Auger's Oblivion Express", title: "Maiden Voyage" },
          { time: "00:22", artist: "Fingerman", title: "Your Love" },
          { time: "06:09", artist: "Kazuko Ishibashi", title: "Iyo", label: "INVITATION" },
          { time: "10:10", artist: "Sunlightsquare", title: "I Believe In Miracles (Broken Party Animal Mix)", label: "Sunlightsquare Records" },
          { time: "14:15", artist: "Lakeside", title: "Fantastic Voyage", label: "Unidisc" },
          { time: "18:03", artist: "Sharp Soul", title: "Another Brick (Edit)", label: "Groove Democracy" },
          { time: "22:03", artist: "Lee McDonald", title: "I'll Do Anything For You (Patchworks Remix)", label: "Favourite Recordings" },
          { time: "27:39", artist: "D.J. Rogers", title: "Reason To Dance (Aroop Roy Edit)" },
          { time: "32:22", artist: "The Disco Dog", title: "I'm Gonna Break Your Bones", label: "ZYX" },
          { time: "36:17", artist: "Light Of The World", title: "Time", label: "Mercury" },
          { time: "43:08", artist: "Yta Jourias", title: "Adome Nyueto", label: "Hot Casa" },
          { time: "49:19", artist: "Songhoi Band", title: "Africa Africa (Faze Action Edit)", label: "Z Records" },
          { time: "53:29", artist: "Voilaaa ft. Sir Jean", title: "Spies Are Watching Me", label: "Favorite" },
          { time: "1:00:15", artist: "Folamour ft. Elbi", title: "After Winter Must Come Spring", label: "FHUO" }
        ]
      },
      {
        id: "folamour-br-fly-edinburgh-2019",
        title: "Boiler Room x FLY Open Air Festival",
        venue: "FLY Open Air Festival, Edinburgh, UK",
        date: "2019-05-18",
        duration: "59:42",
        youtube: "",
        views: 0,
        genre: ["Nu Disco", "Disco", "House"],
        tracks_identified: 12,
        tracks_total: 12,
        source: "MixesDB",
        tracklist: [
          { time: "00:00", artist: "Odyssey", title: "Going Back To My Roots (Ziggy Phunk Re-Edit)" },
          { time: "07:00", artist: "Banda Black Rio", title: "Chega Mais (Imaginei Você Dançando) (Folamour Edit)" },
          { time: "10:00", artist: "Esa", title: "A Muto" },
          { time: "17:00", artist: "Elaine & Ellen", title: "Fill Me Up", label: "Funky Delicacies" },
          { time: "22:00", artist: "COEO", title: "Don't Oho", label: "Razor-N-Tape" },
          { time: "27:00", artist: "Fronzena Harris", title: "Lovetime Guarantee" },
          { time: "31:00", artist: "Mighty Mouse", title: "Midnight Mouse (Revised)", label: "Space Native" },
          { time: "34:00", artist: "Light Of The World", title: "Time (Koko Paradisco Re-Edit)", label: "Basic Fingers" },
          { time: "40:00", artist: "Sean Smith & MC Edits", title: "Funky Disco Music (Original Edit)", label: "Smooth Edits" },
          { time: "47:00", artist: "Di Melo", title: "A E I O U" },
          { time: "52:00", artist: "Cotonete & Dimitri From Paris", title: "Parribean Disco", label: "Heavenly Sweetness" },
          { time: "56:00", artist: "George Michael", title: "Freedom! '90 (Remastered)" }
        ]
      },
      {
        id: "folamour-polaris-verbier-2020",
        title: "Polaris Festival New Year's Eve",
        venue: "Polaris Festival, Verbier, Switzerland",
        date: "2019-12-31",
        duration: "",
        youtube: "",
        views: 0,
        genre: ["Disco", "House", "Nu Disco"],
        tracks_identified: 13,
        tracks_total: 13,
        source: "Decoded Magazine",
        tracklist: [
          { time: "", artist: "Father's Children", title: "Dance Do It" },
          { time: "", artist: "Rare Cuts", title: "Out To Get'cha" },
          { time: "", artist: "Veronique Sanson", title: "Bernard's Song (Young Pulse Edit)" },
          { time: "", artist: "Enchantment", title: "Give It Up" },
          { time: "", artist: "Gayle Adams", title: "Emergency" },
          { time: "", artist: "Folamour", title: "I Know It Has Been Done Before" },
          { time: "", artist: "Isaac Hayes", title: "Fever" },
          { time: "", artist: "Folamour", title: "Jazz Session For No Future People" },
          { time: "", artist: "Faze Action & Zeke Manyika", title: "Mangwana" },
          { time: "", artist: "Rhyze", title: "I Found Love In You" },
          { time: "", artist: "Mass Production", title: "Maybe, Maybe" },
          { time: "", artist: "Martin Solveig", title: "Jealousy" },
          { time: "", artist: "George Michael", title: "Fastlove" }
        ]
      },
      {
        id: "folamour-lost-paradise-2022",
        title: "Lost Paradise",
        venue: "Lost Paradise, Australia",
        date: "2022-12-30",
        duration: "1:28:50",
        youtube: "",
        views: 0,
        genre: ["House", "Nu Disco", "Disco"],
        tracks_identified: 16,
        tracks_total: 19,
        source: "1001tracklists",
        tracklist: [
          { time: "00:00", artist: "Lenny Williams", title: "When I'm Dancin' (Marc Green Edit)" },
          { time: "", artist: "Kaleta", title: "ID" },
          { time: "", artist: "Afshin & Kiss My Black Jazz", title: "The Seduction" },
          { time: "", artist: "Gaoulé Mizik", title: "A Ka Titine (Dam Swindle Edit)", label: "Heist" },
          { time: "25:00", artist: "Fixed Angles", title: "Anikana", label: "Bonfido Disques" },
          { time: "29:30", artist: "Kaz James", title: "Footprints", label: "Another Record Label" },
          { time: "35:30", artist: "Folamour", title: "ID", note: "Unreleased" },
          { time: "41:00", artist: "H20", title: "Nobody's Business", label: "AM:PM" },
          { time: "46:00", artist: "Marc Cotterell", title: "Make Me Feel", label: "Plastik People" },
          { time: "51:00", artist: "Ferry Ultra ft. Gwen McCrae", title: "Happy (Folamour Remix)", label: "Peppermint Jam" },
          { time: "55:00", artist: "Ten City", title: "Be Free (Emmaculate & Shannon Chambers Remix)", label: "Ultra" },
          { time: "59:30", artist: "Koko", title: "7 Days In The Hotel (M-High Remix)", label: "Surge" },
          { time: "1:02:30", artist: "Robbie Doherty & FOLEY (UK)", title: "Let The Bass", label: "Avenu" },
          { time: "1:07:00", artist: "Marsolo", title: "ID" },
          { time: "1:10:00", artist: "Folamour", title: "ID", note: "Unreleased" },
          { time: "1:15:30", artist: "Daan Steenman", title: "Djingoo" },
          { time: "1:20:00", artist: "Herbert Leonard", title: "Chante Avec Moi (Young Pulse Edit)" },
          { time: "1:24:00", artist: "Patrice Rushen", title: "Forget Me Nots", label: "Elektra" }
        ]
      },
      {
        id: "folamour-yuma-coachella-2024",
        title: "Yuma, Coachella 2024 (Weekend 2)",
        venue: "Yuma, Coachella, USA",
        date: "2024-04-21",
        duration: "",
        youtube: "",
        views: 0,
        genre: ["House", "Disco"],
        tracks_identified: 13,
        tracks_total: 19,
        source: "LiveTrackList",
        tracklist: [
          { time: "", artist: "D Stone", title: "Total Unison" },
          { time: "", artist: "Udo Juergens", title: "Peace Now (Folamour Remix)" },
          { time: "", artist: "Chevals", title: "Everybody Dance" },
          { time: "", artist: "Crown Heights Affair", title: "I See The Light" },
          { time: "", artist: "Born To Funk", title: "Souma Bana" },
          { time: "", artist: "Folamour ft. Amadou & Mariam", title: "Voyage" },
          { time: "", artist: "Jasper Street Company", title: "Another Day" },
          { time: "", artist: "The Trammps", title: "I've Gotta Stand Up (Brand New Man) (Dave Lee Garage City Mix)" },
          { time: "", artist: "People's Choice", title: "Here We Go Agin (Joey Negro Philly Stomp Mix)" },
          { time: "", artist: "Jackie Moore", title: "This Time Baby" },
          { time: "", artist: "Billy Paul", title: "Only The Strong Survive" }
        ]
      },
      {
        id: "folamour-complex-sessions-074-2023",
        title: "Complex Sessions 074",
        venue: "Radio/Podcast",
        date: "2023-07-26",
        duration: "1:25:32",
        youtube: "",
        views: 0,
        genre: ["House", "Tech House"],
        tracks_identified: 10,
        tracks_total: 11,
        source: "1001tracklists",
        tracklist: [
          { time: "", artist: "Dave Lee ZR & Joey Montenegro", title: "Make A Move On Me", label: "Z Records" },
          { time: "", artist: "Udo Jürgens", title: "Peace Now (Folamour Remix)", label: "Sony" },
          { time: "", artist: "Joï", title: "Akalelo" },
          { time: "", artist: "Easttown", title: "Breeze", label: "House Of Love" },
          { time: "", artist: "Robbie Doherty & FOLEY (UK)", title: "ID" },
          { time: "", artist: "Easttown", title: "Enchance" },
          { time: "", artist: "Duke", title: "So In Love With You (Full Intention Remix)", label: "Virgin" },
          { time: "", artist: "Ferry Ultra ft. Gwen McCrae", title: "Happy (Folamour Remix)", label: "Peppermint Jam" },
          { time: "", artist: "Jamie Lewis ft. Michael Watford", title: "For You", label: "Purple Music" },
          { time: "", artist: "Dub Syndicate Productions", title: "No Longer", label: "Nice N Ripe" },
          { time: "", artist: "Dasco", title: "Feel My Love" }
        ]
      },
      {
        id: "folamour-bbc-radio1-residency-2022",
        title: "BBC Radio 1 Residency",
        venue: "BBC Radio 1, UK",
        date: "2022-01-20",
        duration: "",
        youtube: "",
        views: 0,
        genre: ["House", "Nu Disco", "Disco"],
        tracks_identified: 12,
        tracks_total: 12,
        source: "MixesDB",
        tracklist: [
          { time: "", artist: "Folamour", title: "Simple Song" },
          { time: "", artist: "Demis Roussos", title: "L.O.V.E. (Folamour Edit)" },
          { time: "", artist: "Folamour", title: "I Know It Has Been Done Before", label: "Noire & Blanche" },
          { time: "", artist: "Doug Willis", title: "Doug's Disco Theme" },
          { time: "", artist: "Saraba", title: "Barlia (Kulandjagnho)" },
          { time: "", artist: "Folamour", title: "The Journey", label: "FHUO" },
          { time: "", artist: "Kleeer", title: "Open Your Mind (Joey Negro Seeekret Mix)", label: "Warner" },
          { time: "", artist: "Parviz", title: "The Widow's Lament In Springtime", label: "Kitsune Musique Singles" },
          { time: "", artist: "Underdog", title: "In Need Of That Phone" },
          { time: "", artist: "Jorge Ben Jor", title: "A Cegonha Me Deixou Em Madureira (Aroop Roy Edit)", label: "Som Livre" },
          { time: "", artist: "Pure Energy", title: "Party On" },
          { time: "", artist: "Folamour", title: "St Moskov", label: "FHUO" }
        ]
      }
    ]
  },
  "kettama": {
    artist: "KETTAMA",
    artist_id: "kettama",
    sets: [
      {
        id: "kettama-br-london-2025",
        title: "Boiler Room London 2025",
        venue: "Boiler Room, London, UK",
        date: "2025-07-31",
        duration: "57:23",
        youtube: "JUDUC87VuPU",
        views: 1300000,
        genre: ["House", "Bass", "Garage", "UKG"],
        tracks_identified: 12,
        tracks_total: 12,
        source: "set79.com + Boiler Room",
        tracklist: [
          { time: "00:24", artist: "Soul Mass Transit System", title: "Jump (Rushing Mix)" },
          { time: "06:00", artist: "Sidney Charles & BUGS", title: "Trip Advisor (Rhythm, Snare, Bass) [2025 Warp Mix]" },
          { time: "09:12", artist: "Calvin Harris & Clementine Douglas", title: "Blessings (KETTAMA Remix)" },
          { time: "14:12", artist: "FYAH", title: "RealSpill" },
          { time: "15:36", artist: "Sir Spyro", title: "Topper Top (Feat. Teddy Bruckshot, Lady Chann & Killa P)" },
          { time: "19:36", artist: "2 Unlimited", title: "No Limit" },
          { time: "22:48", artist: "KETTAMA, DJ HEARTSTRING & KLP", title: "If U Want My Heart (Ft. KLP)" },
          { time: "29:48", artist: "Unknown", title: "ID", note: "ID" },
          { time: "40:24", artist: "GlennRoy", title: "Carbon Spaghetti" },
          { time: "42:24", artist: "Paqué", title: "Are You Ready?" },
          { time: "45:24", artist: "KETTAMA & Interplanetary Criminal", title: "Yosemite" },
          { time: "51:36", artist: "KETTAMA & Clouds", title: "Sort It Out" }
        ]
      }
    ]
  },
  "helena-hauff": {
    artist: "Helena Hauff",
    artist_id: "helena-hauff",
    sets: [
      {
        id: "helena-hauff-br-dekmantel-2017",
        title: "Boiler Room x Dekmantel Festival 2017",
        venue: "Dekmantel Festival, Amsterdamse Bos, Amsterdam",
        date: "2017-08-06",
        duration: "57:42",
        youtube: "OdJy_g1G7Ho",
        views: 1009963,
        genre: ["Electro", "Acid", "Techno"],
        tracks_identified: 16,
        tracks_total: 17,
        source: "MixesDB",
        tracklist: [
          { time: "00:00", artist: "Mumm", title: "Star", label: "STILLEBEN" },
          { time: "04:00", artist: "Carl Finlow", title: "Hashtag (Radioactive Man Remix)", label: "ELECTRIXNOIZE" },
          { time: "08:00", artist: "The Exaltics", title: "0998.0989.12", label: "SOLAR ONE MUSIC" },
          { time: "11:00", artist: "The Hacker", title: "Dans La Salle Des Machines", label: "DATAPUNK" },
          { time: "14:00", artist: "Computor Rockers", title: "Computor Science", label: "BREAKIN'THEBARRIER" },
          { time: "18:00", artist: "Sync 24 & Privacy", title: "General Data Standard", label: "CULTIVATED ELECTRONICS" },
          { time: "21:00", artist: "ID", title: "ID", note: "ID" },
          { time: "24:00", artist: "Pollon", title: "Lost Souls", label: "SCOPEX" },
          { time: "27:00", artist: "Disabled", title: "Untitled A1", label: "VARVET" },
          { time: "30:00", artist: "B.W.P. Experiments", title: "Stratoïds", label: "BONZAI" },
          { time: "33:00", artist: "Thomas Schumacher", title: "When I Rock", label: "BUSH" },
          { time: "38:00", artist: "Q.D.T", title: "Untitled B1", label: "KINGSIZE" },
          { time: "41:00", artist: "Minimum Syndicat", title: "Worth It" },
          { time: "45:00", artist: "Minimum Syndicat", title: "The Bloop" },
          { time: "48:00", artist: "Umwelt", title: "Slave To The Rave", label: "RAVE OR DIE" },
          { time: "50:00", artist: "Illektrolab", title: "Internal Software", label: "SATAMILE" },
          { time: "53:00", artist: "Zeta Reticula", title: "EP2", label: "ELECTRIXNOIZE" }
        ]
      }
    ]
  },
  "floorplan": {
    artist: "Floorplan",
    artist_id: "floorplan",
    sets: [
      {
        id: "floorplan-weather-paris-2015",
        title: "Weather Festival Paris 2015 (Mixmag)",
        venue: "Weather Festival, Paris, France",
        date: "2015-06-06",
        duration: "1:57:26",
        youtube: "Ow530rJ9W9w",
        views: 514000,
        genre: ["Techno", "Gospel House", "Detroit Techno"],
        tracks_identified: 30,
        tracks_total: 34,
        source: "MixesDB + set79.com",
        tracklist: [
          { time: "00:00", artist: "Sounds Of Blackness", "title": "The Pressure Pt.2" },
          { time: "03:00", artist: "Ben Sims", "title": "New Blood (Robert Hood Mix)", label: "Theory" },
          { time: "07:00", artist: "Floorplan", "title": "Never Grow Old", label: "M-Plant" },
          { time: "11:00", artist: "Floorplan", "title": "Phobia", label: "M-Plant" },
          { time: "14:00", artist: "Gary Beck", "title": "Get Down", label: "In The House & Defected" },
          { time: "17:00", artist: "Ben Sims", "title": "Dollar Bill Y'all (Vocal Mix)", label: "Hardgroove" },
          { time: "21:00", artist: "Floorplan", "title": "Push On", label: "M-Plant" },
          { time: "25:00", artist: "Club MCM", "title": "Club MCM (Mark Broom Re-Edit)", label: "Do Not Sleep" },
          { time: "29:00", artist: "Frankie Knuckles Pres. Directors Cut", "title": "Get Over U (Gifted Souls Remix)", label: "Nocturnal Groove Digital" },
          { time: "33:00", artist: "ID", "title": "ID", note: "unidentified" },
          { time: "37:00", artist: "Floorplan", "title": "Chord Principle", label: "M-Plant" },
          { time: "39:00", artist: "Floorplan", "title": "Let's Ride", label: "M-Plant" },
          { time: "42:00", artist: "Candi Staton", "title": "Hallelujah Anyway (Directors Cut Signature Praise)", label: "Vendetta" },
          { time: "46:00", artist: "Floorplan", "title": "Confess", label: "M-Plant" },
          { time: "48:00", artist: "Gary Beck", "title": "Rascal", label: "Bek" },
          { time: "52:00", artist: "Esteban Adame", "title": "Rays of Saturn (Robert Hood Remix)" },
          { time: "56:00", artist: "Kevin Saunderson", "title": "Bassline (Ben Sims 25th Anniversary Edit)", label: "KMS" },
          { time: "59:00", artist: "Lil Louis", "title": "French Kiss (Mark Broom Edit)" },
          { time: "1:03:00", artist: "Kevin Saunderson Feat. Inner City", "title": "Good Life (Pig&Dan Less Is More Remix)", label: "Cr2" },
          { time: "1:09:00", artist: "Ben Sims", "title": "Love", label: "Hardgroove" },
          { time: "1:13:00", artist: "Floorplan", "title": "We Magnify His Name", label: "M-Plant" },
          { time: "1:18:00", artist: "ID", "title": "ID", note: "unidentified" },
          { time: "1:22:00", artist: "Shawn Christopher", "title": "You Can Make It (B's Preacher Man Mix)" },
          { time: "1:28:00", artist: "Gingy & Bordello", "title": "All Day (Robert Hood Remix)", label: "Turbo" },
          { time: "1:31:00", artist: "Floorplan", "title": "Never Grow Old", label: "M-Plant", note: "second play" },
          { time: "1:34:00", artist: "Mark Ambrose", "title": "Shooting Stars (Ben Sims Dub Mix)", label: "Theory" },
          { time: "1:36:00", artist: "Candi Staton", "title": "Hallelujah Anyway (Directors Cut Signature Praise)", label: "Vendetta", note: "second play" },
          { time: "1:40:00", artist: "Ben Sims", "title": "Love & Hurt (Gary Beck Remix)", label: "Hardgroove" },
          { time: "1:43:00", artist: "ID", "title": "ID", note: "unidentified" },
          { time: "1:46:00", artist: "Floorplan", "title": "Eclipse", label: "M-Plant" },
          { time: "1:50:00", artist: "Floorplan", "title": "Ritual", label: "EPM" },
          { time: "1:52:00", artist: "Ritzi Lee", "title": "Reverse Processed", label: "Theory" },
          { time: "1:55:00", artist: "Arnaud Rebotini", "title": "777 (Ascii Disko Remix)", label: "Turbo" },
          { time: "1:57:00", artist: "ID", "title": "ID", note: "unidentified" }
        ]
      }
    ]
  },
  "chaos-in-the-cbd": {
    artist: "Chaos In The CBD",
    artist_id: "chaos-in-the-cbd",
    sets: [
      {
        id: "chaos-in-the-cbd-br-glitch-2022",
        title: "Boiler Room x Glitch Festival 2022",
        venue: "Glitch Festival, Malta",
        date: "2022-08-15",
        duration: "57:50",
        youtube: "gArS5VA3Vxk",
        views: 328881,
        genre: ["Deep House", "Afro House", "Acid House"],
        tracks_identified: 14,
        tracks_total: 20,
        source: "MixesDB",
        tracklist: [
          { time: "00:00", artist: "Stephanie Cooke", title: "Here With My Best Friend (Louie Vega Drumz)", label: "Nite Grooves" },
          { time: "03:00", artist: "DJ Duke", title: "Tribal Trance (Tribal Mix)", label: "Power" },
          { time: "06:00", artist: "Modal", title: "Boy (Girl (Boy Girl)", label: "Sounds." },
          { time: "11:00", artist: "Alec Wizz", title: "Drummin'", label: "ADA UK" },
          { time: "13:00", artist: "The Absolute Family", title: "Snaky Way", label: "Adult Only" },
          { time: "17:00", artist: "Unknown", title: "ID", note: "ID" },
          { time: "20:00", artist: "Didier Sinclair & DJ Chris Pi", title: "Groove 2 Me" },
          { time: "23:00", artist: "Circulation", title: "Orange (Mix A)" },
          { time: "26:00", artist: "Unknown", title: "ID", note: "ID" },
          { time: "34:00", artist: "Jerome", title: "G-Birth", label: "Music Man" },
          { time: "41:00", artist: "A Jackin' Phreak", title: "Raw Jackin'", label: "Brique Rouge" },
          { time: "44:00", artist: "Unknown", title: "ID", note: "ID" },
          { time: "47:00", artist: "Olav Basoski", title: "Get Over", label: "Armada" },
          { time: "50:00", artist: "Samuel L. Session", title: "Danses D'Afrique", label: "SLS" },
          { time: "54:00", artist: "R-Play", title: "Mojito", label: "Mix Trax" },
          { time: "55:00", artist: "Devilfish", title: "Manalive", label: "Bush" }
        ]
      }
    ]
  },
  "david-august": {
    artist: "David August",
    artist_id: "david-august",
    sets: [
      {
        id: "david-august-br-berlin-2014",
        title: "Boiler Room Berlin 2014",
        venue: "Boiler Room, Berlin, Germany",
        date: "2014-04-09",
        duration: "1:06:34",
        youtube: "mRfwdJx0NDE",
        views: 14500000,
        genre: ["Melodic House", "Techno", "Deep House"],
        tracks_identified: 8,
        tracks_total: 8,
        source: "1001tracklists + MixesDB",
        tracklist: [
          { time: "00:13", artist: "Kollektiv Turmstrasse", title: "Last Day (David August Revision)", label: "DIYNAMIC" },
          { time: "16:52", artist: "Syl Johnson", title: "Is It Because I'm Black (David August Reconstruction)" },
          { time: "27:00", artist: "Rebekah Del Rio", title: "Llorando (David August Edit)" },
          { time: "38:19", artist: "David August", title: "Ingrid" },
          { time: "45:53", artist: "Tomas Barfod ft. Nina K", title: "Pulsing (David August Remix)", label: "Secretly Canadian" },
          { time: "51:22", artist: "Ten Walls", title: "Gotham (David August Edit)" },
          { time: "56:03", artist: "High Heels Breaker ft. Sarah Palin", title: "Come Easy (David August Remix)", label: "Drumpoet" },
          { time: "1:00:52", artist: "Grizzly Bear", title: "Yet Again (David August Remix)", label: "Warp" }
        ]
      }
    ]
  }
,
  "peggy-gou": {
    "artist": "Peggy Gou",
    "artist_id": "peggy-gou",
    "sets": [
        {
            "id": "peggy-gou-cercle-lille-2024",
            "title": "Cercle @ Palais des Beaux-Arts de Lille",
            "venue": "Palais des Beaux-Arts, Lille, France",
            "date": "2024-03-16",
            "duration": "1:48:21",
            "youtube": "-UOMvxh4MYU",
            "views": 6104298,
            "genre": [
                "House",
                "Techno",
                "Electro"
            ],
            "tracks_identified": 22,
            "tracks_total": 22,
            "source": "YouTube description",
            "tracklist": [
                {
                    "time": "00:00",
                    "artist": "Ebi",
                    "title": "San"
                },
                {
                    "time": "02:55",
                    "artist": "ID",
                    "title": "ID",
                    "note": "ID"
                },
                {
                    "time": "05:33",
                    "artist": "Commix",
                    "title": "Satellite Song (Underground Resistance Remix)"
                },
                {
                    "time": "08:20",
                    "artist": "Woody McBride",
                    "title": "Darrin Houston"
                },
                {
                    "time": "12:38",
                    "artist": "Jellybean",
                    "title": "Twilight Drone"
                },
                {
                    "time": "17:35",
                    "artist": "Dancer",
                    "title": "Boom Boom (Jerome Hill Edit)"
                },
                {
                    "time": "21:22",
                    "artist": "Spacetime Continuum",
                    "title": "Drug #6"
                },
                {
                    "time": "26:08",
                    "artist": "Ongaku",
                    "title": "Mihon #1"
                },
                {
                    "time": "29:48",
                    "artist": "Penance",
                    "title": "Deniro"
                },
                {
                    "time": "34:09",
                    "artist": "Lewski",
                    "title": "Gru"
                },
                {
                    "time": "38:30",
                    "artist": "Kraftwerk",
                    "title": "Aerodynamik (François K Aero Mix)"
                },
                {
                    "time": "44:31",
                    "artist": "Kim English",
                    "title": "Learn 2 Luv (Pearson Sound Mix)"
                },
                {
                    "time": "47:27",
                    "artist": "Château Flight",
                    "title": "Sargan"
                },
                {
                    "time": "53:21",
                    "artist": "Paul Johnson",
                    "title": "Come On Children (Remix)"
                },
                {
                    "time": "57:08",
                    "artist": "Digital Excitation",
                    "title": "Pure Pleasure (Rave Mix)"
                },
                {
                    "time": "1:01:09",
                    "artist": "Special Request",
                    "title": "Reset It (Head High Dirt Mix)"
                },
                {
                    "time": "1:05:25",
                    "artist": "Kraftwerk",
                    "title": "Expo 2000 (DJ Rolando Remix)"
                },
                {
                    "time": "1:10:30",
                    "artist": "Skee Mask",
                    "title": "Fjorward Flex Dub"
                },
                {
                    "time": "1:15:00",
                    "artist": "Dreamscape",
                    "title": "Born"
                },
                {
                    "time": "1:20:10",
                    "artist": "Metro",
                    "title": "Here For The Love (Metropolitan Acid Mix)"
                },
                {
                    "time": "1:26:35",
                    "artist": "Peggy Gou",
                    "title": "It Makes You Forget (I:Cube Remix)"
                },
                {
                    "time": "1:31:19",
                    "artist": "Tan-Ru",
                    "title": "Body Move"
                }
            ]
        }
    ]
},
  "mall-grab": {
    "artist": "Mall Grab",
    "artist_id": "mall-grab",
    "sets": [
        {
            "id": "mall-grab-br-melbourne-2022",
            "title": "Boiler Room Melbourne",
            "venue": "Pica, Melbourne, Australia",
            "date": "2022-11-26",
            "duration": "1:30:02",
            "youtube": "ddeAyYF_uwg",
            "views": 2382681,
            "genre": [
                "House",
                "Techno",
                "Breaks",
                "Rave"
            ],
            "tracks_identified": 24,
            "tracks_total": 25,
            "source": "MixesDB + set79.com",
            "tracklist": [
                {
                    "time": "00:00",
                    "artist": "Fishmans",
                    "title": "Long Season (MG Edit)"
                },
                {
                    "time": "04:00",
                    "artist": "Mall Grab",
                    "title": "Winter"
                },
                {
                    "time": "07:00",
                    "artist": "Mall Grab",
                    "title": "Spirit Wave"
                },
                {
                    "time": "12:00",
                    "artist": "Mall Grab",
                    "title": "Mirror Break (4/4 Mix)"
                },
                {
                    "time": "15:00",
                    "artist": "Mall Grab",
                    "title": "Inside"
                },
                {
                    "time": "18:00",
                    "artist": "KETTAMA",
                    "title": "Rok Da House"
                },
                {
                    "time": "21:00",
                    "artist": "Mall Grab",
                    "title": "Marathon"
                },
                {
                    "time": "25:00",
                    "artist": "Mall Grab & Flansie",
                    "title": "Love Yourself"
                },
                {
                    "time": "30:00",
                    "artist": "Mall Grab",
                    "title": "Tremors"
                },
                {
                    "time": "33:00",
                    "artist": "Mall Grab",
                    "title": "Bear Witness"
                },
                {
                    "time": "36:30",
                    "artist": "Surusinghe",
                    "title": "Likshot"
                },
                {
                    "time": "40:30",
                    "artist": "Effy",
                    "title": "Get Down"
                },
                {
                    "time": "44:00",
                    "artist": "Mall Grab & C.R.T.B.",
                    "title": "Juice (MG Remix)"
                },
                {
                    "time": "47:30",
                    "artist": "Mall Grab",
                    "title": "Say Nothing (Dub Mix)"
                },
                {
                    "time": "50:00",
                    "artist": "KETTAMA",
                    "title": "Feel Emotion"
                },
                {
                    "time": "55:30",
                    "artist": "X CLUB.",
                    "title": "Say No More"
                },
                {
                    "time": "1:00:00",
                    "artist": "Mall Grab",
                    "title": "Escape From Belanglo"
                },
                {
                    "time": "1:02:00",
                    "artist": "Mall Grab",
                    "title": "BB MG"
                },
                {
                    "time": "1:07:30",
                    "artist": "C.R.T.B.",
                    "title": "It Never Ends"
                },
                {
                    "time": "1:11:00",
                    "artist": "Mall Grab & C.R.T.B.",
                    "title": "Juice (First Mix)"
                },
                {
                    "time": "1:14:00",
                    "artist": "Clouds",
                    "title": "Plastyx"
                },
                {
                    "time": "1:17:50",
                    "artist": "Mall Grab",
                    "title": "Madman"
                },
                {
                    "time": "1:21:00",
                    "artist": "Mall Grab",
                    "title": "1ofthozedaze (Edit)"
                },
                {
                    "time": "1:24:40",
                    "artist": "Mall Grab",
                    "title": "Metaphysical"
                }
            ]
        }
    ]
},
  "hunee": {
    "artist": "Hunee",
    "artist_id": "hunee",
    "sets": [
        {
            "id": "hunee-br-dekmantel-2015",
            "title": "Boiler Room x Dekmantel Festival",
            "venue": "Dekmantel Festival, Amsterdam",
            "date": "2015-07-31",
            "duration": "58:53",
            "youtube": "0RIU0cy6L1I",
            "views": 1794251,
            "genre": [
                "Disco",
                "House",
                "Boogie",
                "Funk"
            ],
            "tracks_identified": 18,
            "tracks_total": 18,
            "source": "MixesDB",
            "tracklist": [
                {
                    "time": "00:15",
                    "artist": "Shadow",
                    "title": "Let's Make It Up"
                },
                {
                    "time": "03:30",
                    "artist": "Sammy Barbot",
                    "title": "New Mexico"
                },
                {
                    "time": "06:20",
                    "artist": "Udell",
                    "title": "Won't You Try"
                },
                {
                    "time": "09:40",
                    "artist": "Kiki Gyan",
                    "title": "Disco Dancer"
                },
                {
                    "time": "13:00",
                    "artist": "Javaroo",
                    "title": "Breakin In'"
                },
                {
                    "time": "16:20",
                    "artist": "House Of Doors",
                    "title": "Burmstar (Twin Mix)"
                },
                {
                    "time": "18:50",
                    "artist": "The Coachouse Rhythm Section",
                    "title": "Time Warp"
                },
                {
                    "time": "21:50",
                    "artist": "Sheryl Lee Ralph",
                    "title": "In The Evening"
                },
                {
                    "time": "25:45",
                    "artist": "Gavin Russom",
                    "title": "The Telstar File"
                },
                {
                    "time": "29:20",
                    "artist": "Mappa Mundi",
                    "title": "Sexafari"
                },
                {
                    "time": "31:30",
                    "artist": "Errorsmith & Mark Fell",
                    "title": "Cuica Digitales"
                },
                {
                    "time": "34:25",
                    "artist": "Kindred Spirit",
                    "title": "Put Your Spirit Up"
                },
                {
                    "time": "38:50",
                    "artist": "Mac Gregor",
                    "title": "Nan Ye Li Kan"
                },
                {
                    "time": "42:40",
                    "artist": "Lyman Woodard",
                    "title": "Theme In Search Of A Sportspectacular"
                },
                {
                    "time": "47:20",
                    "artist": "Estiban",
                    "title": "Come To Me"
                },
                {
                    "time": "51:20",
                    "artist": "Jimmy Smith",
                    "title": "Can't Hide Love"
                },
                {
                    "time": "54:45",
                    "artist": "Odessey 1",
                    "title": "Last Night"
                },
                {
                    "time": "57:30",
                    "artist": "Chiwoniso",
                    "title": "Zvichapera"
                }
            ]
        }
    ]
},
  "kerri-chandler": {
    "artist": "Kerri Chandler",
    "artist_id": "kerri-chandler",
    "sets": [
        {
            "id": "kerri-chandler-br-nyc-136",
            "title": "Boiler Room New York (Reel-to-Reel Set)",
            "venue": "Boiler Room, New York City",
            "date": "2022-09-23",
            "duration": "2:16:05",
            "youtube": "K6XiDub2Wc4",
            "views": 1496023,
            "genre": [
                "Deep House",
                "Soulful House",
                "Garage"
            ],
            "tracks_identified": 29,
            "tracks_total": 29,
            "source": "MixesDB + LiveTrackList",
            "tracklist": [
                {
                    "time": "00:00",
                    "artist": "JohNick",
                    "title": "Heat",
                    "label": "Henry Street Music",
                    "note": "w/ Martin Ikin ft. Byron Stingily - Devoted (Acapella)"
                },
                {
                    "time": "05:00",
                    "artist": "Michel De Hey",
                    "title": "Tracklights (Crackazat Dub)",
                    "label": "Ovum"
                },
                {
                    "time": "10:00",
                    "artist": "Yves Murasca",
                    "title": "All About Housemusic (Dario D'Attis Extended Remix)",
                    "label": "Deepalma"
                },
                {
                    "time": "14:00",
                    "artist": "Massimo Lippoli",
                    "title": "Let It Ride (Dario D'Attis Remix)",
                    "label": "Go Deeva"
                },
                {
                    "time": "19:00",
                    "artist": "Kerri Chandler",
                    "title": "Atmospheric Beats",
                    "label": "Ibadan"
                },
                {
                    "time": "24:00",
                    "artist": "Masters At Work ft. India",
                    "title": "I Can't Get No Sleep (Ken/Lou 12\")",
                    "label": "Cutting"
                },
                {
                    "time": "28:00",
                    "artist": "Peven Everett",
                    "title": "Special (Timmy Regisford Remix)",
                    "label": "Groovin"
                },
                {
                    "time": "32:00",
                    "artist": "Emmaculate",
                    "title": "Voodoo (Shannon Chambers 1Sound Remix)",
                    "label": "T's Crates"
                },
                {
                    "time": "38:00",
                    "artist": "Armonica ft. Toshi",
                    "title": "Ngeke (andhim Remix)",
                    "label": "MoBlack"
                },
                {
                    "time": "42:00",
                    "artist": "Kerri Chandler ft. Lady Linn",
                    "title": "You Get Lost In It (The Warehouse Project)",
                    "label": "Kaoz Theory"
                },
                {
                    "time": "46:00",
                    "artist": "Jovonn",
                    "title": "Hesperia Soul (Main Mix)",
                    "label": "Body'N Deep"
                },
                {
                    "time": "52:00",
                    "artist": "Kerri Chandler ft. Troy Denari",
                    "title": "Change Your Mind (District 8) (Full Vocal)",
                    "label": "Kaoz Theory"
                },
                {
                    "time": "57:00",
                    "artist": "Terry Hunter ft. Devine Brown",
                    "title": "Angel",
                    "label": "Ultra"
                },
                {
                    "time": "1:03:00",
                    "artist": "Crackazat",
                    "title": "Fire Drift"
                },
                {
                    "time": "1:08:00",
                    "artist": "Honey Dijon ft. Annette Bowen & Nikki-O",
                    "title": "Downtown (Louie Vega Extended Raw Dub Mix)",
                    "label": "Classic"
                },
                {
                    "time": "1:12:00",
                    "artist": "Mateo & Matos",
                    "title": "Release The Rhythm (Kevin McKay Extended Remix)",
                    "label": "Glasgow Underground"
                },
                {
                    "time": "1:14:00",
                    "artist": "Matt Early & Lee Jeffries ft. Otis Corley",
                    "title": "I Think I'm Falling In Love (Grant Nelson Remix)",
                    "label": "Lockdown"
                },
                {
                    "time": "1:18:00",
                    "artist": "Kerri Chandler ft. Rev F.L. Brown",
                    "title": "Prayer (623 Again Vocal)",
                    "label": "Kaoz Theory"
                },
                {
                    "time": "1:20:00",
                    "artist": "DJ Kwame",
                    "title": "Spirit Dance (Timmy Regisford Edit)",
                    "label": "Nervous"
                },
                {
                    "time": "1:25:00",
                    "artist": "Jovonn",
                    "title": "Random (Extended Mix)",
                    "label": "Nu Groove"
                },
                {
                    "time": "1:28:00",
                    "artist": "Dennis Ferrer ft. Tyrone Ellis",
                    "title": "Underground Is My Home",
                    "label": "King Street Sounds"
                },
                {
                    "time": "1:32:00",
                    "artist": "Demuir",
                    "title": "High. Alive. And Dirty.",
                    "label": "Hot Creations"
                },
                {
                    "time": "1:35:00",
                    "artist": "Kerri Chandler ft. Sunchilde",
                    "title": "Never Thought (Printworks) (Main Vocal Mix)",
                    "label": "Kaoz Theory"
                },
                {
                    "time": "1:39:00",
                    "artist": "Kerri Chandler",
                    "title": "I Feel It",
                    "label": "Madhouse"
                },
                {
                    "time": "1:43:00",
                    "artist": "Fusion Groove Orchestra ft. Steve Lucas",
                    "title": "If Only I Could (Liem Remix)",
                    "label": "Strictly Rhythm"
                },
                {
                    "time": "1:48:00",
                    "artist": "Kerri Chandler",
                    "title": "So Let The Wind Come",
                    "label": "Nite Grooves"
                },
                {
                    "time": "1:53:00",
                    "artist": "Tasha LaRae & DJ Spen",
                    "title": "Wish I Didn't Miss You (John Morales M+M Vocal Mix)",
                    "label": "Quantize"
                },
                {
                    "time": "1:59:00",
                    "artist": "Underground Ministries ft. Kenny Bobien",
                    "title": "I Shall Not Be Moved (Stand Still) (Extended Club Mix)",
                    "label": "Flatline"
                },
                {
                    "time": "2:06:00",
                    "artist": "The O'Jays",
                    "title": "I Love Music (Part I)",
                    "label": "Philadelphia International"
                }
            ]
        }
    ]
},
  "peggy-gou": {
    "artist": "Peggy Gou",
    "artist_id": "peggy-gou",
    "sets": [
        {
            "id": "peggy-gou-cercle-lille-2024",
            "title": "Cercle @ Palais des Beaux-Arts de Lille",
            "venue": "Palais des Beaux-Arts, Lille, France",
            "date": "2024-03-16",
            "duration": "1:48:21",
            "youtube": "-UOMvxh4MYU",
            "views": 6104298,
            "genre": [
                "House",
                "Techno",
                "Electro"
            ],
            "tracks_identified": 22,
            "tracks_total": 22,
            "source": "YouTube description",
            "tracklist": [
                {
                    "time": "00:00",
                    "artist": "Ebi",
                    "title": "San"
                },
                {
                    "time": "02:55",
                    "artist": "ID",
                    "title": "ID",
                    "note": "ID"
                },
                {
                    "time": "05:33",
                    "artist": "Commix",
                    "title": "Satellite Song (Underground Resistance Remix)"
                },
                {
                    "time": "08:20",
                    "artist": "Woody McBride",
                    "title": "Darrin Houston"
                },
                {
                    "time": "12:38",
                    "artist": "Jellybean",
                    "title": "Twilight Drone"
                },
                {
                    "time": "17:35",
                    "artist": "Dancer",
                    "title": "Boom Boom (Jerome Hill Edit)"
                },
                {
                    "time": "21:22",
                    "artist": "Spacetime Continuum",
                    "title": "Drug #6"
                },
                {
                    "time": "26:08",
                    "artist": "Ongaku",
                    "title": "Mihon #1"
                },
                {
                    "time": "29:48",
                    "artist": "Penance",
                    "title": "Deniro"
                },
                {
                    "time": "34:09",
                    "artist": "Lewski",
                    "title": "Gru"
                },
                {
                    "time": "38:30",
                    "artist": "Kraftwerk",
                    "title": "Aerodynamik (François K Aero Mix)"
                },
                {
                    "time": "44:31",
                    "artist": "Kim English",
                    "title": "Learn 2 Luv (Pearson Sound Mix)"
                },
                {
                    "time": "47:27",
                    "artist": "Château Flight",
                    "title": "Sargan"
                },
                {
                    "time": "53:21",
                    "artist": "Paul Johnson",
                    "title": "Come On Children (Remix)"
                },
                {
                    "time": "57:08",
                    "artist": "Digital Excitation",
                    "title": "Pure Pleasure (Rave Mix)"
                },
                {
                    "time": "1:01:09",
                    "artist": "Special Request",
                    "title": "Reset It (Head High Dirt Mix)"
                },
                {
                    "time": "1:05:25",
                    "artist": "Kraftwerk",
                    "title": "Expo 2000 (DJ Rolando Remix)"
                },
                {
                    "time": "1:10:30",
                    "artist": "Skee Mask",
                    "title": "Fjorward Flex Dub"
                },
                {
                    "time": "1:15:00",
                    "artist": "Dreamscape",
                    "title": "Born"
                },
                {
                    "time": "1:20:10",
                    "artist": "Metro",
                    "title": "Here For The Love (Metropolitan Acid Mix)"
                },
                {
                    "time": "1:26:35",
                    "artist": "Peggy Gou",
                    "title": "It Makes You Forget (I:Cube Remix)"
                },
                {
                    "time": "1:31:19",
                    "artist": "Tan-Ru",
                    "title": "Body Move"
                }
            ]
        }
    ]
},
  "mall-grab": {
    "artist": "Mall Grab",
    "artist_id": "mall-grab",
    "sets": [
        {
            "id": "mall-grab-br-melbourne-2022",
            "title": "Boiler Room Melbourne",
            "venue": "Pica, Melbourne, Australia",
            "date": "2022-11-26",
            "duration": "1:30:02",
            "youtube": "ddeAyYF_uwg",
            "views": 2382681,
            "genre": [
                "House",
                "Techno",
                "Breaks",
                "Rave"
            ],
            "tracks_identified": 24,
            "tracks_total": 25,
            "source": "MixesDB + set79.com",
            "tracklist": [
                {
                    "time": "00:00",
                    "artist": "Fishmans",
                    "title": "Long Season (MG Edit)"
                },
                {
                    "time": "04:00",
                    "artist": "Mall Grab",
                    "title": "Winter"
                },
                {
                    "time": "07:00",
                    "artist": "Mall Grab",
                    "title": "Spirit Wave"
                },
                {
                    "time": "12:00",
                    "artist": "Mall Grab",
                    "title": "Mirror Break (4/4 Mix)"
                },
                {
                    "time": "15:00",
                    "artist": "Mall Grab",
                    "title": "Inside"
                },
                {
                    "time": "18:00",
                    "artist": "KETTAMA",
                    "title": "Rok Da House"
                },
                {
                    "time": "21:00",
                    "artist": "Mall Grab",
                    "title": "Marathon"
                },
                {
                    "time": "25:00",
                    "artist": "Mall Grab & Flansie",
                    "title": "Love Yourself"
                },
                {
                    "time": "30:00",
                    "artist": "Mall Grab",
                    "title": "Tremors"
                },
                {
                    "time": "33:00",
                    "artist": "Mall Grab",
                    "title": "Bear Witness"
                },
                {
                    "time": "36:30",
                    "artist": "Surusinghe",
                    "title": "Likshot"
                },
                {
                    "time": "40:30",
                    "artist": "Effy",
                    "title": "Get Down"
                },
                {
                    "time": "44:00",
                    "artist": "Mall Grab & C.R.T.B.",
                    "title": "Juice (MG Remix)"
                },
                {
                    "time": "47:30",
                    "artist": "Mall Grab",
                    "title": "Say Nothing (Dub Mix)"
                },
                {
                    "time": "50:00",
                    "artist": "KETTAMA",
                    "title": "Feel Emotion"
                },
                {
                    "time": "55:30",
                    "artist": "X CLUB.",
                    "title": "Say No More"
                },
                {
                    "time": "1:00:00",
                    "artist": "Mall Grab",
                    "title": "Escape From Belanglo"
                },
                {
                    "time": "1:02:00",
                    "artist": "Mall Grab",
                    "title": "BB MG"
                },
                {
                    "time": "1:07:30",
                    "artist": "C.R.T.B.",
                    "title": "It Never Ends"
                },
                {
                    "time": "1:11:00",
                    "artist": "Mall Grab & C.R.T.B.",
                    "title": "Juice (First Mix)"
                },
                {
                    "time": "1:14:00",
                    "artist": "Clouds",
                    "title": "Plastyx"
                },
                {
                    "time": "1:17:50",
                    "artist": "Mall Grab",
                    "title": "Madman"
                },
                {
                    "time": "1:21:00",
                    "artist": "Mall Grab",
                    "title": "1ofthozedaze (Edit)"
                },
                {
                    "time": "1:24:40",
                    "artist": "Mall Grab",
                    "title": "Metaphysical"
                }
            ]
        }
    ]
},
  "hunee": {
    "artist": "Hunee",
    "artist_id": "hunee",
    "sets": [
        {
            "id": "hunee-br-dekmantel-2015",
            "title": "Boiler Room x Dekmantel Festival",
            "venue": "Dekmantel Festival, Amsterdam",
            "date": "2015-07-31",
            "duration": "58:53",
            "youtube": "0RIU0cy6L1I",
            "views": 1794251,
            "genre": [
                "Disco",
                "House",
                "Boogie",
                "Funk"
            ],
            "tracks_identified": 18,
            "tracks_total": 18,
            "source": "MixesDB",
            "tracklist": [
                {
                    "time": "00:15",
                    "artist": "Shadow",
                    "title": "Let's Make It Up"
                },
                {
                    "time": "03:30",
                    "artist": "Sammy Barbot",
                    "title": "New Mexico"
                },
                {
                    "time": "06:20",
                    "artist": "Udell",
                    "title": "Won't You Try"
                },
                {
                    "time": "09:40",
                    "artist": "Kiki Gyan",
                    "title": "Disco Dancer"
                },
                {
                    "time": "13:00",
                    "artist": "Javaroo",
                    "title": "Breakin In'"
                },
                {
                    "time": "16:20",
                    "artist": "House Of Doors",
                    "title": "Burmstar (Twin Mix)"
                },
                {
                    "time": "18:50",
                    "artist": "The Coachouse Rhythm Section",
                    "title": "Time Warp"
                },
                {
                    "time": "21:50",
                    "artist": "Sheryl Lee Ralph",
                    "title": "In The Evening"
                },
                {
                    "time": "25:45",
                    "artist": "Gavin Russom",
                    "title": "The Telstar File"
                },
                {
                    "time": "29:20",
                    "artist": "Mappa Mundi",
                    "title": "Sexafari"
                },
                {
                    "time": "31:30",
                    "artist": "Errorsmith & Mark Fell",
                    "title": "Cuica Digitales"
                },
                {
                    "time": "34:25",
                    "artist": "Kindred Spirit",
                    "title": "Put Your Spirit Up"
                },
                {
                    "time": "38:50",
                    "artist": "Mac Gregor",
                    "title": "Nan Ye Li Kan"
                },
                {
                    "time": "42:40",
                    "artist": "Lyman Woodard",
                    "title": "Theme In Search Of A Sportspectacular"
                },
                {
                    "time": "47:20",
                    "artist": "Estiban",
                    "title": "Come To Me"
                },
                {
                    "time": "51:20",
                    "artist": "Jimmy Smith",
                    "title": "Can't Hide Love"
                },
                {
                    "time": "54:45",
                    "artist": "Odessey 1",
                    "title": "Last Night"
                },
                {
                    "time": "57:30",
                    "artist": "Chiwoniso",
                    "title": "Zvichapera"
                }
            ]
        }
    ]
},
  "kerri-chandler": {
    "artist": "Kerri Chandler",
    "artist_id": "kerri-chandler",
    "sets": [
        {
            "id": "kerri-chandler-br-nyc-136",
            "title": "Boiler Room New York (Reel-to-Reel Set)",
            "venue": "Boiler Room, New York City",
            "date": "2022-09-23",
            "duration": "2:16:05",
            "youtube": "K6XiDub2Wc4",
            "views": 1496023,
            "genre": [
                "Deep House",
                "Soulful House",
                "Garage"
            ],
            "tracks_identified": 29,
            "tracks_total": 29,
            "source": "MixesDB + LiveTrackList",
            "tracklist": [
                {
                    "time": "00:00",
                    "artist": "JohNick",
                    "title": "Heat",
                    "label": "Henry Street Music",
                    "note": "w/ Martin Ikin ft. Byron Stingily - Devoted (Acapella)"
                },
                {
                    "time": "05:00",
                    "artist": "Michel De Hey",
                    "title": "Tracklights (Crackazat Dub)",
                    "label": "Ovum"
                },
                {
                    "time": "10:00",
                    "artist": "Yves Murasca",
                    "title": "All About Housemusic (Dario D'Attis Extended Remix)",
                    "label": "Deepalma"
                },
                {
                    "time": "14:00",
                    "artist": "Massimo Lippoli",
                    "title": "Let It Ride (Dario D'Attis Remix)",
                    "label": "Go Deeva"
                },
                {
                    "time": "19:00",
                    "artist": "Kerri Chandler",
                    "title": "Atmospheric Beats",
                    "label": "Ibadan"
                },
                {
                    "time": "24:00",
                    "artist": "Masters At Work ft. India",
                    "title": "I Can't Get No Sleep (Ken/Lou 12\")",
                    "label": "Cutting"
                },
                {
                    "time": "28:00",
                    "artist": "Peven Everett",
                    "title": "Special (Timmy Regisford Remix)",
                    "label": "Groovin"
                },
                {
                    "time": "32:00",
                    "artist": "Emmaculate",
                    "title": "Voodoo (Shannon Chambers 1Sound Remix)",
                    "label": "T's Crates"
                },
                {
                    "time": "38:00",
                    "artist": "Armonica ft. Toshi",
                    "title": "Ngeke (andhim Remix)",
                    "label": "MoBlack"
                },
                {
                    "time": "42:00",
                    "artist": "Kerri Chandler ft. Lady Linn",
                    "title": "You Get Lost In It (The Warehouse Project)",
                    "label": "Kaoz Theory"
                },
                {
                    "time": "46:00",
                    "artist": "Jovonn",
                    "title": "Hesperia Soul (Main Mix)",
                    "label": "Body'N Deep"
                },
                {
                    "time": "52:00",
                    "artist": "Kerri Chandler ft. Troy Denari",
                    "title": "Change Your Mind (District 8) (Full Vocal)",
                    "label": "Kaoz Theory"
                },
                {
                    "time": "57:00",
                    "artist": "Terry Hunter ft. Devine Brown",
                    "title": "Angel",
                    "label": "Ultra"
                },
                {
                    "time": "1:03:00",
                    "artist": "Crackazat",
                    "title": "Fire Drift"
                },
                {
                    "time": "1:08:00",
                    "artist": "Honey Dijon ft. Annette Bowen & Nikki-O",
                    "title": "Downtown (Louie Vega Extended Raw Dub Mix)",
                    "label": "Classic"
                },
                {
                    "time": "1:12:00",
                    "artist": "Mateo & Matos",
                    "title": "Release The Rhythm (Kevin McKay Extended Remix)",
                    "label": "Glasgow Underground"
                },
                {
                    "time": "1:14:00",
                    "artist": "Matt Early & Lee Jeffries ft. Otis Corley",
                    "title": "I Think I'm Falling In Love (Grant Nelson Remix)",
                    "label": "Lockdown"
                },
                {
                    "time": "1:18:00",
                    "artist": "Kerri Chandler ft. Rev F.L. Brown",
                    "title": "Prayer (623 Again Vocal)",
                    "label": "Kaoz Theory"
                },
                {
                    "time": "1:20:00",
                    "artist": "DJ Kwame",
                    "title": "Spirit Dance (Timmy Regisford Edit)",
                    "label": "Nervous"
                },
                {
                    "time": "1:25:00",
                    "artist": "Jovonn",
                    "title": "Random (Extended Mix)",
                    "label": "Nu Groove"
                },
                {
                    "time": "1:28:00",
                    "artist": "Dennis Ferrer ft. Tyrone Ellis",
                    "title": "Underground Is My Home",
                    "label": "King Street Sounds"
                },
                {
                    "time": "1:32:00",
                    "artist": "Demuir",
                    "title": "High. Alive. And Dirty.",
                    "label": "Hot Creations"
                },
                {
                    "time": "1:35:00",
                    "artist": "Kerri Chandler ft. Sunchilde",
                    "title": "Never Thought (Printworks) (Main Vocal Mix)",
                    "label": "Kaoz Theory"
                },
                {
                    "time": "1:39:00",
                    "artist": "Kerri Chandler",
                    "title": "I Feel It",
                    "label": "Madhouse"
                },
                {
                    "time": "1:43:00",
                    "artist": "Fusion Groove Orchestra ft. Steve Lucas",
                    "title": "If Only I Could (Liem Remix)",
                    "label": "Strictly Rhythm"
                },
                {
                    "time": "1:48:00",
                    "artist": "Kerri Chandler",
                    "title": "So Let The Wind Come",
                    "label": "Nite Grooves"
                },
                {
                    "time": "1:53:00",
                    "artist": "Tasha LaRae & DJ Spen",
                    "title": "Wish I Didn't Miss You (John Morales M+M Vocal Mix)",
                    "label": "Quantize"
                },
                {
                    "time": "1:59:00",
                    "artist": "Underground Ministries ft. Kenny Bobien",
                    "title": "I Shall Not Be Moved (Stand Still) (Extended Club Mix)",
                    "label": "Flatline"
                },
                {
                    "time": "2:06:00",
                    "artist": "The O'Jays",
                    "title": "I Love Music (Part I)",
                    "label": "Philadelphia International"
                }
            ]
        }
    ]
},
};

// Tracklist API functions
const TracklistAPI = {
  /**
   * Get all sets for a specific DJ
   */
  getSetsByArtist(artistId) {
    const data = TRACKLISTS[artistId];
    return data ? data.sets : [];
  },

  /**
   * Get a specific set by ID
   */
  getSet(setId) {
    for (const artistId in TRACKLISTS) {
      const set = TRACKLISTS[artistId].sets.find(s => s.id === setId);
      if (set) return set;
    }
    return null;
  },

  /**
   * Search tracks across all sets
   */
  searchTracks(query) {
    const results = [];
    const q = query.toLowerCase();

    for (const artistId in TRACKLISTS) {
      TRACKLISTS[artistId].sets.forEach(set => {
        set.tracklist.forEach(track => {
          if (
            track.artist.toLowerCase().includes(q) ||
            track.title.toLowerCase().includes(q) ||
            (track.label && track.label.toLowerCase().includes(q))
          ) {
            results.push({
              ...track,
              set_id: set.id,
              set_title: set.title,
              set_date: set.date,
              set_youtube: set.youtube,
              dj: TRACKLISTS[artistId].artist
            });
          }
        });
      });
    }

    return results;
  },

  /**
   * Find all sets where a specific track was played
   */
  findTrackAcrossSets(artist, title) {
    const results = [];
    const artistLower = artist.toLowerCase();
    const titleLower = title.toLowerCase();

    for (const artistId in TRACKLISTS) {
      TRACKLISTS[artistId].sets.forEach(set => {
        set.tracklist.forEach(track => {
          if (
            track.artist.toLowerCase().includes(artistLower) &&
            track.title.toLowerCase().includes(titleLower)
          ) {
            results.push({
              ...track,
              set_id: set.id,
              set_title: set.title,
              set_date: set.date,
              set_venue: set.venue,
              set_youtube: set.youtube,
              dj: TRACKLISTS[artistId].artist
            });
          }
        });
      });
    }

    return results;
  },

  /**
   * Get all unique artists across all tracklists
   */
  getAllArtists() {
    const artists = new Set();
    for (const artistId in TRACKLISTS) {
      TRACKLISTS[artistId].sets.forEach(set => {
        set.tracklist.forEach(track => {
          // Extract main artist (before "ft." or "&")
          const mainArtist = track.artist.split(/\s*(?:ft\.|&|,)/i)[0].trim();
          if (mainArtist) artists.add(mainArtist);
        });
      });
    }
    return Array.from(artists).sort();
  },

  /**
   * Get all unique labels across all tracklists
   */
  getAllLabels() {
    const labels = new Set();
    for (const artistId in TRACKLISTS) {
      TRACKLISTS[artistId].sets.forEach(set => {
        set.tracklist.forEach(track => {
          if (track.label) labels.add(track.label);
        });
      });
    }
    return Array.from(labels).sort();
  },

  /**
   * Get statistics across all tracklists
   */
  getStats() {
    let totalSets = 0;
    let totalTracks = 0;
    let totalIdentified = 0;

    for (const artistId in TRACKLISTS) {
      const sets = TRACKLISTS[artistId].sets;
      totalSets += sets.length;
      sets.forEach(set => {
        totalTracks += set.tracks_total;
        totalIdentified += set.tracks_identified;
      });
    }

    return {
      totalSets,
      totalTracks,
      totalIdentified,
      identificationRate: totalTracks > 0 ? Math.round((totalIdentified / totalTracks) * 100) : 0
    };
  }
};
