const HardwareDB = {
  // Comprehensive DJ Hardware Database
  // Data compiled from official sources and community knowledge
  
  devices: [
    // ==================== PIONEER CDJs ====================
    {
      id: "cdj-3000",
      name: "CDJ-3000",
      brand: "Pioneer",
      brandSlug: "pioneer",
      type: "cdj",
      typeLabel: "CDJ",
      releaseYear: 2020,
      image: "cdj-3000",
      usb: {
        format: "FAT32",
        maxPartition: "32GB (official) / 128GB+ (tested)",
        maxFiles: 10000,
        recommendedDrives: [
          "SanDisk Extreme Pro 32GB",
          "Samsung BAR Plus 32GB",
          "Lexar JumpDrive S45"
        ],
        tips: "FAT32 required for stability. Larger drives work but some older units may have issues."
      },
      software: {
        name: "Rekordbox",
        version: "6.x",
        versionWarning: "Avoid Rekordbox 7.x - export crashes reported on some units",
        downloadUrl: "https://rekordbox.com/download/",
        downloadNote: "Download Rekordbox v6 (not v7)",
        exportMode: "Performance Mode",
        analysis: "On-device BPM/Key analysis available"
      },
      exportSteps: [
        "Connect USB to computer and open Rekordbox",
        "Go to Preferences → Export",
        "Select 'USB Export Mode' tab",
        "Configure: Signal Information → Set to 'For Club'",
        "Select tracks in library → Right-click → Export",
        "Wait for waveform analysis to complete",
        "Use 'Safely Remove Hardware' before disconnecting"
      ],
      proTips: [
        { text: "Analyze ALL tracks in Rekordbox before export - on-unit analysis is slower", badge: "essential" },
        { text: "Quantize your grid in Rekordbox BEFORE export, not on the CDJ", badge: "pro" },
        { text: "Hot cues set on Mac may shift 20-50ms when played on CDJ - always test beforehand", badge: "warning" },
        { text: "Keep playlist names under 24 characters to avoid display issues", badge: "tip" },
        { text: "Export in 'Link Export' mode for seamlessrekordbox integration", badge: "pro" },
        { text: "Use 'Persistently Save' for memory cues if firmware supports it", badge: "tip" }
      ],
      knownIssues: [
        { text: "Firmware 1.02-1.03 had WiFi stability issues - keep updated", severity: "warning" },
        { text: "Memory cues from Serato DJ don't transfer - only hot cues work", severity: "info" },
        { text: "USB 3.0 drives work but no speed benefit over USB 2.0", severity: "info" },
        { text: "Some MP3 tags not displayed correctly - use ID3v2.3 or UTF-8", severity: "tip" }
      ],
      compatibleWith: ["DJM-900NXS2", "DJM-V10", "DJM-A9", "CDJ-3000"],
      specifications: {
        playableFormats: ["MP3", "AAC", "WAV", "FLAC", "ALAC", "AIFF"],
        display: "9-inch touch screen",
        tempoRange: "-50% to +50%",
        jogSize: "206mm"
      }
    },

    {
      id: "cdj-2000nxs2",
      name: "CDJ-2000NXS2",
      brand: "Pioneer",
      brandSlug: "pioneer",
      type: "cdj",
      typeLabel: "CDJ",
      releaseYear: 2016,
      image: "cdj-2000nxs2",
      usb: {
        format: "FAT32",
        maxPartition: "32GB (official)",
        maxFiles: 10000,
        recommendedDrives: [
          "SanDisk Extreme Pro 32GB",
          "Samsung BAR Plus",
          "Transcend JetFlash 700"
        ],
        tips: "FAT32 is mandatory. Some users report issues with drives larger than 64GB."
      },
      software: {
        name: "Rekordbox",
        version: "5.x or 6.x",
        versionWarning: "Rekordbox 7.x has compatibility issues with NXS2",
        downloadUrl: "https://rekordbox.com/download/",
        downloadNote: "Download Rekordbox v6",
        exportMode: "Performance Mode",
        analysis: "On-device analysis available but slower than CDJ-3000"
      },
      exportSteps: [
        "Connect USB to computer",
        "Open Rekordbox (version 5.x or 6.x recommended)",
        "Preferences → Export tab",
        "Select USB device from dropdown",
        "Enable 'Create New Database' if asked",
        "Select tracks → Right-click → Export to USB",
        "Wait for export and waveform analysis",
        "Safely eject USB"
      ],
      proTips: [
        { text: "Always analyze tracks in Rekordbox before export", badge: "essential" },
        { text: "Quantize beatgrid BEFORE export - on-CDJ quantization is limited", badge: "pro" },
        { text: "Hot cue points may shift slightly - test your critical cues", badge: "warning" },
        { text: "Use shorter playlist names (under 20 chars)", badge: "tip" },
        { text: "Export with 'Include History' to retain play count data", badge: "pro" }
      ],
      knownIssues: [
        { text: "Firmware 1.72 has WiFi stability problems", severity: "warning" },
        { text: "Does NOT read FLAC files from USB - only MP3/AAC/WAV/AIFF", severity: "warning" },
        { text: "Memory cues don't transfer from Serato - hot cues only", severity: "info" },
        { text: "Older firmware versions have slower track loading", severity: "info" }
      ],
      compatibleWith: ["DJM-900NXS2", "DJM-2000NXS2", "DJM-850", "CDJ-2000NXS2", "CDJ-2000"],
      specifications: {
        playableFormats: ["MP3", "AAC", "WAV", "AIFF"],
        display: "7-inch full color LCD",
        tempoRange: "-50% to +50%",
        jogSize: "206mm"
      }
    },

    {
      id: "cdj-900nxs",
      name: "CDJ-900NXS",
      brand: "Pioneer",
      brandSlug: "pioneer",
      type: "cdj",
      typeLabel: "CDJ",
      releaseYear: 2014,
      image: "cdj-900nxs",
      usb: {
        format: "FAT32",
        maxPartition: "32GB",
        maxFiles: 10000,
        recommendedDrives: [
          "SanDisk Extreme 16GB/32GB",
          "Kingston DataTraveler"
        ],
        tips: "Keep drives under 32GB for guaranteed compatibility."
      },
      software: {
        name: "Rekordbox",
        version: "4.x, 5.x",
        versionWarning: "Use Rekordbox 5.x - version 6+ may have issues",
        downloadUrl: "https://rekordbox.com/download/",
        downloadNote: "Download Rekordbox v5",
        exportMode: "Export Mode",
        analysis: "Basic on-device analysis"
      },
      exportSteps: [
        "Connect USB to computer with Rekordbox",
        "Configure export settings in Preferences",
        "Select tracks to export",
        "Right-click → Export",
        "Wait for process to complete"
      ],
      proTips: [
        { text: "Analyze tracks before export for faster loading", badge: "essential" },
        { text: "Keep playlists short and simple", badge: "tip" }
      ],
      knownIssues: [
        { text: "Does not support FLAC at all", severity: "warning" },
        { text: "Older unit - may have firmware update limitations", severity: "info" },
        { text: "Smaller display than NXS2 - less track info visible", severity: "info" }
      ],
      compatibleWith: ["DJM-900NXS2", "DJM-850", "DJM-750", "CDJ-900NXS", "CDJ-2000"],
      specifications: {
        playableFormats: ["MP3", "AAC", "WAV", "AIFF"],
        display: "4.3-inch full color LCD",
        tempoRange: "-50% to +50%",
        jogSize: "188mm"
      }
    },

    // ==================== PIONEER XDJ ====================
    {
      id: "xdj-xz",
      name: "XDJ-XZ",
      brand: "Pioneer",
      brandSlug: "pioneer",
      type: "all-in-one",
      typeLabel: "All-in-One System",
      releaseYear: 2019,
      image: "xdj-xz",
      usb: {
        format: "FAT32",
        maxPartition: "128GB",
        maxFiles: 10000,
        recommendedDrives: [
          "SanDisk Extreme Pro 64GB",
          "Samsung T7 Portable SSD"
        ],
        tips: "Supports larger drives than standalone CDJs. SSD recommended for best performance."
      },
      software: {
        name: "Rekordbox",
        version: "6.x",
        versionWarning: "Avoid Rekordbox 7.x",
        downloadUrl: "https://rekordbox.com/download/",
        downloadNote: "Download Rekordbox v6",
        exportMode: "Performance Mode / Link Export",
        analysis: "Full rekordbox compatibility"
      },
      exportSteps: [
        "Connect USB to computer",
        "Open Rekordbox → Preferences → Export",
        "Configure for 'For Club' or 'For Player'",
        "Export tracks with analysis data",
        "Safely eject before disconnecting"
      ],
      proTips: [
        { text: "Can also use with Engine DJ for dual software support", badge: "pro" },
        { text: "Supports USB and SD card simultaneously", badge: "tip" },
        { text: "Pro DJ Link allows connecting up to 4 players", badge: "essential" },
        { text: "Excellent for club installation or home practice", badge: "tip" }
      ],
      knownIssues: [
        { text: "Heavy (12.8kg) - not portable for mobile DJs", severity: "info" },
        { text: "Requires external mixer for full club setup", severity: "info" },
        { text: "No built-in WiFi for rekordbox link", severity: "tip" }
      ],
      compatibleWith: ["DJM-900NXS2", "DJM-V10", "XDJ-XZ"],
      specifications: {
        playableFormats: ["MP3", "AAC", "WAV", "FLAC", "ALAC", "AIFF"],
        display: "7-inch touch screen x2",
        tempoRange: "-50% to +50%",
        jogSize: "202mm"
      }
    },

    {
      id: "xdj-rx3",
      name: "XDJ-RX3",
      brand: "Pioneer",
      brandSlug: "pioneer",
      type: "controller",
      typeLabel: "Controller System",
      releaseYear: 2021,
      image: "xdj-rx3",
      usb: {
        format: "FAT32",
        maxPartition: "128GB",
        maxFiles: 10000,
        recommendedDrives: [
          "SanDisk Extreme Pro 32GB",
          "Samsung T5 SSD"
        ],
        tips: "Dual USB ports allow seamless DJ handoffs."
      },
      software: {
        name: "Rekordbox",
        version: "6.x",
        versionWarning: "Avoid Rekordbox 7.x",
        downloadUrl: "https://rekordbox.com/download/",
        downloadNote: "Download Rekordbox v6",
        exportMode: "Performance Mode",
        analysis: "Full analysis export"
      },
      exportSteps: [
        "Connect USB to rekordbox",
        "Export in Performance Mode",
        "Use USB A or B for computer connection",
        "Use USB C or another port for export drive"
      ],
      proTips: [
        { text: "Dual USB ports perfect for back-to-back sets", badge: "pro" },
        { text: "Can operate standalone with USB only", badge: "tip" },
        { text: "Built-in sound card for direct club connection", badge: "essential" }
      ],
      knownIssues: [
        { text: "Not as feature-rich as XDJ-XZ", severity: "info" },
        { text: "Smaller jog wheels than XZ", severity: "info" }
      ],
      compatibleWith: ["Self-contained"],
      specifications: {
        playableFormats: ["MP3", "AAC", "WAV", "FLAC", "ALAC", "AIFF"],
        display: "10.1-inch touch screen",
        tempoRange: "-50% to +50%",
        jogSize: "178mm"
      }
    },

    // ==================== PIONEER CONTROLLERS ====================
    {
      id: "ddj-1000",
      name: "DDJ-1000",
      brand: "Pioneer",
      brandSlug: "pioneer",
      type: "controller",
      typeLabel: "Controller",
      releaseYear: 2018,
      image: "ddj-1000",
      usb: {
        format: "FAT32",
        maxPartition: "128GB",
        maxFiles: 10000,
        recommendedDrives: [
          "SanDisk Extreme Pro 32GB",
          "Samsung BAR Plus"
        ],
        tips: "Full rekordbox compatibility with Performance Mode."
      },
      software: {
        name: "Rekordbox",
        version: "6.x",
        versionWarning: "Avoid Rekordbox 7.x for stable export",
        downloadUrl: "https://rekordbox.com/download/",
        downloadNote: "Download Rekordbox v6",
        exportMode: "Performance Mode",
        analysis: "Full export with all rekordbox features"
      },
      exportSteps: [
        "Connect controller to computer with USB cable",
        "Open rekordbox in Performance mode",
        "Export directly to connected USB drive",
        "Wait for analysis and export completion"
      ],
      proTips: [
        { text: "Jog display shows waveforms - great for visual cues", badge: "pro" },
        { text: "Can export to rekordbox djm-450/750 mode if no USB needed", badge: "tip" },
        { text: "Built-in sound card - plug directly into club PA", badge: "essential" }
      ],
      knownIssues: [
        { text: "Large and heavy - not ideal for mobile DJs", severity: "info" },
        { text: "Requires laptop to operate (not standalone)", severity: "warning" }
      ],
      compatibleWith: ["rekordbox djm-450/750"],
      specifications: {
        playableFormats: ["MP3", "AAC", "WAV", "FLAC", "ALAC", "AIFF"],
        display: "2.5-inch LCD per deck",
        jogSize: "206mm (full-size)"
      }
    },

    {
      id: "ddj-flx10",
      name: "DDJ-FLX10",
      brand: "Pioneer",
      brandSlug: "pioneer",
      type: "controller",
      typeLabel: "Controller",
      releaseYear: 2023,
      image: "ddj-flx10",
      usb: {
        format: "FAT32",
        maxPartition: "128GB",
        maxFiles: 10000,
        recommendedDrives: [
          "SanDisk Extreme Pro 64GB"
        ],
        tips: "Newest rekordbox controller with enhanced features."
      },
      software: {
        name: "Rekordbox",
        version: "7.x (compatible) or 6.x",
        versionWarning: "7.x now stable but 6.x still recommended",
        exportMode: "Performance Mode",
        analysis: "Full analysis including energy data"
      },
      exportSteps: [
        "Connect via USB to rekordbox",
        "Export in standard Performance Mode",
        "Use dedicated USB port for export"
      ],
      proTips: [
        { text: "DMX outputs for lighting control", badge: "pro" },
        { text: "Track Separation feature for remix-ready stems", badge: "pro" },
        { text: "Updated jog display with more info", badge: "tip" }
      ],
      knownIssues: [
        { text: "Requires laptop at all times", severity: "warning" },
        { text: "Premium feature rekordbox subscription for full features", severity: "info" }
      ],
      compatibleWith: ["rekordbox"],
      specifications: {
        playableFormats: ["MP3", "AAC", "WAV", "FLAC", "ALAC", "AIFF"],
        display: "4-inch touch screen",
        jogSize: "206mm"
      }
    },

    {
      id: "ddj-rev7",
      name: "DDJ-REV7",
      brand: "Pioneer",
      brandSlug: "pioneer",
      type: "controller",
      typeLabel: "Controller",
      releaseYear: 2022,
      image: "ddj-rev7",
      usb: {
        format: "FAT32",
        maxPartition: "128GB",
        maxFiles: 10000,
        recommendedDrives: [
          "SanDisk Extreme Pro 64GB",
          "Samsung T7"
        ],
        tips: "Professional controller with motorized jogs."
      },
      software: {
        name: "Rekordbox",
        version: "6.x or 7.x",
        versionWarning: "Both versions supported",
        exportMode: "Performance Mode",
        analysis: "Full export"
      },
      exportSteps: [
        "Connect to rekordbox",
        "Standard Performance Mode export",
        "Use USB Type-B for computer"
      ],
      proTips: [
        { text: "Motorized jog wheels with adjustable resistance", badge: "pro" },
        { text: "Large 7-inch touch screen", badge: "tip" },
        { text: "Independent EQ and filter per channel", badge: "pro" }
      ],
      knownIssues: [
        { text: "Very heavy (12.7kg) - primarily studio use", severity: "info" },
        { text: "Requires laptop to operate", severity: "warning" }
      ],
      compatibleWith: ["rekordbox"],
      specifications: {
        playableFormats: ["MP3", "AAC", "WAV", "FLAC", "ALAC", "AIFF"],
        display: "7-inch touch screen",
        jogSize: "207mm (motorized)"
      }
    },

    // ==================== DENON DJ ====================
    {
      id: "sc6000",
      name: "SC6000",
      brand: "Denon DJ",
      brandSlug: "denon",
      type: "cdj",
      typeLabel: "Media Player",
      releaseYear: 2019,
      image: "sc6000",
      usb: {
        format: "exFAT / FAT32",
        maxPartition: "No limit (tested up to 2TB)",
        maxFiles: 50000,
        recommendedDrives: [
          "Samsung T5 SSD",
          "SanDisk Extreme Pro SSD",
          "WD Blue SN550 NVMe"
        ],
        tips: "exFAT preferred for large drives. Also supports internal SSD installation."
      },
      software: {
        name: "Engine Prime",
        version: "1.x (latest)",
        versionWarning: null,
        downloadUrl: "https://enginedj.com/download/",
        downloadNote: "Download Engine DJ",
        exportMode: "Engine Prime USB Export",
        analysis: "BPM and Key analysis built-in"
      },
      exportSteps: [
        "Download and install Engine Prime (free)",
        "Connect USB drive to computer",
        "Import music to Engine Prime library",
        "Analyze tracks (BPM, Grid, Hotcues)",
        "Select tracks → Right-click → Export to USB",
        "Choose 'Standard' or 'High Density' export",
        "Safely eject drive"
      ],
      proTips: [
        { text: "Internal SSD slot - load entire library without USB", badge: "essential" },
        { text: "Use 'High Density' export for clubs with many tracks", badge: "pro" },
        { text: "Track analysis is excellent - better thanrekordbox for some tracks", badge: "pro" },
        { text: "Works with Engine DJ OS - standalone without computer", badge: "tip" }
      ],
      knownIssues: [
        { text: "Does NOT support Pioneer rekordbox databases directly", severity: "warning" },
        { text: "Serato databases require conversion", severity: "info" },
        { text: "Some older MP3s may need re-analysis", severity: "tip" }
      ],
      compatibleWith: ["SC6000M", "LC6000", "Prime 4", "Engine DJ"],
      specifications: {
        playableFormats: ["MP3", "AAC", "WAV", "FLAC", "AIFF", "OGG"],
        display: "10.1-inch HD touch screen",
        tempoRange: "-50% to +50%",
        jogSize: "220mm"
      }
    },

    {
      id: "sc5000",
      name: "SC5000",
      brand: "Denon DJ",
      brandSlug: "denon",
      type: "cdj",
      typeLabel: "Media Player",
      releaseYear: 2017,
      image: "sc5000",
      usb: {
        format: "exFAT / FAT32",
        maxPartition: "No limit",
        maxFiles: 50000,
        recommendedDrives: [
          "Samsung T5",
          "SanDisk Extreme Pro 64GB"
        ],
        tips: "exFAT recommended. Also accepts internal SSD."
      },
      software: {
        name: "Engine Prime",
        version: "1.x",
        versionWarning: null,
        downloadUrl: "https://enginedj.com/download/",
        downloadNote: "Download Engine DJ",
        exportMode: "Engine Prime USB Export",
        analysis: "Full analysis support"
      },
      exportSteps: [
        "Use Engine Prime to manage library",
        "Export tracks to formatted USB",
        "Standard Engine Prime workflow"
      ],
      proTips: [
        { text: "Internal SSD is major advantage over Pioneer", badge: "pro" },
        { text: "Dual-layer playback from single drive", badge: "pro" }
      ],
      knownIssues: [
        { text: "Older than SC6000 - fewer features", severity: "info" },
        { text: "Smaller screen than SC6000", severity: "info" }
      ],
      compatibleWith: ["SC5000M", "LC6000", "SC5000", "Engine DJ"],
      specifications: {
        playableFormats: ["MP3", "AAC", "WAV", "FLAC", "AIFF"],
        display: "7-inch multi-gesture touch screen",
        tempoRange: "-50% to +50%",
        jogSize: "200mm"
      }
    },

    {
      id: "prime-4",
      name: "Prime 4",
      brand: "Denon DJ",
      brandSlug: "denon",
      type: "all-in-one",
      typeLabel: "All-in-One System",
      releaseYear: 2019,
      image: "prime-4",
      usb: {
        format: "exFAT / FAT32",
        maxPartition: "No limit (tested 4TB+)",
        maxFiles: 100000,
        recommendedDrives: [
          "Samsung T7 SSD",
          "Seagate Backup Plus"
        ],
        tips: "Massive capacity support. Built-in hard drive bay."
      },
      software: {
        name: "Engine Prime",
        version: "1.x",
        versionWarning: null,
        downloadUrl: "https://enginedj.com/download/",
        downloadNote: "Download Engine DJ",
        exportMode: "Engine Prime",
        analysis: "Full analysis including track preview"
      },
      exportSteps: [
        "Connect USB/SSD to Engine Prime",
        "Import and analyze library",
        "Export to Prime 4 via USB",
        "Or use built-in hard drive bay"
      ],
      proTips: [
        { text: "Built-in 2.5-inch HDD bay - huge library capacity", badge: "essential" },
        { text: "4-deck playback on standalone unit", badge: "pro" },
        { text: "Independent zone output for separate room", badge: "pro" }
      ],
      knownIssues: [
        { text: "Large and heavy (9.5kg) - fixed installation preferred", severity: "info" },
        { text: "No CDJ-style physical jogs - touch-based", severity: "info" }
      ],
      compatibleWith: ["Engine DJ", "SC6000"],
      specifications: {
        playableFormats: ["MP3", "AAC", "WAV", "FLAC", "AIFF", "OGG"],
        display: "10.1-inch touch screen",
        tempoRange: "-50% to +50%",
        jogSize: "N/A (touch/platter)"
      }
    },

    {
      id: "prime-go",
      name: "Prime GO",
      brand: "Denon DJ",
      brandSlug: "denon",
      type: "all-in-one",
      typeLabel: "Portable System",
      releaseYear: 2020,
      image: "prime-go",
      usb: {
        format: "exFAT / FAT32",
        maxPartition: "No limit",
        maxFiles: 50000,
        recommendedDrives: [
          "SanDisk Extreme Pro 32GB",
          "Samsung T5 (powered)"
        ],
        tips: "Portable but capable. USB-C for charging during use recommended."
      },
      software: {
        name: "Engine Prime",
        version: "1.x",
        versionWarning: null,
        downloadUrl: "https://enginedj.com/download/",
        downloadNote: "Download Engine DJ",
        exportMode: "Engine Prime",
        analysis: "Full analysis in Engine Prime"
      },
      exportSteps: [
        "Export via Engine Prime to USB",
        "Connect to Prime GO",
        "Battery life: up to 2.5 hours"
      ],
      proTips: [
        { text: "Fully standalone - no laptop required", badge: "essential" },
        { text: "Built-in battery - truly portable", badge: "pro" },
        { text: "WiFi for streaming from Dropbox/Beatport", badge: "pro" }
      ],
      knownIssues: [
        { text: "Smaller screen than Prime 4", severity: "info" },
        { text: "Only 2 decks despite screen space", severity: "info" }
      ],
      compatibleWith: ["Engine DJ"],
      specifications: {
        playableFormats: ["MP3", "AAC", "WAV", "FLAC", "AIFF"],
        display: "7-inch HD touch screen",
        tempoRange: "-50% to +50%",
        jogSize: "141mm"
      }
    },

    // ==================== TECHNICS TURNTABLES ====================
    {
      id: "sl-1200mk7",
      name: "SL-1200MK7",
      brand: "Technics",
      brandSlug: "technics",
      type: "turntable",
      typeLabel: "Turntable",
      releaseYear: 2019,
      image: "sl-1200mk7",
      usb: {
        format: null,
        maxPartition: null,
        maxFiles: null,
        recommendedDrives: null,
        tips: "Pure analog turntable - NO USB export capability. Use with DVS or computer."
      },
      software: {
        name: null,
        version: null,
        versionWarning: "No USB export - this is an analog turntable",
        exportMode: "DVS (Digital Vinyl System) required for digital files",
        analysis: "Analyze tracks in your DJ software before playing"
      },
      exportSteps: [
        "This turntable does NOT support USB export",
        "Use with DVS (Serato, Traktor, rekordbox) for digital tracks",
        "Or play vinyl records only"
      ],
      proTips: [
        { text: "Best-in-class analog performance", badge: "essential" },
        { text: "Requires DVS setup for digital music", badge: "warning" },
        { text: "Excellent pitch stability for beatmatching practice", badge: "pro" },
        { text: "Reversible pitch fader - 50/33/45 RPM", badge: "tip" }
      ],
      knownIssues: [
        { text: "NO digital music playback without DVS", severity: "warning" },
        { text: "No BPM/key detection - analog only", severity: "info" },
        { text: "Need separate sound card for laptop connection", severity: "info" }
      ],
      compatibleWith: ["DVS systems (Serato, Traktor)", "MIXERS"],
      specifications: {
        playableFormats: ["Vinyl only"],
        drive: "Direct drive",
        torque: "0.18 N·m",
        pitchRange: "±8%/±16%/±50%"
      }
    },

    {
      id: "sl-1200gr",
      name: "SL-1200GR",
      brand: "Technics",
      brandSlug: "technics",
      type: "turntable",
      typeLabel: "Turntable",
      releaseYear: 2016,
      image: "sl-1200gr",
      usb: {
        format: null,
        maxPartition: null,
        maxFiles: null,
        recommendedDrives: null,
        tips: "Analog turntable - no USB. Use with DVS system."
      },
      software: {
        name: null,
        version: null,
        versionWarning: "Analog turntable - no digital export",
        exportMode: "Requires DVS",
        analysis: "Analyze in DJ software"
      },
      exportSteps: [
        "Not applicable - analog turntable",
        "Use DVS or vinyl only"
      ],
      proTips: [
        { text: "More affordable than MK7", badge: "tip" },
        { text: "Still excellent build quality", badge: "pro" }
      ],
      knownIssues: [
        { text: "No USB/digital without DVS", severity: "warning" }
      ],
      compatibleWith: ["DVS systems"],
      specifications: {
        playableFormats: ["Vinyl only"],
        drive: "Direct drive",
        pitchRange: "±8%/±16%/±50%"
      }
    },

    // ==================== RELOOP TURNTABLES ====================
    {
      id: "rp-7000mk2",
      name: "RP-7000 MK2",
      brand: "Reloop",
      brandSlug: "reloop",
      type: "turntable",
      typeLabel: "Turntable",
      releaseYear: 2020,
      image: "rp-7000mk2",
      usb: {
        format: null,
        maxPartition: null,
        maxFiles: null,
        recommendedDrives: null,
        tips: "Analog turntable - pair with DVS for digital playback."
      },
      software: {
        name: "DVS compatible",
        version: null,
        versionWarning: "No standalone USB - requires DVS",
        exportMode: "Use with Serato, Traktor, or Engine DJ",
        analysis: "Analyze in DJ software"
      },
      exportSteps: [
        "No direct export",
        "Use DVS control vinyl with DJ software"
      ],
      proTips: [
        { text: "Strong torque - great for scratch DJs", badge: "pro" },
        { text: "Built-in Phono preamp", badge: "tip" },
        { text: "More affordable than Technics", badge: "tip" }
      ],
      knownIssues: [
        { text: "Need DVS for digital music", severity: "warning" }
      ],
      compatibleWith: ["Serato DJ Pro", "Traktor Pro 3", "DVS"],
      specifications: {
        playableFormats: ["Vinyl only"],
        drive: "Direct drive",
        pitchRange: "±8%/±16%/±50%/±60%"
      }
    },

    // ==================== PIONEER PL ====================
    {
      id: "plx-1000",
      name: "PLX-1000",
      brand: "Pioneer",
      brandSlug: "pioneer",
      type: "turntable",
      typeLabel: "Turntable",
      releaseYear: 2014,
      image: "plx-1000",
      usb: {
        format: null,
        maxPartition: null,
        maxFiles: null,
        recommendedDrives: null,
        tips: "Professional analog turntable - no USB. Use with DVS."
      },
      software: {
        name: "DVS",
        version: null,
        versionWarning: "Analog - no direct USB export",
        exportMode: "Requires DVS system",
        analysis: "Analyze in software"
      },
      exportSteps: [
        "Use with DVS (Serato, Traktor)",
        "Play digital tracks via control vinyl"
      ],
      proTips: [
        { text: "Club-standard build quality", badge: "essential" },
        { text: "Compatible with all club mixers", badge: "pro" },
        { text: "CDJ-style aesthetics match club setup", badge: "tip" }
      ],
      knownIssues: [
        { text: "No digital playback without DVS", severity: "warning" }
      ],
      compatibleWith: ["Serato", "Traktor", "Any mixer"],
      specifications: {
        playableFormats: ["Vinyl only"],
        drive: "Direct drive",
        pitchRange: "±8%/±16%/±50%"
      }
    },

    // ==================== NATIVE INSTRUMENTS ====================
    {
      id: "traktor-s4mk3",
      name: "Traktor S4 MK3",
      brand: "Native Instruments",
      brandSlug: "ni",
      type: "controller",
      typeLabel: "Controller",
      releaseYear: 2018,
      image: "traktor-s4mk3",
      usb: {
        format: null,
        maxPartition: null,
        maxFiles: null,
        recommendedDrives: null,
        tips: "Not a media player - uses laptop + Traktor Pro software. Can export playlists for external drives."
      },
      software: {
        name: "Traktor Pro 3",
        version: "3.x",
        versionWarning: null,
        downloadUrl: "https://www.native-instruments.com/traktor",
        downloadNote: "Download Traktor Pro 3",
        exportMode: "Not applicable - laptop-based",
        analysis: "Full analysis in Traktor Pro"
      },
      exportSteps: [
        "Install Traktor Pro 3 on laptop",
        "Import music to Traktor library",
        "Analyze tracks for BPM/grid",
        "Use with S4 MK3 controller",
        "Export playlists to USB for backup only"
      ],
      proTips: [
        { text: "Haptic Drive jog wheels - unique feel", badge: "pro" },
        { text: "Full integration with all Traktor features", badge: "essential" },
        { text: "Can use as stand-alone mixer", badge: "tip" }
      ],
      knownIssues: [
        { text: "Requires laptop at all times", severity: "warning" },
        { text: "Not compatible with rekordbox or Engine libraries", severity: "info" }
      ],
      compatibleWith: ["Traktor Pro 3"],
      specifications: {
        playableFormats: ["MP3", "AAC", "WAV", "FLAC", "AIFF", "OGG"],
        display: "1.6-inch color displays x2",
        jogSize: "Haptic Drive"
      }
    },

    // ==================== RANE ====================
    {
      id: "rane-one",
      name: "Rane One",
      brand: "Rane",
      brandSlug: "rane",
      type: "controller",
      typeLabel: "Controller",
      releaseYear: 2021,
      image: "rane-one",
      usb: {
        format: null,
        maxPartition: null,
        maxFiles: null,
        recommendedDrives: null,
        tips: "Not a standalone - uses laptop with Serato DJ Pro. Can export to USB for back."
      },
      software: {
        name: "Serato DJ Pro",
        version: "Latest",
        versionWarning: "Requires Serato DJ Pro (paid subscription)",
        downloadUrl: "https://serato.com/dj/pro",
        downloadNote: "Download Serato DJ Pro",
        exportMode: "Not applicable - laptop-based",
        analysis: "Analyze in Serato"
      },
      exportSteps: [
        "Use with Serato DJ Pro",
        "Export track lists for reference only"
      ],
      proTips: [
        { text: "Motorized crossfader included", badge: "pro" },
        { text: "Excellent analog mixer feel", badge: "pro" },
        { text: "Built-in 22-step sequencer", badge: "pro" }
      ],
      knownIssues: [
        { text: "Requires laptop + Serato subscription", severity: "warning" },
        { text: "No standalone mode", severity: "warning" }
      ],
      compatibleWith: ["Serato DJ Pro"],
      specifications: {
        playableFormats: ["MP3", "AAC", "WAV", "FLAC", "AIFF"],
        display: "4.3-inch motor",
        jogSize: "12-inch platter"
      }
    },

    {
      id: "seventy",
      name: "Seventy",
      brand: "Rane",
      brandSlug: "rane",
      type: "controller",
      typeLabel: "Controller",
      releaseYear: 2017,
      image: "seventy",
      usb: {
        format: null,
        maxPartition: null,
        maxFiles: null,
        recommendedDrives: null,
        tips: "Battle-style controller for Serato DJ Pro."
      },
      software: {
        name: "Serato DJ Pro",
        version: "Latest",
        versionWarning: "Requires Serato DJ Pro",
        downloadUrl: "https://serato.com/dj/pro",
        downloadNote: "Download Serato DJ Pro",
        exportMode: "Laptop-based",
        analysis: "Serato analyzes on load"
      },
      exportSteps: [
        "Use with Serato DJ Pro",
        "No USB export - full laptop workflow"
      ],
      proTips: [
        { text: "Legendary Rane build quality", badge: "essential" },
        { text: "Magvel faders", badge: "pro" }
      ],
      knownIssues: [
        { text: "Requires laptop + Serato", severity: "warning" }
      ],
      compatibleWith: ["Serato DJ Pro"],
      specifications: {
        playableFormats: ["MP3", "AAC", "WAV", "FLAC", "AIFF"],
        display: "OLED displays"
      }
    },

    // ==================== NUMARK ====================
    {
      id: "mixstreampro",
      name: "Mixstream Pro",
      brand: "Numark",
      brandSlug: "numark",
      type: "all-in-one",
      typeLabel: "All-in-One System",
      releaseYear: 2020,
      image: "mixstreampro",
      usb: {
        format: "exFAT / FAT32",
        maxPartition: "128GB+",
        maxFiles: 10000,
        recommendedDrives: [
          "SanDisk Extreme Pro 32GB",
          "Samsung T5"
        ],
        tips: "Engine DJ operating system - standalone without laptop."
      },
      software: {
        name: "Engine DJ",
        version: "Latest (free)",
        versionWarning: null,
        downloadUrl: "https://enginedj.com/download/",
        downloadNote: "Download Engine DJ",
        exportMode: "Engine Prime Export",
        analysis: "Built-in analysis"
      },
      exportSteps: [
        "Use Engine Prime to export to USB",
        "Insert USB into Mixstream Pro",
        "Or use built-in WiFi streaming"
      ],
      proTips: [
        { text: "Built-in WiFi - stream from Beatport/ SoundCloud", badge: "essential" },
        { text: "Fully standalone - no laptop needed", badge: "pro" },
        { text: "Touch strip for effects", badge: "tip" }
      ],
      knownIssues: [
        { text: "Budget build quality compared to Denon/Pioneer", severity: "info" }
      ],
      compatibleWith: ["Engine DJ"],
      specifications: {
        playableFormats: ["MP3", "AAC", "WAV", "FLAC", "AIFF"],
        display: "7-inch touch screen",
        tempoRange: "-50% to +50%"
      }
    }
  ],

  // Helper functions
  getById(id) {
    return this.devices.find(d => d.id === id);
  },

  getByBrand(brand) {
    return this.devices.filter(d => d.brandSlug === brand.toLowerCase());
  },

  getByType(type) {
    return this.devices.filter(d => d.type === type);
  },

  search(query) {
    const q = query.toLowerCase();
    return this.devices.filter(d => 
      d.name.toLowerCase().includes(q) ||
      d.brand.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q)
    );
  },

  getBrands() {
    return [...new Set(this.devices.map(d => d.brand))];
  },

  getTypes() {
    return [...new Set(this.devices.map(d => d.type))];
  },

  getUSBEnabled() {
    return this.devices.filter(d => d.usb.format !== null);
  },

  getNoUSB() {
    return this.devices.filter(d => d.usb.format === null);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HardwareDB;
}
