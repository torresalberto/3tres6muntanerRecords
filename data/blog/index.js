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
        'Siguiente crawl objetivo: SoundCloud del artista, RA artist URL canónica, Discogs artist page, chart de Beatport/Traxsource con su catálogo.',
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
};
