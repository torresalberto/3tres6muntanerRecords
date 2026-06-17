// ======== 3D BRAIN INITIALIZER (Swup-compatible) ========
// Wrapped in a function so it can be re-invoked after a Swup
// navigation. Stores rafIds and listeners for safe teardown.
window.Muntaner336 = window.Muntaner336 || {};
window.Muntaner336._brain = window.Muntaner336._brain || {};
window.Muntaner336.init3DBrain = function () {
  var brain = { rafIds: [], listeners: [] };
  window.Muntaner336._brain = brain;

  // ======== DATA ========
  const GENRE_COLORS = {
    House: '#ff4d00',
    'Deep House': '#ff8c00',
    'Acid House': '#ff6a00',
    'Soulful House': '#ff9100',
    'Melodic House': '#ffab00',
    'Tech House': '#e040fb',
    Techno: '#00bcd4',
    'Minimal Techno': '#00e5ff',
    'Detroit Techno': '#37474f',
    'Hypnotic Techno': '#00acc1',
    'Dub Techno': '#4dd0e1',
    Minimal: '#7c4dff',
    'UK Bass': '#00c864',
    Disco: '#ff6a2a',
    Balearic: '#ff8c42',
    'French Touch': '#ff5252',
    Experimental: '#607d8b',
    Jazz: '#78909c',
    Ambient: '#90a4ae',
    Funk: '#ffca28',
    Breaks: '#ab47bc',
    Garage: '#26a69a',
    Trance: '#42a5f5',
    Electro: '#66bb6a',
    'Classic House': '#ff7043',
    'Chicago House': '#ff8a65',
    'Latin House': '#ffab91',
    Fashion: '#f06292',
    'New Age': '#81d4fa',
    'Live PA': '#a5d6a7',
    'Hard Dance': '#d32f2f',
    IDM: '#8e24aa',
    Hardgroove: '#5c6bc0',
    Unknown: '#555555',
  };
  function getGenreColor(g) {
    return GENRE_COLORS[g] || GENRE_COLORS['Unknown'];
  }

  const DJ_DATA = [
    { id: 'chaos-in-the-cbd', name: 'Chaos In The CBD', genre: 'Deep House' },
    { id: 'palms-trax', name: 'Palms Trax', genre: 'House' },
    { id: 'laurent-garnier', name: 'Laurent Garnier', genre: 'House' },
    { id: 'frankie-knuckles', name: 'Frankie Knuckles', genre: 'House' },
    { id: 'floating-points', name: 'Floating Points', genre: 'House' },
    { id: 'richie-hawtin', name: 'Richie Hawtin', genre: 'Minimal Techno' },
    { id: 'avalon-emerson', name: 'Avalon Emerson', genre: 'House' },
    { id: 'dj-pierre', name: 'DJ Pierre', genre: 'Acid House' },
    { id: 'kettama', name: 'KETTAMA', genre: 'House' },
    { id: 'helena-hauff', name: 'Helena Hauff', genre: 'Techno' },
    { id: 'floorplan', name: 'Floorplan', genre: 'House' },
    { id: 'young-marco', name: 'Young Marco', genre: 'House' },
    { id: 'masters-at-work', name: 'Masters At Work', genre: 'House' },
    { id: 'honey-dijon', name: 'Honey Dijon', genre: 'House' },
    { id: 'seth-troxler', name: 'Seth Troxler', genre: 'Tech House' },
    { id: 'alex-do', name: 'Alex.Do', genre: 'Techno' },
    { id: 'etapp-kyle', name: 'Etapp Kyle', genre: 'Techno' },
    { id: 'call-super', name: 'Call Super', genre: 'House' },
    { id: 'kerri-chandler', name: 'Kerri Chandler', genre: 'Deep House' },
    { id: 'ian-pooley', name: 'Ian Pooley', genre: 'Deep House' },
    { id: 'apollonia', name: 'Apollonia', genre: 'Minimal' },
    { id: 'david-august', name: 'David August', genre: 'Melodic House' },
    { id: 'dixon', name: 'Dixon', genre: 'Melodic House' },
    { id: 'ben-ufo', name: 'Ben UFO', genre: 'House' },
    { id: 'moodymann', name: 'Moodymann', genre: 'Deep House' },
    { id: 'maceo-plex', name: 'Maceo Plex', genre: 'Tech House' },
    { id: 'ame', name: '\u00c2me', genre: 'Melodic House' },
    { id: 'four-tet', name: 'Four Tet', genre: 'House' },
    { id: 'carl-craig', name: 'Carl Craig', genre: 'Detroit Techno' },
    { id: 'pangaea', name: 'Pangaea', genre: 'UK Bass' },
    { id: 'kink', name: 'KiNK', genre: 'Techno' },
    { id: 'dj-koze', name: 'DJ Koze', genre: 'House' },
    { id: 'objekt', name: 'Objekt', genre: 'Techno' },
    { id: 'vtss', name: 'VTSS', genre: 'Techno' },
    { id: 'mark-broom', name: 'Mark Broom', genre: 'Techno' },
    { id: 'joy-orbison', name: 'Joy Orbison', genre: 'UK Bass' },
    { id: 'larry-heard', name: 'Larry Heard (Mr. Fingers)', genre: 'Unknown' },
    { id: 'joe-claussell', name: 'Joe Claussell', genre: 'House' },
    { id: 'shonky', name: 'Shonky', genre: 'House' },
    { id: 'tiger-woods', name: 'Tiger & Woods', genre: 'House' },
    { id: 'nicolas-jaar', name: 'Nicolas Jaar', genre: 'Unknown' },
    { id: 'demi-riquismo', name: 'Demi Riquísimo', genre: 'Unknown' },
    { id: 'job-jobse', name: 'Job Jobse', genre: 'House' },
    { id: 'rey-colino', name: 'Rey Colino', genre: 'House' },
    { id: 'cassius', name: 'Cassius', genre: 'House' },
    { id: 'folamour', name: 'Folamour', genre: 'House' },
    { id: 'peggy-gou', name: 'Peggy Gou', genre: 'House' },
    { id: 'blessed-madonna', name: 'The Blessed Madonna', genre: 'House' },
    { id: 'mall-grab', name: 'Mall Grab', genre: 'House' },
    { id: 'hunee', name: 'Hunee', genre: 'Disco' },
    { id: 'carl-cox', name: 'Carl Cox', genre: 'Techno' },
    { id: 'quest', name: 'Quest', genre: 'Deep Dub Techno' },
    { id: 'donato-dozzy', name: 'Donato Dozzy', genre: 'Ambient' },
    { id: 'marcel-dettmann', name: 'Marcel Dettmann', genre: 'Techno' },
    { id: 'stephan-bodzin', name: 'Stephan Bodzin', genre: 'Melodic Techno' },
    { id: 'recondite', name: 'Recondite', genre: 'Deep House' },
  ];

  // ======== MULTI-DJ TRACKS ========
  const MULTI_DJ_TRACKS = [
    {
      track: 'Ame - Asa',
      djs: ['ame', 'dixon'],
      sets: ['ame-br-innervisions-ade-2012', 'dixon-cercle-2024'],
    },
    {
      track: 'Ame & Curses - Shadow Of Love',
      djs: ['ame', 'dixon'],
      sets: ['ame-br-innervisions-ade-2012', 'dixon-cercle-2024'],
    },
    {
      track: 'KiNK - Kazan',
      djs: ['ben-ufo', 'kink'],
      sets: ['ben-ufo-br-sugar-mountain-2025', 'kink-br-moscow-2014'],
    },
    {
      track: 'Pangaea - Router',
      djs: ['ben-ufo', 'pangaea'],
      sets: ['ben-ufo-br-sugar-mountain-2025', 'pangaea-br-dekmantel-2015'],
    },
    {
      track: 'Chez Damier - Can You Feel It (Steve Bug Re-Dub)',
      djs: ['carl-cox', 'seth-troxler'],
      sets: ['carl-cox-ibiza-villa', 'seth-troxler-via-cross-ref'],
    },
    {
      track: 'New Order - Blue Monday (Original 12 Mix)',
      djs: ['carl-cox', 'four-tet', 'laurent-garnier'],
      sets: ['carl-cox-ibiza-villa', 'four-tet-via-cross-ref', 'laurent-garnier-via-cross-ref'],
    },
    {
      track: 'Octave One - Blackwater',
      djs: ['carl-craig', 'seth-troxler', 'carl-cox', 'laurent-garnier'],
      sets: [
        'carl-craig-br-rbma-2013',
        'seth-troxler-br-mexico-2014',
        'carl-cox-via-cross-ref',
        'laurent-garnier-via-cross-ref',
      ],
    },
    {
      track: 'DJ Koze - All The Time',
      djs: ['dj-koze', 'four-tet'],
      sets: ['dj-koze-various', 'four-tet-br-london-2015'],
    },
    {
      track: 'The Bucketheads - The Bomb! (Armand Van Helden Re-Edit)',
      djs: ['honey-dijon', 'seth-troxler'],
      sets: ['honey-dijon-dekmantel-2025', 'seth-troxler-via-cross-ref'],
    },
    {
      track: 'Earth People - Dance',
      djs: ['joe-claussell', 'masters-at-work'],
      sets: ['joe-claussell-br-paris-2014', 'maw-br-london-2014', 'masters-at-work-via-cross-ref'],
    },
    {
      track: 'Peven Everett - Special (Timmy Regisford Remix)',
      djs: ['kerri-chandler', 'honey-dijon'],
      sets: ['kerri-chandler-br-nyc-2022', 'honey-dijon-via-cross-ref'],
    },
    {
      track: 'Marshall Jefferson - Move Your Body',
      djs: ['masters-at-work', 'moodymann'],
      sets: ['maw-br-london-2014', 'masters-at-work-via-cross-ref', 'moodymann-via-cross-ref'],
    },
    {
      track: 'Kings Of Tomorrow - Finally',
      djs: ['seth-troxler', 'honey-dijon'],
      sets: ['seth-troxler-br-mexico-2014', 'honey-dijon-via-cross-ref'],
    },
    {
      track: 'Donato Dozzy - Gol',
      djs: ['donato-dozzy', 'quest', 'etapp-kyle'],
      sets: ['donato-dozzy-br-rome', 'quest-mixmag-lab-rome'],
    },
    {
      track: 'Recondite - Glim',
      djs: ['recondite', 'quest', 'donato-dozzy', 'stephan-bodzin'],
      sets: [
        'recondite-cercle-bernay',
        'quest-mixmag-lab-rome',
        'stephan-bodzin-cercle-piz-gloria',
      ],
    },
    {
      track: 'Recondite - Drgn',
      djs: ['recondite', 'quest', 'stephan-bodzin'],
      sets: [
        'recondite-cercle-bernay',
        'quest-mixmag-lab-rome',
        'quest-section-2026',
        'stephan-bodzin-cercle-piz-gloria',
      ],
    },
    {
      track: 'Stephan Bodzin - Lx (Marc Romboy Remix)',
      djs: ['stephan-bodzin', 'recondite', 'quest'],
      sets: ['stephan-bodzin-cercle-piz-gloria', 'recondite-cercle-bernay', 'quest-section-2026'],
    },
    {
      track: 'Boards Of Canada - Split Your Infinities',
      djs: ['quest', 'donato-dozzy', 'etapp-kyle'],
      sets: ['quest-mixmag-lab-rome', 'quest-section-2026', 'donato-dozzy-br-rome'],
    },
    {
      track: 'Andy Stott - Numb',
      djs: ['quest', 'recondite', 'donato-dozzy'],
      sets: [
        'quest-mixmag-lab-rome',
        'quest-section-2026',
        'recondite-cercle-bernay',
        'donato-dozzy-br-rome',
      ],
    },
    {
      track: 'Function - Against The Wall',
      djs: ['quest', 'donato-dozzy', 'marcel-dettmann'],
      sets: ['quest-mixmag-lab-rome', 'donato-dozzy-br-rome', 'marcel-dettmann-br-berlin'],
    },
    {
      track: 'Terrence Dixon - One Bedroom Apartment',
      djs: ['quest', 'donato-dozzy', 'marcel-dettmann'],
      sets: [
        'quest-mixmag-lab-rome',
        'quest-section-2026',
        'donato-dozzy-br-rome',
        'marcel-dettmann-br-berlin',
      ],
    },
    {
      track: 'Marcel Dettmann - Shena (T++ Remix)',
      djs: ['marcel-dettmann', 'etapp-kyle'],
      sets: ['marcel-dettmann-br-berlin'],
    },
    {
      track: 'Shed - Shot Rhythm',
      djs: ['marcel-dettmann', 'quest', 'objekt'],
      sets: ['marcel-dettmann-br-berlin', 'quest-section-2026'],
    },
    {
      track: 'Tale Of Us - Another Earth',
      djs: ['stephan-bodzin', 'recondite', 'quest'],
      sets: ['stephan-bodzin-cercle-piz-gloria', 'recondite-cercle-bernay', 'quest-section-2026'],
    },
  ];

  // ======== AUTO-GENERATE TRACK CONNECTIONS FROM TRACKLISTS ========
  function buildTracklistConnections() {
    if (typeof TRACKLISTS === 'undefined') return [];
    const trackIndex = {}; // normalized key → [{dj_id, set_id, set_title}]

    for (const djId in TRACKLISTS) {
      TRACKLISTS[djId].sets.forEach((set) => {
        set.tracklist.forEach((track) => {
          const key = (track.artist + ' — ' + track.title)
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
          if (!trackIndex[key]) trackIndex[key] = [];
          trackIndex[key].push({
            dj_id: djId,
            set_id: set.id,
            set_title: set.title,
            time: track.time,
            label: track.label,
          });
        });
      });
    }

    const connections = [];
    for (const key in trackIndex) {
      const plays = trackIndex[key];
      const uniqueDJs = [...new Set(plays.map((p) => p.dj_id))];
      if (uniqueDJs.length >= 2) {
        const displayTrack = key
          .replace(/\s*—\s*/g, ' - ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        const sets = plays.map((p) => ({
          id: p.set_id,
          title: p.set_title,
          artist: p.dj_id,
        }));
        connections.push({ track: displayTrack, djs: uniqueDJs, sets });
      }
    }
    return connections;
  }

  const TRACKLIST_CONNECTIONS = buildTracklistConnections();

  // ======== BUILD GRAPH ========
  const djMap = {};
  DJ_DATA.forEach((d) => {
    djMap[d.id] = d;
  });

  const nodes = DJ_DATA.map((d) => ({
    id: d.id,
    name: d.name,
    genre: d.genre,
    color: getGenreColor(d.genre),
    connections: 0, // total (track + artist bridges) — used for stats
    trackConnections: 0, // only direct track overlaps — used for node SIZE
    x3: 0,
    y3: 0,
    z3: 0,
    x2: 0,
    y2: 0,
    z2: 0,
    scale: 1,
  }));

  const links = [];
  const linkSet = new Set();

  function addTrackConnections(trackEntries) {
    trackEntries.forEach((t) => {
      const djs = t.djs;
      for (let i = 0; i < djs.length; i++) {
        for (let j = i + 1; j < djs.length; j++) {
          const a = djs[i],
            b = djs[j];
          const key = [a, b].sort().join('|') + '::' + t.track.toLowerCase();
          if (!linkSet.has(key)) {
            linkSet.add(key);
            const na = nodes.find((n) => n.id === a);
            const nb = nodes.find((n) => n.id === b);
            if (na && nb) {
              links.push({ source: na, target: nb, track: t.track, sets: t.sets });
              na.connections++;
              nb.connections++;
              na.trackConnections++;
              nb.trackConnections++;
            }
          }
        }
      }
    });
  }

  addTrackConnections(MULTI_DJ_TRACKS);
  addTrackConnections(TRACKLIST_CONNECTIONS);

  // ======== SPHERICAL LAYOUT ========
  function fibonacciSphere(n, radius) {
    const pts = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      pts.push({ x: x * radius, y: y * radius, z: z * radius });
    }
    return pts;
  }

  // Place connected DJs closer together using force relaxation
  const radius = 280;
  const positions = fibonacciSphere(nodes.length, radius);

  // Seed initial positions
  nodes.forEach((n, i) => {
    n.x3 = positions[i].x;
    n.y3 = positions[i].y;
    n.z3 = positions[i].z;
  });

  // Relax: connected nodes attract, all nodes repel.
  // No re-projection during relaxation — lets forces find natural
  // equilibrium. Nodes are normalized to sphere surface once at the end.
  for (let iter = 0; iter < 200; iter++) {
    // Attraction — pull connected nodes toward each other
    links.forEach((l) => {
      const dx = l.target.x3 - l.source.x3;
      const dy = l.target.y3 - l.source.y3;
      const dz = l.target.z3 - l.source.z3;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      const force = (0.3 * (dist - radius * 0.4)) / dist;
      const fx = dx * force;
      const fy = dy * force;
      const fz = dz * force;
      l.source.x3 += fx;
      l.source.y3 += fy;
      l.source.z3 += fz;
      l.target.x3 -= fx;
      l.target.y3 -= fy;
      l.target.z3 -= fz;
    });
    // Repulsion — push all nodes apart
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i],
          b = nodes[j];
        const dx = b.x3 - a.x3;
        const dy = b.y3 - a.y3;
        const dz = b.z3 - a.z3;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        const force = -80 / (dist * dist);
        const fx = dx * force;
        const fy = dy * force;
        const fz = dz * force;
        a.x3 += fx;
        a.y3 += fy;
        a.z3 += fz;
        b.x3 -= fx;
        b.y3 -= fy;
        b.z3 -= fz;
      }
    }
  }
  // Normalize to sphere surface once after relaxation settles
  nodes.forEach((n) => {
    const dist = Math.sqrt(n.x3 * n.x3 + n.y3 * n.y3 + n.z3 * n.z3) || 1;
    n.x3 = (n.x3 / dist) * radius;
    n.y3 = (n.y3 / dist) * radius;
    n.z3 = (n.z3 / dist) * radius;
  });

  // ======== 3D PROJECTION ========
  let rotX = 0.4,
    rotY = 0.6;
  let targetRotX = 0.4,
    targetRotY = 0.6;
  let autoRotate = true;
  let dragStart = null;
  let dragStartRot = null;

  function project(x, y, z, w, h) {
    // Rotate around Y
    let x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
    let z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
    // Rotate around X
    let y1 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
    let z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
    // Perspective
    const camDist = 900;
    const scale = camDist / (camDist - z2);
    return {
      x: w / 2 + x1 * scale,
      y: h / 2 + y1 * scale,
      z: z2,
      scale: scale,
    };
  }

  // ======== RENDER ========
  const svg = document.getElementById('sphere-svg');
  const tooltip = document.getElementById('graphTooltip');
  const container = document.getElementById('network-container');
  let w = container.clientWidth;
  let h = container.clientHeight;

  // Create SVG definitions (filters, gradients)
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
<feGaussianBlur stdDeviation="4" result="blur" />
<feMerge>
  <feMergeNode in="blur" />
  <feMergeNode in="SourceGraphic" />
