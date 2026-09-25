/**
 * Blog content pillars — source of truth (house pattern like data/crew).
 * Research inputs: research/pillar dirs (crawl4ai Docker + local) + cited web sources.
 * rendered by blog.html initBlogPage().
 */
window.BLOG_PILLARS = {
  atlas: [
    {
      id: 'mejor-ambiente-2026',
      title: '¿Dónde está el mejor ambiente? Time Out midió 150 ciudades',
      excerpt:
        'Encuesta de 24,000 locales: Sofía encabeza el clubbing mundial; Medellín y Lima empatan; Guadalajara y CDMX entran al top 20.',
      meta: ['Jun 2026', 'Visualización', 'Fuentes citadas'],
      sources: [
        {
          label: 'Time Out — Best cities for clubbing 2026',
          href: 'https://www.timeout.com/news/worlds-best-cities-for-clubbing-090426',
        },
      ],
      stats: [
        { label: 'Sofía', value: '72%' },
        { label: 'Medellín / Lima', value: '71%' },
        { label: 'Guadalajara', value: '67%' },
        { label: 'CDMX', value: '62%' },
      ],
      chart: {
        type: 'bar',
        title: 'Locales que dicen “clubbing es lo mejor de su ciudad”',
        unit: '%',
        items: [
          { name: 'Sofía', value: 72 },
          { name: 'Medellín', value: 71 },
          { name: 'Lima', value: 71 },
          { name: 'Miami', value: 70 },
          { name: 'Ciudad de Panamá', value: 69 },
          { name: 'Liverpool', value: 69 },
          { name: 'Bogotá', value: 68 },
          { name: 'Guadalajara', value: 67 },
          { name: 'Newcastle', value: 67 },
          { name: 'Las Vegas', value: 67 },
          { name: 'Madrid', value: 62 },
          { name: 'Mexico City', value: 62 },
        ],
      },
      body: [
        'Time Out e Intrepid Travel preguntaron a más de 24,000 personas en 150 ciudades qué hace mejor su ciudad después del anochecer. El clubing no lidera en las capitales “obvias”: lo encabezan Europa del Este y Latinoamérica.',
        'Guadalajara (67%) supera a Madrid y empata con Newcastle y Las Vegas. CDMX entra en el puesto 15 con 62%. Es la mejor referencia pública —y comparable— sobre “dónde el público siente que el ambiente está vivo”, más honesta que los rankings puramente de facturación de clubes.',
        'Cruce útil con el Atlas: estas mismas ciudades concentran tiendas y salas con programación house/techno; el ambiente percibido y el ecosistema vinilo se refuerzan.',
      ],
    },
    {
      id: 'dj-mag-top100-2026',
      title: 'DJ Mag Top 100 Clubs 2026: mapa de poder del clubbing',
      excerpt:
        'UNVRS (Ibiza) es #1 absoluto y debut #1 en 12 meses. Norteamérica en mínima; India y Asia en alza. Europa sigue dominando el podio.',
      meta: ['Abr 2026', 'Ranking', 'Voto público'],
      sources: [
        {
          label: 'DJ Mag — Top 100 Clubs 2026',
          href: 'https://djmag.com/features/dj-mag-top-100-clubs-2026-record-breaking-numbers-vote-our-annual-poll-of-worlds-best',
        },
        {
          label: 'DJ Mag — Results countdown',
          href: 'https://djmag.com/live/top-100-clubs-2026-results-countdown',
        },
      ],
      stats: [
        { label: '#1 2026', value: 'UNVRS' },
        { label: 'Nuevo #1 debut', value: '1º en 12 meses' },
        { label: 'Entradas nuevas', value: '19' },
        { label: 'EE.UU. clubes', value: '15' },
      ],
      body: [
        'El voto del público (territorios de todo el mundo) sigue siendo el termómetro de “mejor pista” a escala global. 2026 marcó un debut histórico: UNVRS sube de 0 a 1 en un año —récord desde 2006—.',
        'Para el Atlas vinilo: los países con más clubes en el ranking (EE.UU., España, Reino Unido, Brasil, Croacia) son también mercados con densidad de tiendas y residentes que pinchan wax. El ranking de clubes no mide vinilo, pero sí mapea dónde se concentra la atención global del dancefloor.',
        'México: la nota oficial señala un solo club mexicano en la lista (entrada nueva) frente a la fortaleza brasileña/estadounidense — señal de cabeza de mercado en LatAm sin saturar el top.',
      ],
    },
    {
      id: 'precio-entrada-mismo-dj',
      title: 'Precio de entrada: qué cuesta la misma noche en BCN vs CDMX',
      excerpt:
        'Muestra real de DICE Barcelona (sept–dic 2026): desde €10 en Sala Apolo hasta €63+ en festivales de Fira Montjuïc. Lectura de rangos para comparar mercados.',
      meta: ['Sep 2026', 'Ticketing', 'Muestra DICE'],
      sources: [
        {
          label: 'DICE — Barcelona (captura crawl)',
          href: 'https://dice.fm/browse/barcelona',
        },
        { label: 'DICE — Mexico City', href: 'https://dice.fm/browse/mexico-city' },
      ],
      stats: [
        { label: 'Club night (Apolo)', value: '€10–26' },
        { label: 'Festival (MIRA)', value: '€63+' },
        { label: 'Muestra BCN', value: '29 precios' },
        { label: 'CDMX DICE', value: 'retry crawl' },
      ],
      body: [
        'Crawl de DICE Barcelona sobre la portada de ciudad: 29 precios visibles entre €10 y €65. El club de tamaño medio (Sala Apolo) opera en €10–26; los festivales en Fira Montjuïc saltan a €60+.',
        'CDMX en DICE devolvió un error de cliente en la pasada — se marca “retry” en el manifest. Comparativa oficial de “mismo DJ, dos ciudades” será el siguiente módulo del Atlas, normalizada por ingreso local (PPP), no solo por tipo de cambio.',
        'Regla del pilar: cada número lleva fuente + fecha. Sin fuente = no se publica como dato duro; se publica como hipótesis de trabajo.',
      ],
    },
    {
      id: 'discogs-vinilo-usa',
      title: 'Discogs 2025: inflación y hábitos del coleccionista',
      excerpt:
        '+51% de ventas de vinilo 2020–2023 vs periodo previo; 78% del marketplace es usado; el Gen Z recorta compras por precio.',
      meta: ['Mar 2025', 'Mercado', 'Discogs'],
      sources: [
        {
          label: 'Discogs — Vinyl price increase / collecting trends 2025',
          href: 'https://www.discogs.com/about/news/vinyl-record-price-increase-collecting-trends-2025/',
        },
        {
          label: 'Discogs — 2023 Marketplace analysis',
          href: 'https://www.discogs.com/selling/updates/2023-marketplace-analysis/',
        },
      ],
      stats: [
        { label: 'Vinilo usado', value: '78%' },
        { label: 'Ahorro usado', value: 'hasta 47%' },
        { label: 'Catálogo 2024', value: '105.7M' },
        { label: 'Electrónica 2023', value: '23%' },
      ],
      body: [
        'Discogs reporta que el vinilo usado domina el marketplace (≈78%) y que el crecimiento de coleccionismo sigue fuerte post-2020, aunque la inflación frena al Gen Z (Vinyl Alliance 2025: ~1/3 recorta compras).',
        'Este es el suelo económico del Atlas: sin tiendas y sin secundario líquido, la escena de “DJs que pinchan vinilo” se encarece. Barcelona → México (el modelo 3TRES6) vive exactamente de ese flujo internacional de usado de calidad.',
        'Próximo mapa del pilar: densidad de tiendas por ciudad × participación de usado en Discogs por país de envío.',
      ],
    },
  ],

  emerging: [
    {
      id: 'e-lina',
      title: 'E.Lina — digger de la underground ucrania, Berlín',
      excerpt:
        'RA: artista multidisciplinaria de la escena underground ucrania, base Berlín; hip-hop→electrónica; deep house / techno según el piso. Dates: Dimensions, VBX, SlapFunk, OffSónar 2026.',
      meta: ['Europa', 'House / Techno', 'Scouting'],
      sources: [
        { label: 'RA biography', href: 'https://ra.co/dj/e-lina/biography' },
        { label: 'set79 — sets', href: 'https://set79.com/dj/E.Lina' },
        { label: 'Beatport (homónimos)', href: 'https://www.beatport.com/artist/elina-ch/2337470' },
      ],
      stats: [
        { label: 'Base', value: 'Berlín' },
        { label: 'Origen', value: 'UA underground' },
        { label: 'Próx.', value: 'OFFSónar / Luz de Gas' },
        { label: 'Alias', value: 'Attechtion w/ Annyrock' },
      ],
      related: ['audiodise-paraiso-audio'],
      body: [
        'Confusión de nombres a vigilar: hay al menos tres “E.Lina/Elina” activas (E.Lina Berlín/UA, Elina CH hard techno, E.LINA Ámsterdam). Este perfil es el de RA: digger, danza, selección ecléctica.',
        'Por qué mirarla: residencias y bookings multi-país (Hoppetosse, Watergate, Closer, Dimensions, Sziget) sin necesidad de “hype de prensa”. Sets en radio y podcasts (Slow Life, Timeless) como muestra gratuita.',
        'Task Atlas: cuando haya chart público de precios o poll de atmosphere, geolocalizar sus últimas fechas y comparar con el ranking Time Out/DJ Mag de esa ciudad.',
      ],
    },
    {
      id: 'thomas-kick',
      title: 'Thomas Kick — deep house hipnótico (Slow Life Friends)',
      excerpt:
        'Selector europeo de deep/after-hours; podcast 028 Slow Life Friends; figura relacionada en el órbita RA (Zip/Perlon sphere). Perfil en expansión — poca prensa, mucho set.',
      meta: ['Europa', 'Deep house', 'Radio / Podcasts'],
      sources: [
        {
          label: 'set79 — Slow Life Friends 028',
          href: 'https://set79.com/tracklist/soundcloud.com/slow-life/slow-life-friends-podcast-028-thomas-kick',
        },
        { label: 'RA — related (Zip)', href: 'https://ra.co/dj/zip' },
      ],
      stats: [
        { label: 'Sabor', value: 'Deep / after' },
        { label: 'Muestra', value: 'Podcast 028' },
        { label: 'Órbita', value: 'Minimal / Perlon-adj.' },
        { label: 'Estado', value: 'Emergente' },
      ],
      body: [
        'El señalador más limpio: el podcast Slow Life Friends 028 (deep house, vibes after-hours) + aparición como artista relacionado en el grafo de Zip (Perlon). Poca cobertura editorial = exactamente el tipo de perfil que quiere este pilar.',
        'Metodología: no inventar biografía. Se publica lo verificable (set listas, conexiones RA, fechas). Cuando aparezca ficha RA completa o sello, se actualiza el card con la fuente.',
        'Cruce Red de Voces: co-billing público con Vinilos Viajeros en BCN (Salvadiscos 2023) documentado en el pilar Red de Voces sin afirmar propiedad del colectivo.',
        'Estado de extracción (fase neural): SoundCloud localizado (@thomaskickmusic) y el set ya vive en la Discoteca — 3 de 9 pistas confirmadas vía set79 (Window Smashers “Free To Be” a las 41:00, H&R Project “House Riddm” a las 51:12 y Le Duc “Runas” a las 52:36); 6 pistas abiertas con recheck programado. Siguiente: RA artist URL canónica, Discogs y charts de Beatport/Traxsource.',
      ],
    },
    {
      id: 'alo-mx',
      title: 'Alo — CDMX / SLP: vinilo, radio y edits',
      excerpt:
        'Dos “ALO” en México: (1) SLP remixes 2025; (2) alo (D.F.) — aire doblado, radio Ibero 90.9 “Reflejo Sobre Negro”, 100% vinilo. Perfil de escena local con sello propio en CDr.',
      meta: ['México', 'Vinyl / Leftfield', 'CDMX + SLP'],
      sources: [
        { label: 'alo-sound Bandcamp', href: 'https://alo-sound.bandcamp.com/' },
        { label: 'ALO (SLP) Bandcamp', href: 'https://alomusic92.bandcamp.com/' },
        {
          label: 'Conversaciones de Altura — Reflejo Sobre Negro',
          href: 'https://castbox.fm/episode/Episodio-40---Reflejo-Sobre-Negro-(Alo-%2B-COR.S)-id1486871-id182350598',
        },
      ],
      stats: [
        { label: 'Área', value: 'CDMX / SLP' },
        { label: 'Formato', value: 'Vinilo radio' },
        { label: 'Sello', value: 'Sieta / AD CDr' },
        { label: 'Año clave', value: '2023–25' },
      ],
      body: [
        'Homónimos: alo (D.F.) publica aire doblado 2 en CDr artesanal, sesiona en Ibero 90.9 con Reflejo Sobre Negro (100% vinilo, viernes 21h) y colabora con COR.S/Él Shirota. ALO (San Luis Potosí) saca edits tipo “The Techno Code” (2025).',
        'Por qué importa al ecosistema 3TRES6: es el tipo de picker que une radio local + physical media + colectivos — el mismo caldo de tiendas y clubes del mapa.',
        'Radar siguiente: fechas en Nitsa/Fünk/Polifonic (cruzar con Alby Esc y CLSTR, también emergentes MX), y si tocan en BCN, anotar en el Atlas de ambiente.',
      ],
    },
    {
      id: 'ola-mx-2026',
      title: 'Ola México 2026: Alby Esc, CLSTR, OBL1V!ØN, Alsoes',
      excerpt:
        'Cuatro nombres emergentes distintos: peak-time house (Alby), selector CDMX (CLSTR), hard techno (OBL1V!ØN), melodic (Alsoes GDL). Un solo mercado, cuatro pistas.',
      meta: ['México', 'Radar multi-sabor', '2026'],
      sources: [
        {
          label: 'Billboard AR — Alby Esc',
          href: 'https://billboard.ar/lanzamientos/alby-esc-el-talento-mexicano-que-esta-conquistando-la-escena-global-del-house-y-el-techno/',
        },
        { label: 'CLSTR official', href: 'https://clostrmusic.com/' },
        {
          label: 'Rave Time — OBL1V!ØN',
          href: 'https://ravetimemedia.com/obl1von-el-talento-mexicano-que-busca-encender-la-escena-global-del-hard-techno/',
        },
        { label: 'Alsoes official', href: 'https://alsoes.com/' },
      ],
      stats: [
        { label: 'Alby Esc', value: 'Peak house' },
        { label: 'CLSTR', value: 'CDMX digger' },
        { label: 'OBL1V!ØN', value: 'Hard techno' },
        { label: 'Alsoes', value: 'Melodic GDL' },
      ],
      body: [
        'Alby Esc (Reynosa/McAllen → CDMX): Sisyphos, Pacha, Nitsa; con Charli XCX, Chris Stussy, Gerd Janson en cartel. EP “God’s Luv” acid house 2026 (Billboard AR).',
        'CLSTR (CDMX): techno hipnótico + house clásico + nu-disco; 4 meses de residencias locales (Leonor, Bardo, Skatepark Fest CUU). Perfil de “selector obsesivo” — candidato a Disco/Mix de 3TRES6.',
        'OBL1V!ØN (CDMX hard techno) y Alsoes (GDL, Fideles support, #55 Hype melodic) cierran el abanico: México no es un solo sound en 2026 — es un mapa multi-pilar como Europa.',
      ],
    },
    {
      id: 'landeep',
      title: 'Landeep — afro-house de La Habana en el showcase Rëgal',
      excerpt:
        'Funk, afro, tropical y latín sobre electrónica; proyecto El Trópico, Proton Radio y Half Lemon. Cartel verificado: Rëgal Showcase en Carmine House Society (BCN) con Frutis.',
      meta: ['La Habana', 'Afro / House', 'Flyer BCN'],
      sources: [
        { label: 'SoundCloud — djlandeep', href: 'https://soundcloud.com/djlandeep' },
        {
          label: 'Soundcharts — Landeep (🇨🇺)',
          href: 'https://soundcharts.com/en/artist/1db1bbac-fa1b-11e8-aa6d-549f35141000',
        },
        {
          label: 'Proton Radio — Landeep',
          href: 'https://www.protonradio.com/artists/51185/landeep/tracks',
        },
        { label: 'Beatport — Landeep', href: 'https://www.beatport.com/artist/landeep/606228' },
      ],
      stats: [
        { label: 'Base', value: 'La Habana' },
        { label: 'Proyecto', value: 'El Trópico' },
        { label: 'Radio', value: 'Proton (2017–)' },
        { label: 'Cartel', value: 'Rëgal 15.02' },
      ],
      related: ['victor-hugo'],
      body: [
        'La biografía pública de su SoundCloud resume el proyecto: “fusión de géneros — funk, afro, tropical y latín con música electrónica”. Soundcharts lo sitúa en La Habana (🇨🇺) y lo describe como creador de El Trópico, un concepto “mestizo, sensorial y contemporáneo” cuyos sets transitan entre afro house, amapiano, deep house y ritmos latinos.',
        'Presencia en catálogo y radio: ficha de artista en Beatport y catálogo en Proton Radio (activo desde 2017, con conexiones a Turntables on the Hudson y Half Lemon Records), incluida la pieza “Canario Samba” con Pulo NDJ. La bandera del flyer del showcase es cubana y coincide con su perfil público — homónimos tipo Sandeep (NL, deep house) quedan descartados.',
        'La fecha que nos cruza: el cartel RËGAL SHOWCASE (domingo 15.02, 19:00–00:00, members only +21, Carmine House Society) lista LANDEEP 🇨🇺 / VICTOR HUGO / FRUTIS. Es el eslabón de archivo que conecta al dígner habanero con la cabina de Frutis en Barcelona; sin ficha RA conocida, el perfil se mantiene en fuentes directas (SoundCloud, Proton, Beatport).',
      ],
    },
    {
      id: 'victor-hugo',
      title: 'Victor Hugo — el homónimo del showcase Rëgal',
      excerpt:
        'El cartel de Carmine House Society lista “VICTOR HUGO” sin red ni ficha. El único nombre homónimo con perfil RA es VHOOR (real name Victor Hugo, Brasil), que sí toca en BCN — identidad sin confirmar.',
      meta: ['Homónimos', 'BCN / Brasil', 'Flyer BCN'],
      sources: [
        { label: 'RA — VHOOR', href: 'https://ra.co/dj/vhoor' },
        { label: 'Crew — archivo de flyers', href: 'crew.html' },
      ],
      stats: [
        { label: 'Cartel', value: 'Rëgal 15.02' },
        { label: 'Candidato', value: 'VHOOR (RA)' },
        { label: 'Evidencia', value: 'BCN ✓' },
        { label: 'Estado', value: 'Sin confirmar' },
      ],
      related: ['landeep'],
      body: [
        'Lo verificable entra primero: el flyer RËGAL SHOWCASE de Carmine House Society (domingo 15.02, members only +21) anuncia LANDEEP 🇨🇺 / VICTOR HUGO / FRUTIS. El nombre llega solo — sin apellido, sin enlace, sin ficha pública localizable. La regla de este pilar prohíbe rellenar ese hueco con una biografía inventada.',
        'El candidato documentado es VHOOR: RA lista su nombre real como Victor Hugo, base Brasil, con regiones más tocadas que incluyen São Paulo, Lisboa y Barcelona; en la agenda de Nitsa (Latineo, 808 Studios) figura con nombre real en el mismo circuito queer/club de BCN. Coincidencia fuerte de nombre + presencia en la ciudad — pero coincidencia no es identidad.',
        'Tarea de crawl abierta: Instagram del cartel y el IG de Carmine House Society para el handle exacto; si aparece ficha RA o SoundCloud, la tarjeta se actualiza con la fuente. Mientras tanto vive como pregunta abierta junto a Landeep, el otro nombre de ese showcase, cuya identidad sí cerró con fuentes directas.',
      ],
    },
    {
      id: 'bastard-love',
      title: 'Bastard Love — la cadena México → BCN que une a Frutis con Perro Jimbo',
      excerpt:
        'RA: Donovan, Ciudad de México; “hybrid house and techno”. El puente es real: 303 Audiophile Bar y el calendario Perros comparten cartel con Perro Jimbo; Veridis Quo lo pone con Frutis.',
      meta: ['CDMX ↔ BCN', 'House / Techno', 'Cadena neural'],
      sources: [
        { label: 'RA — Bastard Love', href: 'https://ra.co/dj/bastardlove' },
        { label: 'Beatport — bio', href: 'https://www.beatport.com/artist/bastard-love/230729' },
        {
          label: 'A38 Ship — Fine Selection #127',
          href: 'https://www.a38.hu/en/program/fine-selection-hu-23475',
        },
        { label: 'Calendario 3TRES6', href: 'index.html#calendario' },
      ],
      stats: [
        { label: 'Nombre', value: 'Donovan (MX)' },
        { label: 'Ejes', value: 'CDMX ↔ BCN' },
        { label: 'Sello', value: 'Diynamic · MFR' },
        { label: 'Cadena', value: '303 ↔ Perros' },
      ],
      related: ['perro-jimbo', 'diesco'],
      body: [
        'Ficha RA completa (rareza en este pilar): real name Donovan, base México, alias único; “Bastard Love is just a feeling, an hybrid between house and techno”. El nombre lo explica él mismo en Music is 4 Lovers: “Love is house, Bastard is techno”. Como promotor de Difficult People trajo a Art Department, Soul Clap y Lee Foss a CDMX; produce para Diynamic, My Favorite Robot y Hot Waves, con colaboraciones de Alex Arnout, Balcazar & Sordo, Climbers, Miguel Puente y Métrika.',
        'El puente con la red de Perros está documentado dos veces: la agenda de RA muestra un cartel en 303 Audiophile Bar (Barcelona) con DAWIDU / BASTARD LOVE / PERRO JIMBO, y el calendario local lo confirma en SolaReflect III (10.07.26, L’amagatall de Cal Tonedor) y Perros BCN — Summer Closing (19.09.26, Village Underground). Co-billing verificado, no inferencia.',
        'Y el lado Frutis: el flyer VERIDIS QUO (viernes 10.10.25, Carrer del Bruc 80) lista BASTARD LOVE / DIESCO / FRUTIS. Queda así la cadena completa que buscaba este pilar: flyers de Frutis → Bastard Love → Perro Jimbo (303 / Perros) → Thomas Kick en la órbita RA. Cada eslabón con fuente propia; la red se sostiene sin saltos.',
      ],
    },
    {
      id: 'diesco',
      title: 'Diego García (Diesco) — el puente CDMX ↔ Barcelona',
      excerpt:
        'RA: nacido en México, viviendo en España; lo más tocado es BCN, CDMX, Puerto Escondido, Tulum e Ibiza. Studio Stereo, El Molino y dos flyers compartidos con Frutis.',
      meta: ['MX → BCN', 'House / Electro', 'Studio Stereo'],
      sources: [
        { label: 'RA — Diesco', href: 'https://ra.co/dj/diesco' },
        {
          label: 'TechnoBeatsCloud — agenda',
          href: 'https://technobeatscloud.com/escena/deejays/diesco',
        },
        {
          label: 'El Molino — Disco Marisco',
          href: 'https://www.elmolinobarcelona.com/en/artista/disco-marisco-vince-void-diesco-i-beniso/',
        },
        { label: 'Mood — Sunseabar', href: 'https://events.musicofourdesire.com/artist/diesco' },
      ],
      stats: [
        { label: 'Nombre', value: 'Diego García' },
        { label: 'Ejes', value: 'BCN · CDMX · Tulum' },
        { label: 'Casa', value: 'Studio Stereo' },
        { label: 'Flyers', value: 'Veridis Quo · Sauvage' },
      ],
      related: ['bastard-love', 'atmen', 'nannii-lopez'],
      body: [
        'Ficha RA con doble nacionalidad escénica: real name Diego García, nacido en México, viviendo en España; regiones más tocadas — Barcelona, Ciudad de México, Puerto Escondido, Tulum e Ibiza. Es exactamente el perfil de este ecosistema: raíces mexicanas, práctica clubera europea.',
        'Huella BCN verificable: fechas en Studio Stereo (pl. Catalunya) con 24Seven, Cupula Recordings y Bizarre Trax, incluidas ventanas OFF; Disco Marisco en El Molino (08.02.25) junto a Vince Void y Beniso (DROP Dance Society); Sunday Sunday CDMX (22.03.25) y Sunseabar en la agenda. Su constante en carteleras: Vince Void, la otra mitad de ese circuito house/electro.',
        'Los dos puentes con Frutis están en el archivo: VERIDIS QUO (10.10.25, Bruc 80) con Bastard Love y Frutis, y CLUB SAUVAGE by Undertone (Pl. Reial 7, 14 nov, 00:00–05:00) con FRUTIS b2b M.S.R., ATMEN y NANNII LOPEZ. El segundo cartel es oro para la red: reúne a cuatro nodos de este pilar en una sola noche.',
      ],
    },
    {
      id: 'felipe-o',
      title: 'Felipe O — deep house de catálogo, b2b en La Orquesta',
      excerpt:
        'Poco ruido público, una pieza clara: “Laffitte” en Deep Clicks (27.06.25, deep house). El cartel Nuna Cor lo pone b2b con Frutis en La Orquesta Club — perfil fino, sin biografía inventada.',
      meta: ['Deep house', 'Flyer BCN', 'Perfil fino'],
      sources: [
        {
          label: 'Proton — Laffitte by Felipe O',
          href: 'https://go.protonradio.com/r/rl5rRPozLoyUE',
        },
        {
          label: 'Traxsource — catálogo Deep Clicks',
          href: 'https://www.traxsource.com/title/2513186/melenated-beings',
        },
      ],
      stats: [
        { label: 'Sello', value: 'Deep Clicks' },
        { label: 'Tema', value: 'Laffitte (2025)' },
        { label: 'Género', value: 'Deep house' },
        { label: 'Cartel', value: 'Nuna Cor 19.07' },
      ],
      related: ['msr', 'thomas-kick'],
      body: [
        'La huella pública más nítida es una sola pieza: “Laffitte” de Felipe O, publicada el 27 de junio de 2025 en Deep Clicks (sello de deep house, presente en Beatport/Traxsource con “Melenated Beings” de Deep Owen y Giffaro Hamisi en la misma ventana), con salida en Proton Radio y disponibilidad en Beatport, Spotify y Apple Music. Es un disco, no una biografía — y con eso basta para publicar.',
        'El cruce de archivo: el flyer de la sesión acústica NUNA COR (sábado 19 jul 2025, La Orquesta Club, Ausias Marc 140, Eixample; MNCRM + Spitmind) anuncia NUNA COR × FRUTIS b2b FELIPE O. El b2b con Frutis es el vínculo que lo trae a este pilar; la sesión vive además en el mapa de gigs de la página Crew.',
        'Metodología: sin RA localizado ni Discogs confirmado, no se afirma base, nacionalidad ni sello propio. Siguiente crawl: SoundCloud/Instagram con handle exacto, ficha RA si existe, y Discogs artist page — cuando aparezca, la tarjeta se amplía con la fuente; el estilo del b2b (deep, compatible con Deep Clicks) queda documentado solo como contexto de sello.',
      ],
    },
    {
      id: 'msr',
      title: 'M.S.R — de Bogotá a Barcelona, órbita Freres Col',
      excerpt:
        'Bandcamp: “DJ/Producer from Bogotá, based in Barcelona”, bookings vía Freres Col. El cartel Club Sauvage lo pone b2b con Frutis — monograma gemelo M5R en el mismo colectivo, identidad por confirmar.',
      meta: ['Bogotá → BCN', 'Groove / Techno', 'Flyer BCN'],
      sources: [
        { label: 'Bandcamp — MSR', href: 'https://msrmusic3.bandcamp.com/' },
        { label: 'SoundCloud — M5R (colectivo Freres)', href: 'https://soundcloud.com/m5r_19' },
        { label: 'Crew — archivo de flyers', href: 'crew.html' },
      ],
      stats: [
        { label: 'Base', value: 'Bogotá → BCN' },
        { label: 'Crew', value: 'Freres Col' },
        { label: 'Cartel', value: 'Sauvage b2b' },
        { label: 'Estado', value: 'Por confirmar' },
      ],
      related: ['felipe-o', 'atmen'],
      body: [
        'El MSR de su Bandcamp (msrmusic3) se presenta así: “DJ/Producer from Bogotá, based in Barcelona, SP”, con reservas vía frerescol.com. Es el único DJ electrónico de monograma MSR con base en Barcelona que aparece en fuentes públicas — y por eso es el candidato natural para el cartel.',
        'La advertencia de homónimo: existe además M5R (SoundCloud m5r_19), también de Bogotá y también de Barcelona, cofundador del colectivo FRERES COL, con clubs en ambas ciudades (Radioberlin, Aftermood / M7, Pacha, Garage 442, City Hall) y referencias de groove de Ben Sims, Oscar Mulero y Richie Hawtin, debutando “Distortion Reality” en Freres Recordings. Mismo colectivo, mismo trayecto, monograma distinto — no confirmamos que sea la misma persona, y el artículo no lo da por hecho.',
        'El vínculo con la red es el flyer CLUB SAUVAGE (Pl. Reial 7, Ciutat Vella; 14 nov, 00:00–05:00): DIESCO / FRUTIS b2b M.S.R. / ATMEN / NANNII LOPEZ, con logos de LOST y Sonata. Un b2b con Frutis como declaración de escena; la confirmación de identidad queda como siguiente crawl (Discogs, RA, Instagram exacto).',
      ],
    },
    {
      id: 'atmen',
      title: 'ATMEN — Oscar Castellanos: de Guadalajara al LOST de Barcelona',
      excerpt:
        'RA lo nombra: Oscar Castellanos, +7 años en BCN, cofundador de LOST Barcelona y Studio 79; house, indie dance, electro, acid y techno. El logo LOST aparece en su propio cartel con Frutis.',
      meta: ['Guadalajara → BCN', 'House / Acid', 'LOST · Studio 79'],
      sources: [
        { label: 'RA — ATMEN', href: 'https://ra.co/dj/atmen' },
        {
          label: 'ADE — bio',
          href: 'https://www.amsterdam-dance-event.nl/en/artists-speakers/atmen/2521853/',
        },
        { label: 'Instagram — @atmenmusic', href: 'https://www.instagram.com/atmenmusic/' },
      ],
      stats: [
        { label: 'Nombre', value: 'Oscar Castellanos' },
        { label: 'Base', value: 'BCN (7+ años)' },
        { label: 'Crew', value: 'LOST · Studio 79' },
        { label: 'Origen', value: 'Guadalajara, MX' },
      ],
      related: ['diesco', 'nannii-lopez', 'msr'],
      body: [
        'Ficha RA con nombre real: Oscar Castellanos, “DJ and producer based in Barcelona for over 7 years” y creador del colectivo LOST; la bio de ADE completa el origen — Guadalajara, Jalisco, México — y el sonido: “House, Indie Dance, Electro, Acid & Techno”. Residencias y salas: Pacha, La Terrazza, CityHall, Amnesia Rabat, ToyRoom, Bar Américas, entre otras en América, Europa y África.',
        'Su infraestructura en BCN es doble: LOST (colectivo, @lost.bcn) y Studio 79 (@studio79.bcn, academia/estudio), más Sunseabar Beach Club en su bio de Instagram. Ahí se cruza con Diesco — ambos en carteles de Sunseabar y Studio Stereo — cerrando el circuito house/electro que comparte este pilar.',
        'La prueba de identidad con el archivo: el flyer CLUB SAUVAGE by Undertone (Pl. Reial 7, 14 nov) lista DIESCO / FRUTIS b2b M.S.R. / ATMEN / NANNII LOPEZ y lleva abajo el logo de LOST. El mismo colectivo que RA le atribuye a Atmen firma su cartel — la cadena cartel ↔ perfil ↔ colectivo cierra sin suposiciones.',
      ],
    },
    {
      id: 'nannii-lopez',
      title: 'Nannii Lopez — el hilo minimal entre Bogotá, Madrid y Barcelona',
      excerpt:
        'Beatport desde 2016; colaboraciones estables con Dannx (Kommando, HardCutz) y presencia en Endless Off Week 2023. El cartel Club Sauvage lo pone en la misma noche que Frutis, Diesco y Atmen.',
      meta: ['LatAm ↔ BCN', 'Minimal / Deep', 'Kommando'],
      sources: [
        {
          label: 'Beatport — Nannii Lopez',
          href: 'https://www.beatport.com/artist/nannii-lopez/551717',
        },
        {
          label: 'Bandcamp — The Power Of Rising (Kommando)',
          href: 'https://kommandoreal.bandcamp.com/track/the-power-of-rising',
        },
        {
          label: 'Electronic Groove — Endless Off Week',
          href: 'https://electronicgroove.com/endless-off-week-ender-friday-saturday/',
        },
      ],
      stats: [
        { label: 'Beatport', value: 'Desde 2016' },
        { label: 'Collabs', value: 'Dannx · Beghelli' },
        { label: 'Sellos', value: 'Kommando · HardCutz' },
        { label: 'Cartel', value: 'Sauvage 14 nov' },
      ],
      related: ['atmen', 'diesco', 'msr'],
      body: [
        'Ficha de artista en Beatport con histórico desde 2016 y un puñado de publicaciones por colaboración: “Five Dimension” con Dannx (HardCutz Records, 2021) y “The Power Of Rising” con Beghelli y Dannx (Battalion Vol.1, Kommando, 2024). Su nombre vive casi siempre acompañado — la firma de su trabajo es el b2b y el colectivo.',
        'El acompañante habitual es Dannx: DJ de Bogotá afincado en Barcelona, cofundador de PRISSMA, con pasos por Razzmatazz, City Hall o Cafe del Mar en BCN y Estéreo Picnic en Colombia (ficha Beatport). A eso se suma la compilación de Endless Off Week/Ender 2023 en Barcelona, que lista a Nannii Lopez entre los colaboradores, y un guestmix para la serie de Concept101.',
        'El cruce con nuestro archivo: CLUB SAUVAGE (Pl. Reial 7, 14 nov, 00:00–05:00) — DIESCO / FRUTIS b2b M.S.R. / ATMEN / NANNII LOPEZ. Comparte cartel con tres nodos de este pilar en una noche de Ciutat Vella; el vínculo exacto con Frutis (b2b o set adyacente) queda abierto a la fuente del organizador.',
      ],
    },
    {
      id: 'stevie-toth',
      title: 'Stevie Tóth — la sesión b2b con Frutis en UNREC',
      excerpt:
        'El título del video es la fuente: “Frutis B2B Stevie Toth | UNREC Open Source Sessions”. SoundCloud propio con ese acento (Tóth) y el contexto completo del formato de jueves en BCN.',
      meta: ['UNREC', 'b2b con Frutis', 'Perfil fino'],
      sources: [
        {
          label: 'YouTube — Frutis B2B Stevie Toth',
          href: 'https://www.youtube.com/watch?v=OINo_TTLfzo',
        },
        { label: 'SoundCloud — Stevie Tóth', href: 'https://soundcloud.com/stevietoth' },
        {
          label: 'whoisinbcn — UNREC Open Source Sessions',
          href: 'https://whoisinbcn.com/every-thursday-unrec-open-source-sessions-are-a-new-format-that-rede/',
        },
      ],
      stats: [
        { label: 'Sesión', value: 'b2b con Frutis' },
        { label: 'Formato', value: 'Open Source Sessions' },
        { label: 'Muestra', value: 'SoundCloud' },
        { label: 'Estado', value: 'Perfil fino' },
      ],
      related: ['thomas-kick', 'perro-jimbo'],
      body: [
        'La evidencia principal es el propio video: “Frutis B2B Stevie Toth | UNREC Open Source Sessions” en el canal de YouTube de UNREC — una de las dos sesiones de Frutis que ahora viven en la página Crew. A eso se suma su SoundCloud público bajo la grafía con acento, Stevie Tóth (comentador activo en pistas de sellos como Permanent Vacation), y la foto de cabina del archivo del crew (Frutis vs Stevie Toth en club).',
        'Contexto del formato: whoisinbcn describe las UNREC Open Source Sessions como una cita de jueves emitida en YouTube “desde los lugares más emblemáticos de la ciudad”, con sesiones de Hanakito, Deeplomacy o Akainu, y MixID documenta una entrega de UNREC Sessions con The Hacker en Freedonia (27.03.25). No es un canal cualquiera: es la cinta de la escena que aquí interesa.',
        'Perfil deliberadamente fino: sin RA ni prensa localizable, no se le asigna base ni nacionalidad. Lo que sí queda publicado —set compartido con Frutis, plataforma y grafía— es lo verificable hoy. Siguiente crawl: Instagram con handle exacto, RA y set79 sobre la sesión del video para abrir su tracklist en la red neural.',
      ],
    },
    {
      id: 'perro-jimbo',
      title: 'Perro Jimbo — la residencia Perros/303 y el calendario BCN',
      excerpt:
        'Fijo en Perros Mediterráneos (Poble Sec) y en 303 Audiophile Bar (Sant Antoni); siete fechas 2026 en nuestro calendario, incluida la NYE 3TRES6. El puente con Bastard Love está en RA.',
      meta: ['Barcelona', 'Residente 303 / Perros', 'Cadena neural'],
      sources: [
        { label: 'Miniguide — Perros 4 Years', href: 'https://miniguide.co/event/perros-4-years' },
        {
          label: 'Outhere — Perro Jimbo',
          href: 'https://www.outhere.guide/artist/perro-jimbo-f491',
        },
        {
          label: 'Jambase — Family Matters (Village Underground)',
          href: 'https://www.jambase.com/show/family-matters-village-underground-barcelona-20260530',
        },
        { label: 'Calendario 3TRES6', href: 'index.html#calendario' },
      ],
      stats: [
        { label: 'Casas', value: '303 · Perros' },
        { label: 'Ciudad', value: 'Barcelona' },
        { label: 'Calendario', value: '7 fechas 2026' },
        { label: 'Cadena', value: '↔ Bastard Love' },
      ],
      related: ['bastard-love', 'thomas-kick'],
      body: [
        'El apoyo institucional de la escena está por doquier. Miniguide lo nombra entre los “Perros fixtures” del cuarto aniversario de Perros Mediterráneos —el “infamous cultural bar and record store” de Poble Sec— junto a Lumiere, Demofather, Fatal, sakali y Sergi, con sonidos Rostro y Pequod Acoustics; y en otra fecha lo describe como “resident at the much-loved Sant Antoni audiophile bar”, el 303. Outhere recoge su agenda (Waxplace Vinyl APP Launch, Kumquat x Perros) y Jambase su presencia en Family Matters @ Village Underground (30.05.26, con Zonzo).',
        'Nuestro calendario lo da por siete fechas en 2026: Chez Perros 5 Years (02.05, Village Underground), Waxplace (30.05), Kumquat x Perros OFF (21.06), SolaReflect III (10.07), Perros Summer Closing (19.09), Winter Series (05.12) y la NYE 2027 — 3TRES6 All Night Long (31.12). Ese último cartel lo sienta dentro de la órbita propia del sello.',
        'El eslabón neural que buscaba este pilar: la agenda de RA de Bastard Love lista 303 Audiophile Bar con DAWIDU / BASTARD LOVE / PERRO JIMBO, y el calendario confirma los co-bills de ambos en SolaReflect III y Perros Summer Closing. Frutis ↔ (flyer Veridis Quo) ↔ Bastard Love ↔ Perro Jimbo — tres fuentes, cero inferencias. Y el primer set ya está en la Discoteca: “Studio Stereo’s Dancing Room” (1:50, publicado por AUDIODISE, el sello de E.Lina en esta misma biblioteca) — cierre de jueves en Studio Stereo, con los IDs en recheck.',
      ],
    },
    {
      id: 'pavolar',
      title: 'Pa’volar — el sello-colectivo que nace con Subwax',
      excerpt:
        '“Record label & DJ collective from Barcelona, distributed by Subwax”. Catálogo PAV001–005 en 12” (Neoser, Baffa, Soul Travels) y vitrina en Yoyaku — el tipo de sello que este ecosistema necesita de cerca.',
      meta: ['Barcelona', 'Sello / colectivo', 'Vinilo 12”'],
      sources: [
        { label: "Bandcamp — Pa'volar", href: 'https://pavolar.bandcamp.com/' },
        { label: 'Subwax — Pa’volar', href: 'https://subwax.es/brands/pavolar/' },
        { label: 'Yoyaku — Pa’volar', href: 'https://yoyaku.io/label/pavolar/' },
      ],
      stats: [
        { label: 'Base', value: 'Barcelona' },
        { label: 'Distribución', value: 'Subwax' },
        { label: 'Catálogo', value: 'PAV001–005' },
        { label: 'Formato', value: '12” + digital' },
      ],
      related: ['donde-compran-djs', 'bastard-love'],
      body: [
        'La auto-descripción es la mejor posible: “Record label & DJ collective from Barcelona. Distributed by Subwax” (Bandcamp), con demos por enlace a pavolar.records@gmail.com. Es decir: sello y colectivo a la vez, física primero, y con la distribución de Subwax — la tienda sello que todo vinilo BCN conoce — detrás de cada referencia.',
        'Catálogo trazable de PAV001 a PAV005, todo en 12”: Open Senses (Neoser, PAV001), Mental Nature (Baffa / Neoser, PAV002), Inner Glow (Neoser, PAV004, master de Nordik Studio) y las compilaciones Soul Travels 01 y 02 — la 02 (2025) compilada por Sebastián Cádiz con artwork de Francesc Bustins, cerrando un arco de breaks, house, deep y downtempo según la ficha de Yoyaku.',
        'Por qué lo subimos a este pilar: es el eslabón industria del mapa —BCN, vinilo, distribución real, artistas propios— y funciona como escaparate para cualquier dígner que quiera dar el salto físico (como ya hizo Neoser tres veces). Vitrina confirmada en Subwax y Yoyaku; el siguiente paso de red es cruzar sus artistas con sets extraíbles y con los colectivos vecinos (LOST, PRISSMA, Perros).',
      ],
    },
    {
      id: 'crisalide',
      title: 'Crisalide — objetivo de extracción en la red neural',
      excerpt:
        'Fichas SESH e Innerload (Italia) más el guest mix de SIDE SESSIONS en Bridge 48 (Barcelona, feb 2026) — ya en la Discoteca. Identidad canónica abierta, homónimos documentados.',
      meta: ['Identidad abierta', 'Italia ↔ BCN', 'Extracción'],
      sources: [
        { label: 'SESH — artist/Crisalide', href: 'https://sesh.sx/artists/crisalide' },
        {
          label: 'Innerload — AGAIN Release Party (guest)',
          href: 'https://innerload.com/js_events/again-release-party-innerload-crisalide-perpetual-fate/',
        },
        {
          label: 'SIDE MUSIC — Side Radio 019',
          href: 'https://soundcloud.com/side-566175776/side-radio-019-crisalide-guest',
        },
        { label: 'SoundCloud — candidato', href: 'https://soundcloud.com/crisalide1994' },
      ],
      stats: [
        { label: 'Índice', value: 'SESH.sx' },
        { label: 'Ancla', value: 'Bridge 48, BCN' },
        { label: 'Set', value: 'Side Radio 019' },
        { label: 'Estado', value: 'Identidad abierta' },
      ],
      related: ['thomas-kick', 'perro-jimbo'],
      body: [
        'Lo documentado cabe en dos fuentes: la ficha de artista en SESH.sx (índice de raves y club nights) donde Crisalide aparece con carteles junto a Erico Rampas y Anikha — nombres de la órbita italiana —, y una aparición como “Special Guest” en la release party de Again de Innerload (26.10.19, Krach Club, Monastier di Treviso). Eso prueba un acto electrónico real con historial; no prueba todavía cuál de los perfiles es el canónico.',
        'Pero la ancla acaba de aparecer: SIDE MUSIC publicó “Side Radio 019 - Crisalide Guest Mix” con la descripción “SIDE SESSIONS: Crisalide — Bridge 48, February, 2026, Bcn”. Barcelona, febrero de 2026 — el guest mix ya está en la Discoteca de esta web como set con audio completo (1:12), y es la primera fuente que ata el nombre a la ciudad. La mezcla sigue siendo un set de IDs abiertos: sin tracklist publicada, con recheck programado.',
        'El campo de homónimos sigue siendo hostil y por eso se documenta: una banda de metal italiana Crisalide (30 años de trayectoria), una cantante de jazz/blues italiana, un sello de Luxemburgo, el estudio de radio Crisàlide de Barcelona, y decenas de temas titulados “Crisalide”. Publicar una biografía ahora sería inventar — pero la cadena identidad ↔ escena ↔ set por fin tiene tres eslabones.',
      ],
    },
  ],

  culture: [
    {
      id: 'donde-compran-djs',
      title: '¿Dónde compran su música los DJs? (mapa de tiendas digitales)',
      excerpt:
        'Beatport, Bandcamp, Traxsource, Juno, Volumo, Bleep + pools. Beatport: ~$1.49–2.49/tack; Bandcamp: 80–85% al artista. Workflows multi-tienda.',
      meta: ['Marketplaces', 'Encuesta / guías', '2025'],
      sources: [
        {
          label: 'Beatport / Beatportal value study',
          href: 'https://www.beatportal.com/articles/958770-the-true-value-of-a-beatport-track-download',
        },
        {
          label: 'Where DJs find their music (comparison)',
          href: 'https://where-djs-find-their-music.com/',
        },
        {
          label: 'DJ Diaries — downloads guide',
          href: 'https://thedj-diaries.com/dive-deep-your-ultimate-guide-to-dj-music-downloads/',
        },
        {
          label: 'r/DJs — where do you buy',
          href: 'https://www.reddit.com/r/DJs/comments/dwi0te/where_do_you_buy_your_music_and_why/',
        },
      ],
      stats: [
        { label: 'Beatport $/track', value: '$1.49–2.49' },
        { label: 'Bandcamp payout', value: '≈80–85%' },
        { label: 'Pools break-even', value: '~20–25 tracks' },
        { label: 'Workflows', value: 'multi-store' },
      ],
      chart: {
        type: 'bars',
        title: 'Roles por plataforma (síntesis de guías 2024–25)',
        items: [
          { name: 'Beatport', value: 95, note: 'catálogo / charts' },
          { name: 'Bandcamp', value: 85, note: 'directo artista' },
          { name: 'Traxsource', value: 80, note: 'house underground' },
          { name: 'Juno', value: 70, note: 'variedad + vinilo' },
          { name: 'Volumo', value: 65, note: 'lossless curado' },
          { name: 'Record pools', value: 75, note: 'volumen / edits' },
        ],
      },
      body: [
        'Nadie serio usa solo una tienda. Patrón estable en guías y hilos: Beatport para charts y últimos lanzamientos; Bandcamp para exclusivas y pagar más al artista; Traxsource para house profundo; pools cuando >20–25 tracks/mes.',
        'Beatport estima ~58% de sus 1M clientes activos performan lo comprado (→ ~27M performances/año declaradas en su estudio). No es una encuesta de todos los DJs — es auto-selección de compradores Beatport; citarlo así.',
        'Capa vinilo (este sitio): Discogs + tienda física. El 78% usado de Discogs y el “crate digging” local son la contraparte offline de este mismo presupuesto de descubrimiento.',
      ],
    },
    {
      id: 'ultima-pista',
      title: 'La última pista de la noche: folklore del cierre',
      excerpt:
        'VICE 2021 + Space Ibiza 2016 (30 DJs) + hilos r/DJs: no hay un himno único — hay familias de cierre (anthem, singalong, own track, ambient wind-down).',
      meta: ['Cabina', 'Antropología', '30+ DJs'],
      sources: [
        {
          label: 'VICE — end of night songs',
          href: 'https://www.vice.com/en/article/djs-favourite-end-of-night-songs/',
        },
        {
          label: 'Ibiza Spotlight — last track at Space',
          href: 'https://www.ibiza-spotlight.es/night/2016/09/feature-last-track-id-play-space',
        },
        {
          label: 'r/DJs — closing sets',
          href: 'https://www.reddit.com/r/DJs/comments/1989rq5/how_do_you_guys_end_a_closing_set/',
        },
      ],
      stats: [
        { label: 'Patrones', value: '5 familias' },
        { label: 'Cita clásica', value: 'Space ×30' },
        { label: 'VICE 2021', value: 'panel DJs' },
        { label: 'r/DJs', value: 'cierre 2024' },
      ],
      body: [
        'Familias observables: (1) anthem público que todos cantan (You’ve Got the Love, Café Del Mar, Inspector Norse); (2) closers románticos/slow (la “make out” view de VICE); (3) el propio track del DJ; (4) high-energy hasta las luces; (5) wind-down ambient (comentario r/DJs 2024: “Japanese ambient con naturaleza, suave”).',
        'El Space 2016 (30 DJs) muestra un patrón emocional-fúnebre/institucional: “it’s not over…”, “Days Like This”, “Promised Land” — la última pista como testamento del club, no solo del set.',
        'Para 3TRES6: encuesta interna de crew + lista pública “closing weapons” con tracklist verificable. Cada track = link Discogs/Beatport si existe en catálogo.',
      ],
    },
    {
      id: 'rituales-y-datos',
      title: 'Rituales de cabina: 8 micro-datos entre DJs',
      excerpt:
        'Pre-set rituals, USB vs laptop, peso de la bolsa, green room myths, set-length norms — síntesis de entrevistas y guías de cabina (fuentes enlazadas).',
      meta: ['Data dump', 'Entrevistas', 'Cabina'],
      sources: [
        { label: 'DJ TechTools', href: 'https://www.djtechtools.com/' },
        { label: 'Mixmag features', href: 'https://mixmag.net/features' },
        { label: 'XLR8R features', href: 'https://www.xlr8r.com/features' },
        { label: 'RA features', href: 'https://ra.co/features' },
      ],
      stats: [
        { label: 'Formatos', value: 'USB / laptop / wax' },
        { label: 'Set estándar', value: '1–4 h' },
        { label: 'Resident', value: '6–8 h (hist.)' },
        { label: 'Fuente', value: 'multi-press' },
      ],
      body: [
        'Los formatos no mueren: coexisten wax / USB CDJ / laptop. La maleta “pesa” — metáfora literal en villas de vinilo vs la ligereza del USB (el folklore del crate).',
        'Set lengths: club set corto 60–90 min; residency clásica 6–8 h (cita Schumacher/entrevistas históricas). La diferencia cambia cómo se construye narrativa y cuándo entra la “última pista”.',
        'Próximo artefacto: encuesta propia (Google form / ig story) de la crew + lectores → número real de 3TRES6, no inventado. Publicar n y metodología.',
      ],
    },
    {
      id: 'vinilo-vs-digital-presupuesto',
      title: 'Presupuesto de descubrimiento: 10 tracks digitales vs 1 wax',
      excerpt:
        'Cálculo transparente con precios de mercado: ~$15 digitales ≈ 1 LP usado “like new” de Discogs. Qué gana cada dólar en profundidad vs tacto.',
      meta: ['Economía', 'Heurística', 'BCN→MX'],
      sources: [
        {
          label: 'Discogs trends 2025',
          href: 'https://www.discogs.com/about/news/vinyl-record-price-increase-collecting-trends-2025/',
        },
        {
          label: 'Beatport pricing (guías)',
          href: 'https://thedj-diaries.com/dive-deep-your-ultimate-guide-to-dj-music-downloads/',
        },
      ],
      stats: [
        { label: '10 × $1.49', value: '$14.9' },
        { label: 'Wax usado', value: 'hasta −47%' },
        { label: 'Ahorrar “like new”', value: '≈23%' },
        { label: 'Usado share', value: '78%' },
      ],
      body: [
        'Con Beatport en $1.49–2.49, 10 tracks ≈ $15–25. Ese presupuesto compra un LP usado decente en Discogs — o dos si hay suerte con el grading.',
        'El digital gana en volumen y velocidad de descubrimiento; el wax gana en finite focus, arte y reventa (secundario Discogs). El “mejor” depende del rol: preps de set vs colección de cabina.',
        'Esta cuenta es heurística de uso, no recomendación de inversión. Tipos de cambio y envío (MX 100/30 MXN en operativa 3TRES6) cambian el resultado real.',
      ],
    },
  ],

  voices: [
    {
      id: 'origen-3tres6',
      title: 'Origen 3TRES6: Albert y Frutis en una sola historia',
      excerpt:
        'La historia pública de la marca —selección manual en Barcelona y envío a México— junto a Frutis, identificado en el crew como Piloto & Fundador. Albert y Frutis quedan aquí en una sola ficha, sin datos internos.',
      meta: ['Barcelona → México', 'Fundador', 'Solo fuentes públicas'],
      sources: [
        { label: '3TRES6 — Nosotros (en vivo)', href: 'https://3tres6records.albto.me/#nosotros' },
        { label: '3TRES6 — Crew: d.mfrutis', href: 'https://3tres6records.albto.me/crew.html' },
        {
          label: 'Time Out — best record shops Barcelona',
          href: 'https://www.timeout.com/barcelona/music/best-record-shops-in-barcelona',
        },
        {
          label: 'Discogs — Discos Paradiso (venue)',
          href: 'https://www.discogs.com/venue/474677-discos-paradiso/',
        },
      ],
      stats: [
        { label: 'Ruta', value: 'BCN → MX' },
        { label: 'Fundador', value: 'd.mfrutis' },
        { label: 'Base', value: 'Barcelona' },
        { label: 'Modelo', value: 'curaduría / usado' },
      ],
      body: [
        '3TRES6 Records define su origen en dos gestos públicos: seleccionar a mano en tiendas de Barcelona como Discos Paradiso, Way Out y Ultra-Local Records, y llevar ese underground europeo a coleccionistas en México. La página de Nosotros lo resume como “De Barcelona para México. Del underground a tu tornamesa”.',
        'El crew identifica a Frutis como “Piloto & Fundador” en Barcelona y como primer miembro, especialista en selections underground y vinilos de alta calidad. Albert y Frutis aparecen aquí en una sola ficha: la marca y su fundador público, sin atribuir cargos, fechas o una biografía que el sitio no publique.',
        'Metodología Red de Voces: solo fuentes públicas enlazadas. Sin datos operativos, correos ni tarifas internas. Cuando haya prensa, entrevista o una ficha pública nueva, se actualiza la tarjeta con la cita.',
      ],
    },
    {
      id: 'thomas-kick-vinilos-viajeros',
      title: 'Thomas Kick y Vinilos Viajeros: dos nodos de la red BCN',
      excerpt:
        'Co-billing verificado (Salvadiscos 2023) une al selector de deep (Slow Life 028) con Vinilos Viajeros, listado como expositor en Gran Price Vinyl Fest 2024 — sin inventar quién es dueño de quién.',
      meta: ['Barcelona', 'Deep house', 'Colectivo / tienda'],
      sources: [
        {
          label: 'Salvadiscos — Vinilos Viajeros × Canela En Surco feat. Thomas Kick (2023)',
          href: 'https://www.salvadiscos.com/evento/vinilos-viajeros-meets-canela-en-surco-deep-latin-spiritual-house-feat-breixo-martinez-damian-botigue-thomas-kick/',
        },
        {
          label: 'set79 — Slow Life Friends 028 (Thomas Kick)',
          href: 'https://set79.com/tracklist/soundcloud.com/slow-life/slow-life-friends-podcast-028-thomas-kick',
        },
        {
          label: 'Gran Price Vinyl Fest 2024 — Vinilos Viajeros',
          href: 'https://granpricevinyl.com/edicion-2024',
        },
      ],
      stats: [
        { label: 'Sabor TK', value: 'Deep / after' },
        { label: 'VV perfil', value: 'Feria 2024' },
        { label: 'Co-bill', value: 'BCN 10 nov 2023' },
        { label: 'Estado', value: 'Verificado' },
      ],
      body: [
        'El vínculo más limpio en las fuentes es el cartel “Vinilos Viajeros meets Canela En Surco (deep, latin, spiritual house)” en Espai Salvadiscos: viernes 10 de noviembre de 2023, de 21:00 a 03:00. El lineup incluye a Thomas Kick, Breixo Martínez y Damián Botigue. Es co-billing de una noche; no prueba la propiedad del sello o de la tienda.',
        'Gran Price Vinyl Fest 2024 listó a Los Vinilos Viajeros como expositor de Barcelona, con electrónica, rock y world music. La página de la feria no atribuye a Thomas Kick la propiedad ni la dirección del colectivo: la ficha mantiene esos perfiles separados y documenta únicamente la colaboración verificable.',
        'Thomas Kick aparece además en Slow Life Friends Podcast 028, descrito como deep house after-hours. Su perfil de DJs Emergentes y esta ficha usan la misma regla: sets, fechas y conexiones documentadas; biografía solo cuando existe una fuente pública.',
      ],
    },
    {
      id: 'boyanza-records',
      title: 'Boyanza Records: del loft de CDMX a CDMX×Miami',
      excerpt:
        'Sello y colectivo fundado en CDMX en 2019 por Rafatel (Rafael Tena), con Gaude (Patricio Gaudelli) a cargo de las operaciones en Miami. La entrevista de febrero de 2025 registraba 32 releases y un vinilo con más de 300 copias vendidas.',
      meta: ['CDMX / Miami', 'Label / events', 'Desde 2019'],
      sources: [
        {
          label: 'Music is 4 Lovers — Turn One interview (2021)',
          href: 'https://www.musicis4lovers.com/boyanza-records-turn-one-with-compilation-release-interview/',
        },
        {
          label: 'The Club Map — Label Interview: Boyanza (2025)',
          href: 'https://www.theclubmap.com/2025/02/02/label-interview-boyanza/',
        },
        { label: 'RA — Boyanza label', href: 'https://ra.co/labels/20571' },
        { label: 'Bandcamp — Boyanza Records', href: 'https://boyanzarecords.bandcamp.com/' },
        { label: 'Insomniac — Rafatel', href: 'https://www.insomniac.com/music/artists/rafatel/' },
      ],
      stats: [
        { label: 'Fundación', value: 'Nov 2019' },
        { label: '1er release', value: 'Ene 2020' },
        { label: 'Releases', value: '32 (2025)' },
        { label: 'Vinilo', value: '1 · >300 cop.' },
      ],
      body: [
        'Boyanza arrancó como una serie de fiestas en un loft del centro de Ciudad de México, alrededor de noviembre de 2019. Cuando el curador Rafael Tena (Rafatel) tuvo tracks listos y se frustró con el proceso de buscar sello, el colectivo decidió lanzar Boyanza Records: su primer release oficial fue en enero de 2020. Después Rafatel incorporó a Gaude (Patricio Gaudelli), amigo y productor de Miami, quien quedó a cargo de las operaciones allí.',
        'La entrevista de The Club Map del 2 de febrero de 2025 registró 32 releases disponibles en Bandcamp o SoundCloud y un único vinilo prensado, Get Paid de Playa Baghdad, casi agotado tras superar 300 copias vendidas en el mundo. El sello también sumaba más de 500 mil reproducciones y 3500 compras en tiendas online; son cifras declaradas por Boyanza, no una medición independiente.',
        'The Club Map sitúa al colectivo entre el sello, la producción de eventos y la curaduría, con apariciones junto a DJ Harvey, Cerrone y Zombies in Miami, además de participaciones en Trópico, Bahidora y Bravo. Insomniac describe a Rafatel como head honcho de Boyanza, mientras RA lo ubica entre Ciudad de México y Miami.',
        'La conexión editorial con 3TRES6 es ese circuito independiente: fiestas, sello y una tirada limitada de vinilo entre México y Miami. La ficha conserva las cifras con fecha y no atribuye al colectivo artistas, roles comerciales ni datos que las fuentes no publiquen.',
      ],
    },
    {
      id: 'audiodise-paraiso-audio',
      title: 'AUDIODISE — El paraíso audible sale de la sala',
      excerpt:
        'De la playa de El Prat a Montjuïc: el colectivo barcelonés que convirtió el aire libre, el sonido hecho a mano y la entrada libre en una forma de escuchar.',
      meta: ['Barcelona', 'Promotor / hi-fi', '2019→2026'],
      image: {
        src: 'images/blog/audiodise-elina-audiodise-park-2026.webp',
        alt: 'E.Lina y el equipo de AUDIODISE junto a la cabina durante una sesión en Montjuïc.',
        width: 1280,
        height: 720,
        credit: 'AUDIODISE / YouTube',
        source: {
          label: 'E.LINA | AUDIODISE PARK (BCN)',
          href: 'https://www.youtube.com/watch?v=zs0a6DhPRtM',
        },
      },
      sources: [
        { label: 'AUDIODISE — About', href: 'https://www.audiodise.com/about' },
        {
          label: 'Trommel Music — Audiodise audio paradise (2022)',
          href: 'https://trommelmusic.com/news/audiodise-invite-john-dimas-and-vitess-to-their-audio-paradise-in-barcelona/',
        },
        {
          label: 'EDM Directory — Barcelona, 24 May 2026',
          href: 'https://edmdancedirectory.com/events/barcelona/2026-05-24',
        },
        {
          label: 'AUDIODISE — E.LINA set, 24 May 2026',
          href: 'https://www.youtube.com/watch?v=zs0a6DhPRtM',
        },
        {
          label: 'Good2b — AUDIODISE 360 Music Theater (2024)',
          href: 'https://good2b.es/event-post/regresa-audiodise-con-una-experiencia-auditiva-unica-en-un-teatro-emblematico-de-barcelona/',
        },
        {
          label: 'RA — Studio Stereo opens in Barcelona (2023)',
          href: 'https://ra.co/news/79422',
        },
        {
          label: 'Oazis — AUDIODISE x OpenLab (2026)',
          href: 'https://oazis.app/en/event/audiodise-x-openlab-pres-edward-giegling-e-lina-and-swann',
        },
      ],
      stats: [
        { label: 'Inicio', value: 'OFF Week 2019' },
        { label: 'Park', value: '24 May 2026' },
        { label: 'Set E.Lina', value: '1:55:32' },
        { label: 'Fórmula', value: 'aire + audio' },
      ],
      listen: [
        {
          label: 'E.Lina · AUDIODISE Park · 21:32',
          href: 'dj-library.html#set:e-lina-audiodise-park-bcn-2026-05-24&track=msvts-fex-remix&t=1292',
          note: 'Discoteca · pista compartida',
          kind: 'set',
        },
        {
          label: 'Video oficial de AUDIODISE',
          href: 'https://www.youtube.com/watch?v=zs0a6DhPRtM&t=1292s',
          note: 'YouTube · archivo del set',
          kind: 'external',
        },
      ],
      related: ['e-lina', 'oblicuohifi-gracia', 'dias-de-campo-montanejos', 'bahidora-las-estacas'],
      body: [
        'AUDIODISE no empezó con una discoteca. Su primera idea fue una fiesta junto al mar, con la playa como decoración y el aire libre como parte del sistema. La web oficial lo resume con una imagen que sirve como mapa: coastlines, hidden venues and open-air settings into temporary universes of rhythm, light and movement. No habla de un genre como destino, sino de espacios que se vuelven temporales.',
        { type: 'heading', text: 'De El Prat a Montjuïc' },
        'La primera edición llegó durante OFF Week 2019. En 2022, Trommel Music describió el proyecto como un promotor que evitaba el club convencional: ubicaciones abiertas, entrada gratuita siempre que era posible, sonido cuidado y una selección capaz de convertir una playa en una pista temporal. Swann aparece como resident y fundador en la documentación posterior; el resto del equipo permanece deliberadamente en segundo plano.',
        'La Barcelona de AUDIODISE pasa después a nuevos escenarios. En 2023, el promotor aparece implicado en la apertura de Studio Stereo, un espacio que combina sala de baile y listening room. En 2024, Paral·lel 62 recibe AUDIODISE 360 Music Theater: el sistema de Adamson se reconfigura alrededor de una cabina suspendida y la experiencia se convierte en teatro de sonido. No es una marca que busque un solo lugar; cambia de piel porque la música necesita otro cuerpo.',
        { type: 'heading', text: 'E.Lina: el cuerpo también es un territorio' },
        'El 24 de mayo de 2026, AUDIODISE Park abre su temporada en Montjuïc con DJ Dustin, E.Lina y giac. El set de E.Lina dura 1:55:32 y queda publicado por el propio AUDIODISE. Es una pieza útil para leer el proyecto: no solo importa quién está en el cartel, sino cómo se registra la sesión, cuánto se conserva y qué detalle se deja vivo.',
        'El momento 21:32 conecta directamente con el archivo musical: Mike Dunn, Victor Simonelli y Luis Radio, Nothing Stays the Same (F.E.X. Remix), sobre Systematic Recordings. No es un nombre puesto para adornar la historia. Es el tipo de filtro exacto, domesticado por una selectora que sabe cuándo dejarlo sonar largo.',
        {
          type: 'quote',
          text: 'La descripción de AUDIODISE advierte que las subidas tienen un audio bajo y no están hechas para uso de club. El archivo no sustituye la calle; la conserva.',
          cite: 'Descripción oficial del video',
        },
        { type: 'heading', text: 'Por qué esta historia le habla a México' },
        'La frase “concepto creado en Barcelona para ser trasladado a México y Sudamérica” apareció en 2022, cuando AUDIODISE todavía era un proyecto en expansión. No hay que convertir esa intención en una promesa cumplida. Basta con notar el paralelismo: una ruta que puede ir de una costa a otra, de una ciudad a otra, sin perder el gusto por el selector, los vinilos y las noches que no caben en un calendario.',
        '3TRES6 trabaja en esa misma dirección, pero desde el revés: escuchar en Barcelona, documentar el viaje y dejarlo llegar a México. AUDIODISE no es el modelo europeo al que México debe parecerse. Es otra prueba de que una escena puede sentirse local en dos sitios a la vez.',
      ],
    },
    {
      id: 'oblicuohifi-gracia',
      title: 'OBLICUOHIFI — Cuando el Jazz Kissa llega a Gràcia',
      excerpt:
        'Un bar de escucha en Riera de Sant Miquel donde el sistema de sonido, el vinilo y la conversación forman parte de la misma arquitectura.',
      meta: ['Gràcia, Barcelona', 'Hi-fi / listening bar', '2023→2026'],
      image: {
        src: 'images/blog/oblicuohifi-ivanmaria-dobrochna.webp',
        alt: 'Ivanmaria Vele y Dobrochna Giedwidz junto al sistema de altavoces de OBLICUOHIFI.',
        width: 1024,
        height: 682,
        credit: 'Fabrizio Ruffo / BeatBurguer',
        source: {
          label: 'Entrevista a Ivanmaria Vele',
          href: 'https://beatburguer.com/entrevista-ivanmaria-vele-de-oblicuo-hi-fi-bar/',
        },
      },
      sources: [
        { label: 'OBLICUOHIFI — Hi-Fi System', href: 'https://www.oblicuohifibar.com/' },
        {
          label: 'Triennale Milano — Sonidos Oblicuos (2026)',
          href: 'https://triennale.org/en/events/oblicuohifi-fatal-hanakito-fog-2026',
        },
        {
          label: 'BeatBurguer — Entrevista a Ivanmaria Vele (2024)',
          href: 'https://beatburguer.com/entrevista-ivanmaria-vele-de-oblicuo-hi-fi-bar/',
        },
        {
          label: 'Time Out Barcelona — Oblicuo Hi-Fi Bar (2024)',
          href: 'https://www.timeout.cat/barcelona/ca/musica/obicuo-hi-fi-bar',
        },
        {
          label: 'Tot Gràcia — Oblicuo Hi-Fi Bar (2024)',
          href: 'https://totgracia.com/oblicuo-hi-fi-bar-el-primer-local-dalta-fidelitat-de-gracia/',
        },
        { label: 'OBLICUOHIFI — Press', href: 'https://www.oblicuohifibar.com/category/press/' },
      ],
      stats: [
        { label: 'Apertura', value: 'Oct 2023' },
        { label: 'Dirección', value: 'Riera 59' },
        { label: 'Sistema', value: 'Doble Hi-Fi' },
        { label: 'Residentes', value: 'Hanakito / Fatal' },
      ],
      listen: [
        {
          label: 'Hanakito · archivo relacionado',
          href: 'dj-library.html#set:hanakito-elliephunk-shoes-off-refuge-2026-09-12',
          note: 'Discoteca · no grabado en OBLICUOHIFI',
          kind: 'set',
        },
        {
          label: 'OBLICUOHIFI — sistema y dirección',
          href: 'https://www.oblicuohifibar.com/',
          note: 'Web oficial',
          kind: 'external',
        },
      ],
      related: ['audiodise-paraiso-audio', 'dias-de-campo-montanejos', 'bahidora-las-estacas'],
      body: [
        'OBLICUOHIFI tiene una palabra que funciona mejor que un eslogan: oblicuo. No apunta en una sola dirección. El bar mezcla Technics, una mezcladora rotatoria, vinos naturales, sake, cocteles y conversaciones que no tienen que callarse para que la música funcione. Su sonido no es decoración: es la forma en la que el lugar se vuelve hospitalario.',
        'La dirección, Riera de Sant Miquel 59, en Gràcia, importa. El proyecto se abrió en octubre de 2023 con una pareja italo-polaca, Ivanmaria Vele y Dobrochna Giedwidz, y con la experiencia de haber pasado por Londres, Milán, Nueva York y el mundo de clubs, publicación, moda y diseño. La ciudad no aparece como decorado de una marca de moda: aparece como una casa que se decide habitar.',
        { type: 'heading', text: 'El nombre y la calle' },
        'Ivanmaria explica que “oblicuo” viene de tres cosas: las estrategias creativas de Brian Eno y Peter Schmidt, la mezcla de géneros y público, y una calle de Gràcia que no funciona en línea recta. No es un nombre de catálogo. Es una manera de pensar la programación: varios frentes en lugar de una sola línea, y una atención al movimiento que no se reduce a locales.',
        { type: 'heading', text: 'Una sala construida como instrumento' },
        'Giorgio Di Salvo diseñó el sistema: altavoces principales de tres vías, bocinas estilo Altec, supertweeters JBL 075, amplificación de válvulas y clase A, gestión de volumen a medida, Condesa Carmen y Technics SL-1210. La ficha técnica suena seca si se queda ahí. En el contexto del bar se vuelve otra cosa: el cuerpo de la sala forma parte de la selección.',
        'La conversación no desaparece. Al contrario, el diseño permite que la música tenga volumen sin convertir cada conversación en una disputa. Esa mezcla de precisión y movimiento es lo que un bar puede hacer mejor que una club: no pedir silencio total, sino atención.',
        {
          type: 'quote',
          text: '“Somos locales, no expatriados.” La frase de Ivanmaria también explica el proyecto: la ciudad no es un décor para una escena importada; es el lugar desde el que se escucha y se decide seguir.',
          cite: 'BeatBurguer, 2024',
        },
        { type: 'heading', text: 'Hanakito, el puente que no se pierde' },
        'La residente Hanakito trae una historia que suena familiar en cualquier ruta entre ciudades: Tokyo, Ciudad de México en 2016 y Barcelona después. Su selección mezcla rare groove, Latin funk, soul, disco y house; la Triennale la presenta como una de las almas musicales de OBLICUOHIFI junto a Fatal. La ficha no dice que su set de archivo fuera grabado en el bar: por eso el enlace de la Discoteca aparece como archivo relacionado.',
        'Esa precisión importa. Un lugar no se vuelve una escena porque le peguen nombres. Se vuelve una escena cuando puede explicar quién programa, qué sistema usa, qué falta y qué relación quiere construir con la ciudad. OBLICUOHIFI también trabaja con sellos, tiendas y sesiones en vivo, así que su proyecto suena menos como escaparate y más como una red local con vida propia.',
      ],
    },
    {
      id: 'dias-de-campo-montanejos',
      title: 'Días de Campo — La pista empieza en el pueblo',
      excerpt:
        'TheBasement convirtió una fiesta de día junto al agua termal de Montanejos en un festival de cuatro días, seis escenarios y una idea muy concreta de comunidad.',
      meta: ['Montanejos', 'Festival / entorno', '2017→2026'],
      image: {
        src: 'images/blog/dias-de-campo-montanejos-2026.webp',
        alt: 'Escultura verde de un caballo en un bosque, imagen oficial de Días de Campo.',
        width: 1600,
        height: 1067,
        credit: 'Días de Campo – Official / Electronic Groove',
        source: {
          label: 'Días de Campo returns to Montanejos',
          href: 'https://electronicgroove.com/dias-de-campo-returns-to-montanejos-with-120-artists-for-2026-edition/',
        },
      },
      sources: [
        { label: 'Días de Campo — lineup 2026', href: 'https://diasdecampofestival.com/' },
        {
          label: 'Días de Campo — preguntas frecuentes',
          href: 'https://diasdecampofestival.com/preguntas-frecuentes/',
        },
        {
          label: 'TheBasement — Días de Campo 2017',
          href: 'https://thebasementxxx.com/webapp/noticias/sorpresas-dias-de-campo-2017-montanejos/',
        },
        {
          label: 'Xceed — Días de Campo 2026',
          href: 'https://xceed.me/blog/es/dias-de-campo-2026/',
        },
        {
          label: 'Electronic Groove — Días de Campo 2026',
          href: 'https://electronicgroove.com/dias-de-campo-returns-to-montanejos-with-120-artists-for-2026-edition/',
        },
        {
          label: 'Las Provincias — TheBasement, diez años (2023)',
          href: 'https://www.lasprovincias.es/revista-valencia/jovenes-tras-conciertos-cuelgan-cartel-completo-20231030004804-nt.html',
        },
      ],
      stats: [
        { label: 'Pueblo', value: 'Montanejos' },
        { label: 'Inicio allí', value: '2017' },
        { label: 'Cartel 2026', value: '120+ nombres' },
        { label: 'Formato', value: '4 días / 6 escenarios' },
      ],
      listen: [
        {
          label: 'E.Lina · perfil en Discoteca',
          href: 'dj-library.html#dj:e-lina',
          note: 'También está en el cartel 2026',
          kind: 'dj',
        },
        {
          label: 'MCDE · set archivado',
          href: 'dj-library.html#set:mcde-dekmantel-2014',
          note: 'Archivo relacionado · no es Días de Campo',
          kind: 'set',
        },
        {
          label: 'Dan Ghenacia · set archivado',
          href: 'dj-library.html#set:shonky-b2b-dan-ghenacia-ibiza-2014',
          note: 'Archivo relacionado · no es Días de Campo',
          kind: 'set',
        },
      ],
      related: ['audiodise-paraiso-audio', 'oblicuohifi-gracia', 'bahidora-las-estacas'],
      body: [
        'Días de Campo no empieza con una explanada de DJ. Empieza con una pregunta muy física: ¿qué pasa cuando la música se muda a un pueblo y el pueblo no se convierte en decorado? La respuesta de TheBasement fue llevar la fiesta de día al aire libre, primero a Montanejos y luego hacerla crecer durante días completos.',
        'La página de TheBasement de 2017 cuenta que Día de Campo nació como una propuesta personal para disfrutar música al aire libre, con amigos y buen rollo. Días de Campo fue la ampliación: del evento de una jornada al festival de tres días, con actividades, gastronomía, camping y el agua termal de Montanejos como parte de la programación. El nombre siempre tuvo una herramienta: el campo no era un lugar de escapada, era una forma de estar.',
        { type: 'heading', text: 'Montanejos no es el fondo' },
        'La organización insiste en que la vida de campera, la comunidad y la naturaleza se sienten en cada momento. El agua de las termas se mantiene a 25 grados durante todo el año; el pueblo aporta gastronomía, arquitectura y cuidados. No es un festival que se instala en un campo vacío: es un encuentro anclado en el territorio, donde la relación con el lugar se negocia todos los años.',
        'La primera guía de Días de Campo habla de la plaza, la fuente, el campamento y el campo de fútbol. Esa distribución explica mucho de TheBasement: la música puede estar en un espacio principal y también en una fuente, una conversación o un mercado. El dancefloor es una parte, no la única.',
        { type: 'heading', text: 'Un festival que se puede explicar' },
        'La web de 2026 presenta un festival boutique de cuatro días y más de 120 artistas, con una programación que mezcla house, techno, electrónica y voces locales. Las preguntas frecuentes lo describen como independiente, autofinanciado e impulsado por TheBasement, un colectivo con más de doce años de trayectoria. La misma página incluye un código de conducta y el compromiso de trabajar con el Ayuntamiento para respetar el entorno.',
        'Eso no vuelve la música más internacional ni la hace más auténtica. La hace más clara: la escala no borra el nombre de nadie ni la responsabilidad con el lugar. En 2026, Días de Campo se mide también por estas entradas: Four Tet, MCDE, Dan Ghenacia, E.Lina, Barac y una larga lista de artistas que llegan de sitios distintos.',
        {
          type: 'quote',
          text: '“No hay dónde esconderse” no es solo una frase de cartel: el entorno, la vida de las termas, la gente del pueblo y el propio horario de la música se encuentran.',
          cite: 'Cartel y textos oficiales de Días de Campo 2026',
        },
        { type: 'heading', text: 'La ruta Barcelona–México' },
        'TheBasement nació en Valencia y Días de Campo lleva su mirada a Montanejos; 3TRES6 lleva la mirada de Barcelona a México. No son la misma historia, pero comparten una forma de entender la música como infraestructura: un sistema de sonido, un espacio, un pueblo, una comunidad y tiempo suficiente para que aparezca una conversación.',
        'E.Lina es el puente humano de esta ficha: aparece en el cartel de 2026 y su set de AUDIODISE queda archivado en la Discoteca. MCDE, Dan Ghenacia y otros nombres del cartel tienen sets más antiguos en el archivo, que no representan este festival, pero sí permiten escuchar el vecindario electrónico de una generación.',
      ],
    },
    {
      id: 'bahidora-las-estacas',
      title: 'Bahidorá — La tierra que se vuelve sonido',
      excerpt:
        'Desde 2013, Las Estacas, Morelos: un festival mexicano que entiende la música como un encuentro con el territorio, la comunidad y la memoria del barrio.',
      meta: ['Las Estacas, Morelos', 'Festival / curaduría', '2013→2026'],
      image: {
        src: 'images/blog/bahidora-las-estacas-2026.webp',
        alt: 'Público con las manos arriba en un escenario de Bahidorá 2026 entre palmeras.',
        width: 1200,
        height: 675,
        credit: 'Bahidorá / Chilango',
        source: {
          label: 'Bahidorá 2026: todo lo que te espera',
          href: 'https://www.chilango.com/que-hacer/musica/bahidora-2026-todo-lo-que-te-espera-en-el-paraiso-musical/',
        },
      },
      sources: [
        { label: 'Bahidorá — lineup 2026', href: 'https://www.bahidora.com/lineup' },
        {
          label: 'Bahidorá — distribución del cartel 2026',
          href: 'https://www.bahidora.com/blog/descubre-la-distribucion-por-dias-del-lineup-para-2026',
        },
        {
          label: 'Mixmag Latin America — Iñigo Villamil (2025)',
          href: 'https://mixmaglatam.com/read/entrevista-con-inigo-villamil-fundador-de-bahidora-news',
        },
        {
          label: 'Chilango — Bahidorá 2026 (2025)',
          href: 'https://www.chilango.com/que-hacer/musica/bahidora-2026-todo-lo-que-te-espera-en-el-paraiso-musical/',
        },
        {
          label: 'Revista Kuadro — Lucía Anaya (2026)',
          href: 'https://revistakuadro.com/curaduria-riesgo-y-frescura-asi-se-construye-el-cartel-de-bahidora/',
        },
        { label: 'RA — Bahidorá 2026', href: 'https://ra.co/news/83948' },
      ],
      stats: [
        { label: 'Fundación', value: '2013' },
        { label: 'Inicio', value: '~3.500 personas' },
        { label: 'Comunidad', value: '>11.000' },
        { label: 'Lugar', value: 'Las Estacas' },
      ],
      listen: [
        {
          label: 'Four Tet · archivo',
          href: 'dj-library.html#dj:four-tet',
          note: 'Cartel 2026 · archivo relacionado',
          kind: 'dj',
        },
        {
          label: 'Helena Hauff · archivo',
          href: 'dj-library.html#dj:helena-hauff',
          note: 'Cartel 2026 · archivo relacionado',
          kind: 'dj',
        },
        {
          label: 'VTSS · archivo',
          href: 'dj-library.html#dj:vtss',
          note: 'Cartel 2026 · archivo relacionado',
          kind: 'dj',
        },
        {
          label: 'The Blessed Madonna · archivo',
          href: 'dj-library.html#dj:blessed-madonna',
          note: 'Cartel 2026 · archivo relacionado',
          kind: 'dj',
        },
      ],
      related: ['audiodise-paraiso-audio', 'oblicuohifi-gracia', 'dias-de-campo-montanejos'],
      body: [
        'Bahidorá no nace como una explicación de Europa desde México. Nace al revés: como una forma de salir de la ciudad, caminar hacia el agua y aceptar que el festival también puede ser un territorio. La primera edición fue en 2013, en Las Estacas, y la historia ha seguido creciendo alrededor de una idea que no necesita traducirse: música, naturaleza y comunidad.',
        'Iñigo Villamil recuerda que el primer año fue ingenuo y pequeño: un escenario, un campamento y unas 3.500 personas. La entrevista de Mixmag Latin America sitúa ese comienzo en un momento en el que la capital dominaba la explicación de los festivales. Bahidorá eligió otra ruta, no como gesto de marca, sino como práctica de habitar un lugar y escuchar lo que sus vecinos ya sabían.',
        'El nombre tiene su propia explicación. La Bahía de Ardora y los Mares de Ardora, donde organismos microscópicos producen una luz colectiva, son la metáfora que el fundador da para una comunidad que se enciende al conectar. No es una afirmación de superioridad; es una forma de mirar la rave como un encuentro entre gente.',
        { type: 'heading', text: 'El cartel completo es el headliner' },
        'Iñigo describe una distribución horizontal: cada artista tiene una función dentro del día, no existe un solo nombre grande que tape el conjunto. Lucía Anaya, curadora y programadora, habla de riesgo, frescura y descubrir proyectos en escenas, ambientes y mercados que no siempre aparecen en los mismos mapas.',
        'El cartel 2026 confirma esa lógica. En Sonorama aparecen Four Tet, Daphni, VTSS y HVOB; en El Cubo, Ricardo Villalobos, The Blessed Madonna, Helena Hauff, Roza Terenzi, Cinthie y DJ Seinfeld; en La Estación, Crudo Means Raw, Ela Minus, Ruzzi, PabloPablo, Macario Martínez, Los Pirañas y Chico Sonido. El domingo lleva Mad Professor, Ariwa All Stars y Sonido La Changa. No es una frontera entre “música europea” y “música mexicana”: es un mapa de afinidades.',
        'Sonido La Changa aparece en la web oficial como una institución del sonidero mexicano y un movimiento cultural que reúne cumbia, salsa y música tropical. Esa frase de la propia organización de Bahidorá podría explicarle mucho: el barrio, la familia, la megafonía y la reafirmación de identidad.',
        { type: 'heading', text: 'Cuidar el agua como parte del cartel' },
        'La primera edición dejó residuos y la respuesta fue construir un programa de sostenibilidad asesorado por expertos. Mixmag Latin America recoge el compromiso declarado con el ISO 20121, vasos compostables, separación de residuos, agua gratuita y compensación de la huella. Son afirmaciones de la organización, no una auditoría independiente; aun así, explican por qué Las Estacas no es solo un fondo bonito.',
        'La relación con el parque es de escucha. La relación del festival con el río, los árboles y la gente local forma parte de la programación. En esto se parece a Días de Campo: la naturaleza deja de ser una experiencia y se vuelve una responsabilidad concreta.',
        { type: 'heading', text: 'El puente de 3TRES6' },
        'La Discoteca guarda sets de Four Tet, Helena Hauff, VTSS y The Blessed Madonna. No son sets de Bahidorá: son archivos relacionados con artistas que sí aparecen en el cartel 2026, y la ficha los marca como tales. La diferencia importa. Una buena conexión editorial no inventa una pertenencia; muestra la línea que se puede recorrer y deja claro dónde empieza y dónde termina.',
        'Para 3TRES6, la ruta de Bahidorá ofrece la otra mitad de la historia: no solo cómo se compra y selecciona en Barcelona, sino qué significa convertir una selección en un espacio de encuentro en México. De la duda al selector, del selector al barrio, del barrio a la memoria compartida del agua. La música, aquí, no se archiva para que vuelva intacta: se archiva para que siga cambiando de lugar.',
      ],
    },
  ],
};
