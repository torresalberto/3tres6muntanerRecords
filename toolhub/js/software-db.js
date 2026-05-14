const SoftwareDB = {
  resources: [
    // ==================== DJ SOFTWARE ====================
    {
      id: "rekordbox-7",
      name: "Rekordbox 7",
      version: "7.2.x",
      developer: "AlphaTheta (Pioneer DJ)",
      category: "dj-software",
      categoryLabel: "DJ Software",
      description: {
        es: "La última versión del software DJ profesional. Análisis de música, gestión de playlists, preparación de USBs para CDJs y performance con controladores. Plan gratuito disponible con funciones básicas.",
        en: "The latest professional DJ software. Music analysis, playlist management, USB export for CDJs, and controller performance. Free plan available with basic features."
      },
      platforms: ["windows", "mac"],
      pricing: "freemium",
      hasFreeTier: true,
      freeTier: "Gestión de música básica + 30 días prueba Professional",
      language: ["en", "ja", "es", "fr", "de"],
      links: [
        { label: "Descargar Gratis", url: "https://rekordbox.com/es/download/", type: "download" },
        { label: "Versiones Anteriores", url: "https://support.pioneerdj.com/hc/en-us/articles/4598241828761", type: "archive" },
        { label: "Ver Planes", url: "https://rekordbox.com/en/store/", type: "info" },
        { label: "FAQ v7", url: "https://rekordbox.com/es/support/faq/v7/", type: "help" }
      ],
      tags: ["rekordbox", "pioneer", "dj-software", "gratis", "profesional"],
      icon: "🎛️",
      recommendation: "Elige Rekordbox 7 si tu computadora es moderna. Si no, usa Rekordbox 6 o Mixxx."
    },
    {
      id: "rekordbox-6",
      name: "Rekordbox 6",
      version: "6.8.x",
      developer: "AlphaTheta (Pioneer DJ)",
      category: "dj-software",
      categoryLabel: "DJ Software",
      description: {
        es: "Versión anterior pero estable de Rekordbox. Ideal para computadoras más antiguas. Ya no requiere licencia — solo crear una cuenta gratuita. Exporta a USB para CDJs.",
        en: "Previous but stable Rekordbox version. Ideal for older computers. No longer requires a license — just create a free account. USB export for CDJs."
      },
      platforms: ["windows", "mac"],
      pricing: "free",
      hasFreeTier: true,
      freeTier: "Completamente funcional (sin suscripción requerida)",
      language: ["en", "ja", "es", "fr", "de"],
      links: [
        { label: "Descargar Gratis (Oficial)", url: "https://support.pioneerdj.com/hc/en-us/articles/8112764645785", type: "download" },
        { label: "Descargar v6 (alternativo)", url: "https://rekordbox.com/en/download/", type: "download" },
        { label: "Tutorial Export USB", url: "https://www.youtube.com/results?search_query=rekordbox+6+export+usb+cdj", type: "tutorial" }
      ],
      tags: ["rekordbox", "pioneer", "dj-software", "gratis", "legacy", "compatible"],
      icon: "🎛️",
      recommendation: "MEJOR OPCIÓN PARA COMPUS ANTIGUAS → Descarga Rekordbox 6, no necesitas licencia."
    },
    {
      id: "rekordbox-5",
      name: "Rekordbox 5",
      version: "5.8.x",
      developer: "Pioneer DJ",
      category: "dj-software",
      categoryLabel: "DJ Software",
      description: {
        es: "Versión legacy para computadoras muy antiguas. Requiere una licencia de hardware (controlador Pioneer) para activar. No recomendada a menos que tengas hardware muy viejo.",
        en: "Legacy version for very old computers. Requires a hardware license key (Pioneer controller) to activate. Not recommended unless you have very old hardware."
      },
      platforms: ["windows", "mac"],
      pricing: "free",
      hasFreeTier: true,
      freeTier: "Requiere hardware Pioneer para activar",
      language: ["en", "ja"],
      links: [
        { label: "Descargar (Oficial)", url: "https://support.pioneerdj.com/hc/en-us/articles/4598241828761", type: "download" },
        { label: "Guía de Versiones", url: "https://djgym.mx/rekordbox-6-y-rekordbox-5/", type: "guide" }
      ],
      tags: ["rekordbox", "pioneer", "dj-software", "legacy", "antiguo"],
      icon: "🎛️",
      recommendation: "Solo si tu PC es muy vieja (Windows 7 / macOS Sierra). Prefiere Rekordbox 6 o Mixxx."
    },
    {
      id: "serato-dj-pro",
      name: "Serato DJ Pro",
      version: "4.0.x",
      developer: "Serato",
      category: "dj-software",
      categoryLabel: "DJ Software",
      description: {
        es: "Software DJ profesional con la mejor integración de hardware. Ideal para scratch y DVS. Prueba gratuita de 14 días del Serato DJ Suite.",
        en: "Professional DJ software with the best hardware integration. Great for scratching and DVS. 14-day free trial of Serato DJ Suite."
      },
      platforms: ["windows", "mac"],
      pricing: "paid",
      hasFreeTier: true,
      freeTier: "14 días de prueba gratuita",
      language: ["en"],
      links: [
        { label: "Descargar Pro", url: "https://serato.com/dj/pro/downloads", type: "download" },
        { label: "Probar Gratis 14 días", url: "https://serato.com/dj/pro", type: "trial" }
      ],
      tags: ["serato", "dj-software", "scratch", "dvs", "profesional"],
      icon: "🎚️",
      recommendation: "La mejor opción si usas controladores Serato o tocadiscos con DVS."
    },
    {
      id: "serato-dj-lite",
      name: "Serato DJ Lite",
      version: "4.0.x",
      developer: "Serato",
      category: "dj-software",
      categoryLabel: "DJ Software",
      description: {
        es: "Versión gratuita de Serato con todas las herramientas esenciales para empezar a pinchar. Compatible con más de 50 controladores. Ideal para principiantes.",
        en: "Free version of Serato with all essential tools to start DJing. Compatible with 50+ controllers. Ideal for beginners."
      },
      platforms: ["windows", "mac"],
      pricing: "free",
      hasFreeTier: true,
      freeTier: "Completo — sin límites de tiempo",
      language: ["en"],
      links: [
        { label: "Descargar Gratis", url: "https://serato.com/dj/lite/downloads", type: "download" },
        { label: "Qué incluye", url: "https://serato.com/dj/lite", type: "info" }
      ],
      tags: ["serato", "dj-software", "gratis", "principiante"],
      icon: "🎚️",
      recommendation: "MEJOR SOFTWARE GRATIS PARA EMPEZAR → No necesitas licencia ni suscripción."
    },
    {
      id: "traktor-pro-3",
      name: "Traktor Pro 3",
      version: "3.10.x",
      developer: "Native Instruments",
      category: "dj-software",
      categoryLabel: "DJ Software",
      description: {
        es: "Software DJ de 4 decks con Remix Decks y más de 40 efectos. Estándar en clubs de techno y house. Demo gratuita de 30 minutos (reiniciable).",
        en: "4-deck DJ software with Remix Decks and 40+ effects. Club standard for techno and house. 30-minute free demo (reopenable)."
      },
      platforms: ["windows", "mac"],
      pricing: "paid",
      hasFreeTier: true,
      freeTier: "Demo 30 minutos (reiniciable)",
      language: ["en", "de"],
      links: [
        { label: "Descargar Demo", url: "https://www.native-instruments.com/en/specials/traktor-pro-3-demo/", type: "download" },
        { label: "Native Access", url: "https://www.native-instruments.com/en/support/downloads/", type: "download" },
        { label: "Alternativa Gratis → Mixxx", url: "https://mixxx.org/", type: "alternative" }
      ],
      tags: ["traktor", "native-instruments", "dj-software", "demo", "techno"],
      icon: "🎧",
      recommendation: "La demo es ilimitada si no te importa reiniciar cada 30 min. Alternativa gratis: Mixxx."
    },
    {
      id: "virtual-dj",
      name: "VirtualDJ 2026",
      version: "2026",
      developer: "Atomix Productions",
      category: "dj-software",
      categoryLabel: "DJ Software",
      description: {
        es: "Software DJ con separación de stems en tiempo real, soporte para video y karaoke. Gratuito para uso doméstico. Más de 186 millones de descargas.",
        en: "DJ software with real-time stem separation, video and karaoke support. Free for home use. 186M+ downloads."
      },
      platforms: ["windows", "mac"],
      pricing: "freemium",
      hasFreeTier: true,
      freeTier: "Gratuito para uso doméstico (sin límite de tiempo)",
      language: ["en", "es", "fr", "de", "ja"],
      links: [
        { label: "Descargar Gratis", url: "https://virtualdj.com/download/", type: "download" },
        { label: "Comprar Licencia", url: "https://virtualdj.com/buy/", type: "buy" }
      ],
      tags: ["virtualdj", "dj-software", "gratis", "stems", "video"],
      icon: "💿",
      recommendation: "Excelente para home DJing. La versión gratis es muy completa."
    },
    {
      id: "mixxx",
      name: "Mixxx",
      version: "2.5.6",
      developer: "Mixxx Community (Open Source)",
      category: "dj-software",
      categoryLabel: "DJ Software",
      description: {
        es: "Software DJ profesional gratuito y de código abierto. Detección de BPM y key, soporte para controladores MIDI/HID, control por vinilo timecode. Sin límites, sin suscripción.",
        en: "Free and open-source professional DJ software. BPM/key detection, MIDI/HID controller support, timecode vinyl control. No limits, no subscription."
      },
      platforms: ["windows", "mac", "linux"],
      pricing: "free",
      hasFreeTier: true,
      freeTier: "Completamente gratuito (open source GPL)",
      language: ["en", "es", "fr", "de", "ja", "pt"],
      links: [
        { label: "Descargar Gratis", url: "https://mixxx.org/download/", type: "download" },
        { label: "Características", url: "https://mixxx.org/features/", type: "info" },
        { label: "Source Code (GitHub)", url: "https://github.com/mixxxdj/mixxx", type: "source" }
      ],
      tags: ["mixxx", "dj-software", "gratis", "open-source", "linux", "dvs"],
      icon: "🎵",
      recommendation: "MEJOR ALTERNATIVA GRATIS A REKORDBOX/TRAKTOR → 100% gratis, sin trucos."
    },
    {
      id: "djay-pro",
      name: "djay Pro AI",
      version: "5.x",
      developer: "Algoriddim",
      category: "dj-software",
      categoryLabel: "DJ Software",
      description: {
        es: "Software DJ con integración de Spotify y Apple Music, separación neural de stems, y soporte multiplataforma (Mac/iOS/Windows).",
        en: "DJ software with Spotify and Apple Music integration, neural stem separation, and cross-platform support (Mac/iOS/Windows)."
      },
      platforms: ["windows", "mac", "ios", "android"],
      pricing: "paid",
      hasFreeTier: true,
      freeTier: "iOS/Android gratuito con funciones básicas",
      language: ["en", "es", "fr", "de", "ja"],
      links: [
        { label: "Descargar", url: "https://www.algoriddim.com/djay-pro", type: "download" },
        { label: "App Store", url: "https://apps.apple.com/app/djay-pro/id1533186218", type: "download" }
      ],
      tags: ["djay", "algoriddim", "dj-software", "ios", "spotify"],
      icon: "📱",
      recommendation: "La app iOS es excelente para practicar en cualquier lado."
    },

    // ==================== STEM SEPARATION ====================
    {
      id: "lamina",
      name: "Lamina",
      version: "1.x",
      developer: "PracticeSession",
      category: "stem-tools",
      categoryLabel: "Stem Separation",
      description: {
        es: "Separador de stems gratuito con IA. Aísla voces, batería, bajo, guitarra y piano. Procesamiento local o en la nube. Gratuito para siempre (sin tarjeta de crédito).",
        en: "Free AI stem splitter. Isolate vocals, drums, bass, guitar, and piano. Local or cloud processing. Free forever (no credit card)."
      },
      platforms: ["windows", "mac", "linux"],
      pricing: "free",
      hasFreeTier: true,
      freeTier: "Completamente gratuito",
      language: ["en"],
      links: [
        { label: "Descargar Gratis", url: "https://www.practicesession.app/lamina/", type: "download" }
      ],
      tags: ["stems", "separacion", "ia", "gratis", "audio"],
      icon: "🔊",
      recommendation: "MEJOR SEPARADOR DE STEMS GRATIS → App de escritorio, fácil de usar."
    },
    {
      id: "stemdeck",
      name: "StemDeck",
      version: "0.x",
      developer: "thcp (Open Source)",
      category: "stem-tools",
      categoryLabel: "Stem Separation",
      description: {
        es: "Separador de stems local con IA. Pega un URL de YouTube y obtén 6 stems (voces, batería, bajo, guitarra, piano, otros). Tu audio nunca sale de tu máquina.",
        en: "Local AI stem separator. Paste a YouTube URL and get 6 stems (vocals, drums, bass, guitar, piano, other). Audio never leaves your machine."
      },
      platforms: ["windows", "mac", "linux"],
      pricing: "free",
      hasFreeTier: true,
      freeTier: "Completamente gratuito y open source",
      language: ["en"],
      links: [
        { label: "Descargar (GitHub)", url: "https://github.com/thcp/stemdeck", type: "source" }
      ],
      tags: ["stems", "separacion", "youtube", "ia", "privacidad"],
      icon: "🧠",
      recommendation: "Perfecto para sacar stems de videos de YouTube. 100% local y privado."
    },
    {
      id: "track2stem",
      name: "track2stem",
      version: "1.x",
      developer: "mbianchidev (Open Source)",
      category: "stem-tools",
      categoryLabel: "Stem Separation",
      description: {
        es: "Alternativa open source a Moises. Separa cualquier pista en 6 stems (voces, batería, bajo, guitarra, piano, otros) usando IA. Corre en Docker.",
        en: "Open-source Moises alternative. Splits any track into 6 stems using AI. Runs in Docker."
      },
      platforms: ["windows", "mac", "linux"],
      pricing: "free",
      hasFreeTier: true,
      freeTier: "Completamente gratuito y open source",
      language: ["en"],
      links: [
        { label: "Descargar (GitHub)", url: "https://github.com/mbianchidev/track2stem", type: "source" }
      ],
      tags: ["stems", "separacion", "docker", "ia", "moises-alternativa"],
      icon: "🧩",
      recommendation: "Para usuarios técnicos con Docker. La mejor alternativa open source a Moises."
    },
    {
      id: "misst",
      name: "MISST",
      version: "3.1.0",
      developer: "Frikallo (Open Source)",
      category: "stem-tools",
      categoryLabel: "Stem Separation",
      description: {
        es: "Reproductor musical + separador de stems (bajo, batería, voces, instrumentos). Interfaz gráfica fácil de usar. Basado en Demucs.",
        en: "Music player + stem separator (bass, drums, vocals, instruments). Easy-to-use GUI. Powered by Demucs."
      },
      platforms: ["windows"],
      pricing: "free",
      hasFreeTier: true,
      freeTier: "Completamente gratuito y open source",
      language: ["en"],
      links: [
        { label: "Descargar (GitHub)", url: "https://github.com/Frikallo/MISST", type: "source" }
      ],
      tags: ["stems", "reproductor", "windows", "gui"],
      icon: "🎹",
      recommendation: "Windows-only. Incluye reproductor musical integrado. Muy fácil de usar."
    },
    {
      id: "moises",
      name: "Moises AI",
      version: "Última",
      developer: "Moises",
      category: "stem-tools",
      categoryLabel: "Stem Separation",
      description: {
        es: "Separador de stems en la nube. Súbele el volumen a las voces, baja la batería, aísla instrumentos. App móvil + web. Plan gratuito disponible.",
        en: "Cloud stem separator. Turn up vocals, lower drums, isolate instruments. Mobile + web. Free plan available."
      },
      platforms: ["web", "ios", "android"],
      pricing: "freemium",
      hasFreeTier: true,
      freeTier: "Separaciones limitadas por mes",
      language: ["en", "es", "pt"],
      links: [
        { label: "Probar Gratis", url: "https://moises.ai/", type: "trial" }
      ],
      tags: ["stems", "ia", "movil", "web", "moises"],
      icon: "🎤",
      recommendation: "La mejor calidad de separación, pero el plan gratis es limitado. Alternativa: Lamina o StemDeck."
    },

    // ==================== DJ UTILITIES ====================
    {
      id: "mixed-in-key",
      name: "Mixed In Key",
      version: "10.x",
      developer: "Mixed In Key",
      category: "utilities",
      categoryLabel: "DJ Utilities",
      description: {
        es: "Analiza la clave musical y energía de tus tracks. Encuentra las mejores combinaciones armónicas para mezclar. Estándar en la industria para harmonic mixing.",
        en: "Analyzes musical key and energy of your tracks. Find the best harmonic combinations for mixing. Industry standard for harmonic mixing."
      },
      platforms: ["windows", "mac"],
      pricing: "paid",
      hasFreeTier: false,
      language: ["en"],
      links: [
        { label: "Comprar", url: "https://mixedinkey.com/", type: "buy" },
        { label: "Alternativa Gratis → Mixxx", url: "https://mixxx.org/", type: "alternative" }
      ],
      tags: ["key-analysis", "harmonic-mixing", "pago", "energia"],
      icon: "🔑",
      recommendation: "Mixxx incluye detección de key gratuita (no necesitas Mixed In Key si usas Mixxx)."
    },
    {
      id: "rekord-buddy",
      name: "Rekord Buddy",
      version: "4.x",
      developer: "Rekord Buddy",
      category: "utilities",
      categoryLabel: "DJ Utilities",
      description: {
        es: "Convierte y migra bibliotecas entre Rekordbox, Serato, Traktor. Cue points, beatgrids y playlists se transfieren automáticamente.",
        en: "Convert and migrate libraries between Rekordbox, Serato, Traktor. Cue points, beatgrids and playlists transfer automatically."
      },
      platforms: ["windows", "mac"],
      pricing: "paid",
      hasFreeTier: true,
      freeTier: "Demo limitada a 20 tracks",
      language: ["en"],
      links: [
        { label: "Comprar", url: "https://rekordbuddy.com/", type: "buy" }
      ],
      tags: ["migracion", "rekordbox", "serato", "traktor", "utilidad"],
      icon: "🔄",
      recommendation: "Imprescindible si cambias de software DJ (Rekordbox ↔ Serato)."
    },
    {
      id: "lexicon-dj",
      name: "Lexicon DJ",
      version: "2.x",
      developer: "Helix Engine",
      category: "utilities",
      categoryLabel: "DJ Utilities",
      description: {
        es: "Convierte playlists de Rekordbox a Serato y viceversa. Versión gratuita con límite de 20 tracks por conversión.",
        en: "Convert playlists between Rekordbox and Serato. Free version with 20-track limit per conversion."
      },
      platforms: ["windows", "mac"],
      pricing: "freemium",
      hasFreeTier: true,
      freeTier: "20 tracks por conversión",
      language: ["en"],
      links: [
        { label: "Descargar", url: "https://lexicondj.com/", type: "download" }
      ],
      tags: ["migracion", "playlists", "rekordbox", "serato"],
      icon: "📋",
      recommendation: "Alternativa gratuita a Rekord Buddy para conversiones pequeñas."
    },
    {
      id: "rekordcloud",
      name: "rekordcloud",
      version: "Web",
      developer: "rekordcloud",
      category: "utilities",
      categoryLabel: "DJ Utilities",
      description: {
        es: "Plataforma web para analizar, limpiar y organizar tu biblioteca de Rekordbox. Duplicados, tags faltantes, análisis de energía y key.",
        en: "Web platform to analyze, clean, and organize your Rekordbox library. Duplicates, missing tags, energy and key analysis."
      },
      platforms: ["web"],
      pricing: "freemium",
      hasFreeTier: true,
      freeTier: "Análisis básico gratuito",
      language: ["en"],
      links: [
        { label: "Probar Gratis", url: "https://rekordcloud.com/", type: "trial" }
      ],
      tags: ["analisis", "biblioteca", "limpieza", "web"],
      icon: "☁️",
      recommendation: "Útil para limpiar bibliotecas grandes de Rekordbox."
    },

    // ==================== AUDIO TOOLS ====================
    {
      id: "audacity",
      name: "Audacity",
      version: "3.7.x",
      developer: "Audacity Team (Open Source)",
      category: "audio-tools",
      categoryLabel: "Audio Tools",
      description: {
        es: "Editor de audio gratuito y open source. Graba, edita, corta, mezcla y aplica efectos a cualquier archivo de audio. Ideal para editar tracks, grabar sets y masterizar.",
        en: "Free and open-source audio editor. Record, edit, cut, mix and apply effects to any audio file. Great for editing tracks, recording sets, and mastering."
      },
      platforms: ["windows", "mac", "linux"],
      pricing: "free",
      hasFreeTier: true,
      freeTier: "Completamente gratuito y open source",
      language: ["en", "es", "fr", "de", "ja", "pt"],
      links: [
        { label: "Descargar Gratis", url: "https://www.audacityteam.org/download/", type: "download" }
      ],
      tags: ["editor", "audio", "gratis", "grabacion", "masterizacion"],
      icon: "🎙️",
      recommendation: "EDITOR DE AUDIO ESENCIAL → Gratuito, potente, multiplataforma."
    },
    {
      id: "obs-studio",
      name: "OBS Studio",
      version: "31.x",
      developer: "OBS Project (Open Source)",
      category: "audio-tools",
      categoryLabel: "Audio Tools",
      description: {
        es: "Software gratuito para grabación y streaming en vivo. Captura sets en vivo, graba mixes, o transmite a Twitch/YouTube. Open source y muy potente.",
        en: "Free software for recording and live streaming. Capture live sets, record mixes, or stream to Twitch/YouTube. Open source and very powerful."
      },
      platforms: ["windows", "mac", "linux"],
      pricing: "free",
      hasFreeTier: true,
      freeTier: "Completamente gratuito y open source",
      language: ["en", "es", "fr", "de", "ja", "pt", "zh"],
      links: [
        { label: "Descargar Gratis", url: "https://obsproject.com/", type: "download" }
      ],
      tags: ["streaming", "grabacion", "video", "gratis", "open-source"],
      icon: "📺",
      recommendation: "ESTÁNDAR PARA STREAMING DE SETS → Usado por Boiler Room, DJs, radios online."
    },
    {
      id: "vb-cable",
      name: "VB-Cable Virtual Audio Cable",
      version: "Última",
      developer: "VB-Audio Software",
      category: "audio-tools",
      categoryLabel: "Audio Tools",
      description: {
        es: "Cable de audio virtual. Enruta audio entre aplicaciones — graba tu set desde Rekordbox a OBS/Audacity, o escucha Spotify por tu controlador DJ.",
        en: "Virtual audio cable. Route audio between apps — record your set from Rekordbox to OBS/Audacity, or listen to Spotify through your DJ controller."
      },
      platforms: ["windows"],
      pricing: "free",
      hasFreeTier: true,
      freeTier: "1 cable virtual gratuito (suficiente para la mayoría)",
      language: ["en"],
      links: [
        { label: "Descargar Gratis", url: "https://vb-audio.com/Cable/", type: "download" }
      ],
      tags: ["audio", "ruteo", "windows", "grabacion", "streaming"],
      icon: "🔌",
      recommendation: "ESENCIAL PARA GRABAR SETS → Enruta el audio de Rekordbox a Audacity/OBS."
    },
    {
      id: "blackhole",
      name: "BlackHole",
      version: "0.5.x",
      developer: "Existential Audio (Open Source)",
      category: "audio-tools",
      categoryLabel: "Audio Tools",
      description: {
        es: "Cable de audio virtual para macOS (alternativa gratuita a Loopback). Enruta audio entre aplicaciones para grabar sets o hacer streaming.",
        en: "Virtual audio driver for macOS (free alternative to Loopback). Route audio between apps for recording sets or streaming."
      },
      platforms: ["mac"],
      pricing: "free",
      hasFreeTier: true,
      freeTier: "Completamente gratuito y open source",
      language: ["en"],
      links: [
        { label: "Descargar Gratis", url: "https://github.com/ExistentialAudio/BlackHole", type: "source" }
      ],
      tags: ["audio", "ruteo", "mac", "grabacion", "streaming"],
      icon: "🕳️",
      recommendation: "ALTERNATIVA GRATIS A LOOPBACK → Esencial para DJs con Mac que graban sus sets."
    },

    // ==================== MUSIC PRODUCTION ====================
    {
      id: "ableton-live",
      name: "Ableton Live",
      version: "12.x",
      developer: "Ableton",
      category: "music-production",
      categoryLabel: "Music Production",
      description: {
        es: "DAW estándar para producción de música electrónica. Vista Session para improvisación y Vista Arrangement para composición. Prueba gratuita de 90 días.",
        en: "Industry-standard DAW for electronic music production. Session View for improvisation and Arrangement View for composition. 90-day free trial."
      },
      platforms: ["windows", "mac"],
      pricing: "paid",
      hasFreeTier: true,
      freeTier: "90 días de prueba gratuita (completa)",
      language: ["en", "es", "fr", "de", "ja"],
      links: [
        { label: "Probar Gratis 90 días", url: "https://www.ableton.com/en/trial/", type: "trial" },
        { label: "Comprar", url: "https://www.ableton.com/en/shop/", type: "buy" }
      ],
      tags: ["produccion", "daw", "ableton", "musica-electronica"],
      icon: "🎹",
      recommendation: "El estándar para producción de música electrónica."
    },
    {
      id: "fl-studio",
      name: "FL Studio",
      version: "2024.x",
      developer: "Image-Line",
      category: "music-production",
      categoryLabel: "Music Production",
      description: {
        es: "DAW popular con actualizaciones gratuitas de por vida. Excelente para beatmaking y producción de género urbano. Prueba gratuita sin límite de tiempo.",
        en: "Popular DAW with free lifetime updates. Great for beatmaking and urban music production. Unlimited free trial."
      },
      platforms: ["windows", "mac"],
      pricing: "paid",
      hasFreeTier: true,
      freeTier: "Prueba gratuita sin límite de tiempo (no puedes guardar proyectos)",
      language: ["en", "es", "fr", "de"],
      links: [
        { label: "Descargar Trial", url: "https://www.image-line.com/fl-studio-download/", type: "download" }
      ],
      tags: ["produccion", "daw", "beatmaking", "urbano"],
      icon: "🎹",
      recommendation: "Prueba gratuita sin límite de tiempo. Ideal para beatmaking."
    },
    {
      id: "komplete-start",
      name: "KOMPLETE START",
      version: "Última",
      developer: "Native Instruments",
      category: "music-production",
      categoryLabel: "Music Production",
      description: {
        es: "Paquete gratuito de instrumentos virtuales y efectos. Incluye sintetizadores, samplers, pianos, guitarras y más. Más de 2GB de sonidos gratuitos.",
        en: "Free bundle of virtual instruments and effects. Includes synthesizers, samplers, pianos, guitars and more. 2GB+ of free sounds."
      },
      platforms: ["windows", "mac"],
      pricing: "free",
      hasFreeTier: true,
      freeTier: "Completamente gratuito",
      language: ["en", "es", "fr", "de", "ja"],
      links: [
        { label: "Descargar Gratis", url: "https://www.native-instruments.com/en/products/komplete/bundles/komplete-start/", type: "download" },
        { label: "Native Access", url: "https://www.native-instruments.com/en/support/downloads/", type: "download" }
      ],
      tags: ["produccion", "instrumentos", "gratis", "native-instruments"],
      icon: "🎹",
      recommendation: "PAQUETE DE SONIDOS GRATIS ESENCIAL → 2GB+ de instrumentos de alta calidad."
    },
    {
      id: "vital-audio",
      name: "Vital",
      version: "1.5.x",
      developer: "Matt Tytel",
      category: "music-production",
      categoryLabel: "Music Production",
      description: {
        es: "Sintetizador wavetable gratuito de nivel profesional. Competencia directa de Serum pero gratuito. Sonidos 3D, modulación flexible y comunidad activa.",
        en: "Free professional wavetable synthesizer. Direct Serum competitor but free. 3D sounds, flexible modulation, and active community."
      },
      platforms: ["windows", "mac", "linux"],
      pricing: "free",
      hasFreeTier: true,
      freeTier: "Versión gratuita con todas las funciones (limitación: menos presets incluidos)",
      language: ["en"],
      links: [
        { label: "Descargar Gratis", url: "https://vital.audio/", type: "download" }
      ],
      tags: ["sintetizador", "wavetable", "gratis", "produccion", "sonido"],
      icon: "🎛️",
      recommendation: "MEJOR SINTETIZADOR GRATIS → Alternativa gratuita a Serum."
    },

    // ==================== CREATIVE TOOLS ====================
    {
      id: "rekordbox-to-x",
      name: "Conversores Rekordbox ↔ Otros",
      version: "Varios",
      developer: "Comunidad",
      category: "utilities",
      categoryLabel: "DJ Utilities",
      description: {
        es: "Colección de herramientas gratuitas para convertir playlists de Rekordbox a Traktor, Serato, Virtual DJ y otros formatos.",
        en: "Collection of free tools to convert Rekordbox playlists to Traktor, Serato, Virtual DJ and other formats."
      },
      platforms: ["windows", "mac", "web"],
      pricing: "free",
      hasFreeTier: true,
      freeTier: "Mayoría gratuitos",
      language: ["en"],
      links: [
        { label: "Rekordbox XML Tool", url: "https://github.com/macr0w/rekordbox2traktor", type: "source" },
        { label: "Rekordbox Buddy (Web)", url: "https://www.rekordcloud.com/rb-tool/", type: "webapp" }
      ],
      tags: ["conversion", "playlists", "xml", "utilidad"],
      icon: "🔄",
      recommendation: "Herramientas de la comunidad para cuando cambias de ecosistema DJ."
    },
    {
      id: "beatport-link",
      name: "Beatport / Beatsource Streaming",
      version: "Web",
      developer: "Beatport",
      category: "dj-software",
      categoryLabel: "DJ Software",
      description: {
        es: "Servicio de streaming para DJs. Accede a millones de tracks directamente en Rekordbox, Serato, Virtual DJ y más. No necesitas descargar los archivos.",
        en: "Streaming service for DJs. Access millions of tracks directly in Rekordbox, Serato, Virtual DJ and more. No need to download files."
      },
      platforms: ["web", "windows", "mac", "ios", "android"],
      pricing: "paid",
      hasFreeTier: false,
      language: ["en", "es", "fr", "de", "ja"],
      links: [
        { label: "Ver Planes", url: "https://www.beatport.com/", type: "buy" }
      ],
      tags: ["streaming", "musica", "suscripcion"],
      icon: "🌐",
      recommendation: "Para DJs que quieren acceso a millones de tracks sin descargarlos."
    }
  ],

  getCategories: function() {
    const cats = new Set();
    this.resources.forEach(r => cats.add(r.category));
    return Array.from(cats);
  },

  getCategoryLabel: function(category) {
    const r = this.resources.find(r => r.category === category);
    return r ? r.categoryLabel : category;
  },

  getPlatformIcon: function(platform) {
    const icons = {
      windows: '🪟',
      mac: '🍎',
      linux: '🐧',
      ios: '📱',
      android: '🤖',
      web: '🌐'
    };
    return icons[platform] || '';
  },

  getPricingBadge: function(pricing) {
    const badges = {
      free: { text: '🆓 Gratis', color: '#00c853' },
      freemium: { text: '⚖️ Freemium', color: '#ff9100' },
      paid: { text: '💵 Pago', color: '#2979ff' }
    };
    return badges[pricing] || badges.free;
  }
};