</feMerge>
      </filter>
      <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
<feGaussianBlur stdDeviation="8" result="blur" />
<feMerge>
  <feMergeNode in="blur" />
  <feMergeNode in="blur" />
  <feMergeNode in="SourceGraphic" />
</feMerge>
      </filter>
      <radialGradient id="sphere-bg" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="rgba(255,77,0,0.03)" />
<stop offset="100%" stop-color="transparent" />
      </radialGradient>
    `;
  svg.appendChild(defs);

  // Groups for z-sorting
  const linkGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(linkGroup);
  svg.appendChild(nodeGroup);
  svg.appendChild(labelGroup);

  // Create link elements
  const linkEls = links.map((l) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', 'rgba(0,200,100,0.35)');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-dasharray', '4,3');
    line.style.transition = 'stroke 0.3s, stroke-width 0.3s, opacity 0.3s';
    line.dataset.track = l.track;
    linkGroup.appendChild(line);
    return { el: line, data: l };
  });

  // Create node elements
  const nodeEls = nodes.map((n) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.style.cursor = 'pointer';
    g.style.transition = 'opacity 0.3s';

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const r = 3 + Math.min(5, n.trackConnections * 0.15);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', n.color);
    circle.setAttribute('stroke', n.trackConnections > 0 ? '#fff' : 'rgba(255,255,255,0.2)');
    circle.setAttribute('stroke-width', n.trackConnections > 0 ? 2 : 1);
    circle.setAttribute('filter', n.trackConnections > 0 ? 'url(#glow)' : '');
    circle.style.transition = 'r 0.3s, stroke-width 0.3s, opacity 0.3s';

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.textContent = n.name;
    label.setAttribute('fill', '#fff');
    label.setAttribute('font-size', n.trackConnections > 0 ? '10px' : '9px');
    label.setAttribute('font-weight', n.trackConnections > 0 ? '600' : '400');
    label.setAttribute('font-family', 'Space Grotesk, sans-serif');
    label.setAttribute('dy', r + 10);
    label.setAttribute('text-anchor', 'middle');
    label.style.pointerEvents = 'none';
    label.style.transition = 'opacity 0.3s';
    label.style.opacity = '0.7';

    g.appendChild(circle);
    nodeGroup.appendChild(g);
    labelGroup.appendChild(label);

    return { g, circle, label, data: n };
  });

  // ======== INTERACTION STATE ========
  let hoveredId = null;
  let selectedId = null;
  let filteredIds = null;

  function getConnectedIds(id) {
    const set = new Set([id]);
    links.forEach((l) => {
      if (l.source.id === id) set.add(l.target.id);
      if (l.target.id === id) set.add(l.source.id);
    });
    return set;
  }

  // ======== HOVER ========
  nodeEls.forEach((ne) => {
    ne.g.addEventListener('mouseenter', (e) => {
      hoveredId = ne.data.id;
      autoRotate = false;
      tooltip.textContent = ne.data.name;
      tooltip.classList.add('visible');
    });
    ne.g.addEventListener('mousemove', (e) => {
      tooltip.style.left = e.clientX + 15 + 'px';
      tooltip.style.top = e.clientY + 15 + 'px';
    });
    ne.g.addEventListener('mouseleave', () => {
      hoveredId = null;
      autoRotate = true;
      tooltip.classList.remove('visible');
    });
  });

  // ======== CLICK / POPUP ========
  const infoPanel = document.getElementById('networkInfo');

  nodeEls.forEach((ne) => {
    ne.g.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedId = ne.data.id;
      autoRotate = false;
      showInfo(ne.data);
    });
  });

  container.addEventListener('click', () => {
    selectedId = null;
    autoRotate = true;
    infoPanel.classList.remove('visible');
  });

  document.getElementById('infoClose').addEventListener('click', () => {
    selectedId = null;
    autoRotate = true;
    infoPanel.classList.remove('visible');
  });

  function showInfo(d) {
    document.getElementById('infoName').textContent = d.name;
    document.getElementById('infoGenre').textContent = d.genre;
    const conns = [];
    links.forEach((l) => {
      if (l.source.id === d.id) conns.push({ other: l.target, track: l.track, sets: l.sets });
      if (l.target.id === d.id) conns.push({ other: l.source, track: l.track, sets: l.sets });
    });
    const tracklistConns = conns.filter((c) => {
      const key = c.track.toLowerCase().replace(/\s+/g, ' ');
      return TRACKLIST_CONNECTIONS.some((t) => t.track.toLowerCase().replace(/\s+/g, ' ') === key);
    });
    const sourceLabel =
      tracklistConns.length > 0 ? `${tracklistConns.length} from tracklists • ` : '';
    document.getElementById('infoSummary').textContent =
      sourceLabel +
      conns.length +
      ' shared track' +
      (conns.length !== 1 ? 's' : '') +
      ' across the library';

    const list = document.getElementById('infoList');
    if (conns.length === 0) {
      list.innerHTML =
        '<div style="color:rgba(255,255,255,0.2);font-size:0.8rem;padding:1rem 0;">No shared tracks yet.</div>';
    } else {
      // Group by track (new design)
      const byTrack = {};
      conns.forEach((c) => {
        const trackKey = c.track.toLowerCase().replace(/\s+/g, ' ');
        if (!byTrack[trackKey]) {
          byTrack[trackKey] = {
            track: c.track,
            artists: new Set(),
            djs: [],
          };
        }
        // Extract artist from track string (format: "Artist - Title" or just "Title")
        const parts = c.track.split(' - ');
        if (parts.length >= 2) byTrack[trackKey].artists.add(parts[0].trim());
        byTrack[trackKey].djs.push({
          dj: c.other,
          sets: c.sets,
        });
      });

      list.innerHTML = Object.values(byTrack)
        .map((t) => {
          const artists = Array.from(t.artists).join(', ') || 'Various';
          const fromTracklist = TRACKLIST_CONNECTIONS.some(
            (tc) =>
              tc.track.toLowerCase().replace(/\s+/g, ' ') ===
              t.track.toLowerCase().replace(/\s+/g, ' ')
          );
          return `
  <div class="info-track-group">
    <div class="info-track-header">
      <div class="info-track-title">${t.track}${fromTracklist ? ' <span class="tracklist-badge">🎵 tracklist</span>' : ''}</div>
      <div class="info-track-artist">by ${artists}</div>
    </div>
    <div class="info-track-djs">
      ${t.djs
        .map(
          (dj) => `
        <div class="info-track-dj">
          <div class="info-dj-name">${dj.dj.name}</div>
          <div class="info-dj-sets">
            ${dj.sets
              .map((s) => {
                const setName = typeof s === 'object' ? s.title : s.replace(/-/g, ' ');
                const setId = typeof s === 'object' ? s.id : s;
                return `<span class="info-set-tag" data-set="${setId}">${setName}</span>`;
              })
              .join('')}
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  </div>
`;
        })
        .join('');
    }
    infoPanel.classList.add('visible');
  }

  // ======== RESET ========
  document.getElementById('resetViewBtn').addEventListener('click', () => {
    rotX = 0.4;
    rotY = 0.6;
    targetRotX = 0.4;
    targetRotY = 0.6;
    hoveredId = null;
    selectedId = null;
    filteredIds = null;
    autoRotate = true;
    infoPanel.classList.remove('visible');

    document.getElementById('statVis').textContent = nodes.length;
  });

  // ======== DRAG TO ROTATE ========
  container.addEventListener('mousedown', (e) => {
    dragStart = { x: e.clientX, y: e.clientY };
    dragStartRot = { x: rotX, y: rotY };
    autoRotate = false;
    container.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragStart) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    targetRotY = dragStartRot.y + dx * 0.005;
    targetRotX = dragStartRot.x - dy * 0.005;
  });
  window.addEventListener('mouseup', () => {
    if (dragStart) {
      dragStart = null;
      container.style.cursor = 'grab';
      if (!selectedId) autoRotate = true;
    }
  });

  // ======== ANIMATION LOOP ========
  // Pre-compute which labels to show by default (top 8 most-connected DJs).
  // All other labels only appear on hover/select/filter — prevents overlap with 56 nodes.
  const topLabelIds = new Set(
    [...nodes]
      .sort((a, b) => b.trackConnections - a.trackConnections)
      .slice(0, 8)
      .map((n) => n.id)
  );

  function animate() {
    // Smooth rotation
    if (autoRotate) {
      targetRotY += 0.0015;
    }
    rotX += (targetRotX - rotX) * 0.08;
    rotY += (targetRotY - rotY) * 0.08;

    // Project all nodes
    nodeEls.forEach((ne) => {
      const n = ne.data;
      const p = project(n.x3, n.y3, n.z3, w, h);
      n.x2 = p.x;
      n.y2 = p.y;
      n.z2 = p.z;
      n.scale = p.scale;
    });

    // Sort nodes by Z for proper overlap
    const sorted = nodeEls.slice().sort((a, b) => a.data.z2 - b.data.z2);

    // Determine active IDs for this frame
    const activeIds = filteredIds || (hoveredId ? getConnectedIds(hoveredId) : null);

    // Update node positions
    sorted.forEach((ne) => {
      const n = ne.data;
      const s = n.scale;
      // Use trackConnections (not connections) so artist bridges don't inflate node size.
      // Cap at r=8 max — the design relies on small uniform dots, not huge bubbles.
      const connCount = n.trackConnections;
      const r = (3 + Math.min(5, connCount * 0.15)) * s;
      const isActive = !activeIds || activeIds.has(n.id);
      const isHovered = n.id === hoveredId;
      const isSelected = n.id === selectedId;

      ne.g.setAttribute('transform', `translate(${n.x2}, ${n.y2}) scale(${s})`);
      ne.circle.setAttribute('r', r / s);
      ne.label.setAttribute('x', n.x2);
      ne.label.setAttribute('y', n.y2);
      ne.label.setAttribute('dy', r + 10 * s);
      ne.label.setAttribute('font-size', (connCount > 0 ? 10 : 9) * s + 'px');

      // Z-occlusion combined with interaction state
      const zOpacity = n.z2 < -50 ? 0.3 : 1;
      const stateOpacity = isActive ? 1 : 0.1;
      ne.g.style.opacity = zOpacity * stateOpacity;
      ne.label.style.opacity =
        zOpacity * (isActive ? (isHovered || isSelected || topLabelIds.has(n.id) ? 1 : 0) : 0);

      if (isHovered || isSelected) {
        ne.circle.setAttribute('r', Math.max(7, 3 + connCount * 0.3));
        ne.circle.setAttribute('filter', 'url(#glow-strong)');
        ne.circle.setAttribute('stroke-width', 3);
      } else {
        ne.circle.setAttribute('r', 3 + Math.min(5, connCount * 0.15));
        ne.circle.setAttribute('filter', connCount > 0 ? 'url(#glow)' : '');
        ne.circle.setAttribute('stroke-width', connCount > 0 ? 2 : 1);
      }
    });

    // Update links
    linkEls.forEach((le) => {
      const l = le.data;
      const s = l.source;
      const t = l.target;

      // Always set coordinates
      le.el.setAttribute('x1', s.x2);
      le.el.setAttribute('y1', s.y2);
      le.el.setAttribute('x2', t.x2);
      le.el.setAttribute('y2', t.y2);

      // Midpoint Z determines if line is "inside" the sphere
      const midZ = (s.z2 + t.z2) / 2;
      const isBehind = midZ < -30;

      if (isBehind) {
        le.el.style.opacity = 0.05;
      } else {
        const isActive = !filteredIds || (filteredIds.has(s.id) && filteredIds.has(t.id));
        const isHovered = hoveredId && (s.id === hoveredId || t.id === hoveredId);
        le.el.style.opacity = isActive || isHovered ? 1 : 0.1;
        if (isActive || isHovered) {
          const phase = (Date.now() / 20) % 20;
          le.el.setAttribute('stroke-dashoffset', -phase);
        }
      }
    });

    requestAnimationFrame(animate);
  }

  // ======== RESIZE ========
  window.addEventListener('resize', () => {
    w = container.clientWidth;
    h = container.clientHeight;
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  });
  svg.setAttribute('width', w);
  svg.setAttribute('height', h);
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

  // ======== STATS ========
  document.getElementById('statDJs').textContent = nodes.length;
  document.getElementById('statConns').textContent = links.length;
  document.getElementById('statVis').textContent = nodes.length;

  // Add tracklist source indicator to stats
  const tracklistCount = TRACKLIST_CONNECTIONS.length;
  if (tracklistCount > 0) {
    const statsEl = document.getElementById('networkStats');
    const tracklistSpan = document.createElement('span');
    tracklistSpan.innerHTML = `<strong style="color:#ff4d00;">${tracklistCount}</strong> from tracklists`;
    statsEl.appendChild(tracklistSpan);
  }

  // Start
  animate();

  // ======== ASYNC ENRICHMENT FROM CROSS-REFERENCES ========
  (async function enrichBrain() {
    try {
      const res = await fetch('data/djs/cross-references.json');
      if (!res.ok) return;
      const data = await res.json();
      if (!data.shared_artists || data.shared_artists.length === 0) return;

      const artistLinkSet = new Set();
      let artistLinksAdded = 0;

      for (const sa of data.shared_artists) {
        const djs = sa.djs;
        for (let i = 0; i < djs.length; i++) {
          for (let j = i + 1; j < djs.length; j++) {
            const a = djs[i],
              b = djs[j];
            const trackKey = sa.artist.toLowerCase();
            const key = [a, b].sort().join('|') + '::artist::' + trackKey;
            // Skip if already connected by exact track
            if (linkSet.has(key)) continue;
            if (artistLinkSet.has(key)) continue;
            artistLinkSet.add(key);

            const na = nodes.find((n) => n.id === a);
            const nb = nodes.find((n) => n.id === b);
            if (na && nb) {
              const linkObj = {
                source: na,
                target: nb,
                track: sa.artist + ' (shared artist)',
                sets: sa.sets.slice(0, 4),
                type: 'artist',
              };
              links.push(linkObj);

              // Create SVG element with purple color
              const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
              line.setAttribute('stroke', 'rgba(124,77,255,0.35)');
              line.setAttribute('stroke-width', '1');
              line.setAttribute('stroke-dasharray', '2,4');
              line.style.transition = 'stroke 0.3s, stroke-width 0.3s, opacity 0.3s';
              line.dataset.track = linkObj.track;
              linkGroup.appendChild(line);
              linkEls.push({ el: line, data: linkObj });

              // Artist bridges are a secondary signal — do NOT inflate node size
              na.connections++;
              nb.connections++;
              artistLinksAdded++;
            }
          }
        }
      }

      // Update stats
      document.getElementById('statConns').textContent = links.length;
      if (artistLinksAdded > 0) {
        const statsEl = document.getElementById('networkStats');
        // Avoid duplicate append on hot reload
        if (!document.getElementById('artistBridgeStat')) {
          const artistSpan = document.createElement('span');
          artistSpan.id = 'artistBridgeStat';
          artistSpan.innerHTML = `<strong style="color:#7c4dff;">${artistLinksAdded}</strong> artist bridges`;
          statsEl.appendChild(artistSpan);
        }
      }

      console.log(
        `🧠 Brain enriched: +${artistLinksAdded} artist bridges, +${data.total_shared_tracks} shared tracks, +${data.total_shared_artists} shared artists from cross-references`
      );
    } catch (e) {
      console.warn('Brain enrichment failed:', e);
    }
  })();

  // Register Swup hook to re-render on every navigation back.
  // Use a deferred registration so we don't race swup-init.js (which is `defer`-loaded).
  var registerSwupHook = function () {
    if (window.Muntaner336 && typeof window.Muntaner336.onPageView === 'function') {
      window.Muntaner336.onPageView(function () {
        // Check for the SVG that the brain renders into.
        // (Was previously 'networkSvg'/'brainSvg' — both wrong. The actual id is 'sphere-svg'.)
        if (document.getElementById('sphere-svg')) {
          try {
            window.Muntaner336.init3DBrain();
          } catch (e) {
            console.error('Brain re-init failed', e);
          }
        }
      });
      return true;
    }
    return false;
  };
  if (!registerSwupHook()) {
    // swup-init.js hasn't loaded yet — poll until it does (max 2s).
    var tries = 0;
    var poll = setInterval(function () {
      if (registerSwupHook() || ++tries > 40) clearInterval(poll);
    }, 50);
  }
};
// Initial run
window.Muntaner336.init3DBrain();
