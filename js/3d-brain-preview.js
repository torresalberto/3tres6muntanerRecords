// ======== NEURAL — 3D sphere + 2D "Hilo" engine ========
// Feeds from build-generated DJ data (data/djs/*.json). Never hand-edit
// generated data; run `node scripts/build-dj-data.js` instead.
// Theme-aware: body[data-brain-theme="redesign"] switches to the editorial
// "El Hilo" variant (mono top-labels, orange track links, purple artist
// bridges, redesigned panel/welcome, 2D plano mode).
(function () {
  'use strict';

  // ─── Theme ────────────────────────────────────────────────────────────────
  var THEME =
    document.body && document.body.dataset.brainTheme === 'redesign' ? 'redesign' : 'original';
  var SVGNS = 'http://www.w3.org/2000/svg';

  var GENRE_COLORS = {
    House: '#ff4d00',
    'Deep House': '#ff8c00',
    'Acid House': '#ff6a00',
    Acid: '#ff6a00',
    'Soulful House': '#ff9100',
    'Melodic House': '#ffab00',
    'Tech House': '#e040fb',
    Techno: '#ff4d00',
    'Minimal Techno': '#ff9100',
    'Detroit Techno': '#ffab91',
    'Hypnotic Techno': '#ff7043',
    'Dub Techno': '#ffb74d',
    Minimal: '#7c4dff',
    'UK Bass': '#ffca28',
    Disco: '#ff6a2a',
    'Nu Disco': '#ff8c42',
    Balearic: '#ff8c42',
    'French Touch': '#ff5252',
    Experimental: '#90a4ae',
    Jazz: '#ffcc80',
    Ambient: '#b0bec5',
    Funk: '#ffca28',
    Breaks: '#ff7043',
    Garage: '#ff9100',
    Trance: '#ff9100',
    Electro: '#ffab91',
    'Classic House': '#ff7043',
    'Chicago House': '#ff8a65',
    'Latin House': '#ffab91',
    Fashion: '#f06292',
    'New Age': '#ffe082',
    'Live PA': '#ffd54f',
    'Hard Dance': '#ff5252',
    IDM: '#90a4ae',
    Hardgroove: '#ff7043',
    'Melodic Techno': '#ffab00',
    Unknown: '#555555',
  };
  function genreColor(g) {
    return GENRE_COLORS[g] || GENRE_COLORS.Unknown;
  }

  // ─── State ────────────────────────────────────────────────────────────────
  var nodes = [];
  var links = [];
  var nodeMap = {};
  var crossRef = null;
  var statsData = null;

  var svg = null;
  var container = null;
  var glowGroup, wireGroup, linkGroup, nodeGroup, labelGroup;
  var rimEllipse, glowCircle;
  var latLines = [];
  var nodeEls = [];
  var linkEls = [];
  var labelEls = [];
  var tooltipEl = null;

  var w = 0;
  var h = 0;
  var RADIUS = 220;
  var rotX = 0.35;
  var rotY = 0;
  var targetRotX = 0.35;
  var targetRotY = 0;
  var autoRotate = true;
  var isDragging = false;
  var dragStartX = 0;
  var dragStartY = 0;
  var dragStartRotX = 0;
  var dragStartRotY = 0;

  var hoveredNode = null;
  var selectedNode = null;
  var activeGenre = null;
  var searchTerm = '';
  var searchId = null;
  var topLabelIds = null;

  function COS(a) {
    return Math.cos(a);
  }
  function SIN(a) {
    return Math.sin(a);
  }
  function el(id) {
    return document.getElementById(id);
  }

  // ─── Data loading ─────────────────────────────────────────────────────────

  async function loadData() {
    var indexRes = await fetch('data/djs/index.json');
    var indexData = await indexRes.json();

    var crossRes = await fetch('data/djs/cross-references.json');
    crossRef = await crossRes.json();

    try {
      var statsRes = await fetch('data/djs/stats.json');
      statsData = await statsRes.json();
    } catch (e) {
      statsData = null;
    }

    var djsList = indexData.djs || [];
    nodes = [];
    nodeMap = {};

    djsList.forEach(function (dj) {
      var node = {
        id: dj.id,
        name: dj.name,
        genre: dj.genres && dj.genres.length ? dj.genres[0] : 'Unknown',
        genres: dj.genres || [],
        origin: dj.origin || '',
        image: dj.image || '',
        sets: dj.sets || [],
        stats: dj.stats || {},
        connections: 0,
        trackConnections: 0,
        x3: 0,
        y3: 0,
        z3: 0,
        x2: 0,
        y2: 0,
        z2: 0,
        scale: 1,
        color: genreColor(dj.genres && dj.genres.length ? dj.genres[0] : 'Unknown'),
      };
      nodes.push(node);
      nodeMap[dj.id] = node;
    });

    // Links from shared tracks + shared artist bridges
    var linkSet = {};
    var trackConnCount = 0;
    var artistConnCount = 0;

    (crossRef.shared_tracks || []).forEach(function (st) {
      var djs = st.djs || [];
      for (var i = 0; i < djs.length; i++) {
        for (var j = i + 1; j < djs.length; j++) {
          var key = djs[i] < djs[j] ? djs[i] + '--' + djs[j] : djs[j] + '--' + djs[i];
          if (!linkSet[key]) {
            linkSet[key] = { source: djs[i], target: djs[j], type: 'track', sets: st.sets || [] };
            trackConnCount++;
          }
        }
      }
    });

    (crossRef.shared_artists || []).forEach(function (sa) {
      var djs = sa.djs || [];
      for (var i = 0; i < djs.length; i++) {
        for (var j = i + 1; j < djs.length; j++) {
          var key = djs[i] < djs[j] ? djs[i] + '--' + djs[j] : djs[j] + '--' + djs[i];
          if (!linkSet[key]) {
            linkSet[key] = { source: djs[i], target: djs[j], type: 'artist', sets: sa.sets || [] };
            artistConnCount++;
          }
        }
      }
    });

    links = [];
    Object.keys(linkSet).forEach(function (key) {
      var l = linkSet[key];
      if (nodeMap[l.source] && nodeMap[l.target]) {
        links.push(l);
        nodeMap[l.source].connections++;
        nodeMap[l.target].connections++;
        if (l.type === 'track') {
          nodeMap[l.source].trackConnections++;
          nodeMap[l.target].trackConnections++;
        }
      }
    });

    // Super connectors (top labels) — compute from real connection counts
    topLabelIds = new Set(
      nodes
        .slice()
        .sort(function (a, b) {
          return b.connections - a.connections;
        })
        .slice(0, 8)
        .map(function (n) {
          return n.id;
        })
    );

    return { trackLinkCount: trackConnCount, artistLinkCount: artistConnCount };
  }

  // ─── Stats helpers ─────────────────────────────────────────────────────────

  function aggregates() {
    return (statsData && statsData.aggregates) || {};
  }
  function genreCandidates() {
    var list = (statsData && statsData.genres) || [];
    return list.slice(0, 10);
  }

  // ─── Sphere layout ─────────────────────────────────────────────────────────

  function fibonacciSphere() {
    var n = nodes.length;
    var goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = 1 - (i / (n - 1)) * 2;
      var radiusAtY = Math.sqrt(1 - y * y);
      var theta = goldenAngle * i;
      nodes[i].x3 = COS(theta) * radiusAtY * RADIUS;
      nodes[i].y3 = y * RADIUS;
      nodes[i].z3 = SIN(theta) * radiusAtY * RADIUS;
    }
  }

  function relaxPositions() {
    fibonacciSphere();
    var iterations = 200;
    var attraction = 0.005;
    var repulsion = 800;

    for (var iter = 0; iter < iterations; iter++) {
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = nodes[i].x3 - nodes[j].x3;
          var dy = nodes[i].y3 - nodes[j].y3;
          var dz = nodes[i].z3 - nodes[j].z3;
          var dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
          var force = repulsion / (dist * dist);
          var fx = (dx / dist) * force;
          var fy = (dy / dist) * force;
          var fz = (dz / dist) * force;
          nodes[i].x3 += fx;
          nodes[i].y3 += fy;
          nodes[i].z3 += fz;
          nodes[j].x3 -= fx;
          nodes[j].y3 -= fy;
          nodes[j].z3 -= fz;
        }
      }
      for (var k = 0; k < links.length; k++) {
        var l = links[k];
        var src = nodeMap[l.source];
        var tgt = nodeMap[l.target];
        if (!src || !tgt) continue;
        var dx2 = tgt.x3 - src.x3;
        var dy2 = tgt.y3 - src.y3;
        var dz2 = tgt.z3 - src.z3;
        var dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2 + dz2 * dz2) || 1;
        var pull = (dist2 - RADIUS * 0.8) * attraction;
        src.x3 += (dx2 / dist2) * pull;
        src.y3 += (dy2 / dist2) * pull;
        src.z3 += (dz2 / dist2) * pull;
        tgt.x3 -= (dx2 / dist2) * pull;
        tgt.y3 -= (dy2 / dist2) * pull;
        tgt.z3 -= (dz2 / dist2) * pull;
      }
      for (var m = 0; m < nodes.length; m++) {
        var n = nodes[m];
        var len = Math.sqrt(n.x3 * n.x3 + n.y3 * n.y3 + n.z3 * n.z3) || 1;
        n.x3 = (n.x3 / len) * RADIUS;
        n.y3 = (n.y3 / len) * RADIUS;
        n.z3 = (n.z3 / len) * RADIUS;
      }
    }
  }

  // ─── 3D projection ─────────────────────────────────────────────────────────

  function project(x, y, z) {
    var x1 = x * COS(rotY) - z * SIN(rotY);
    var z1 = x * SIN(rotY) + z * COS(rotY);
    var y1 = y * COS(rotX) - z1 * SIN(rotX);
    var z2 = y * SIN(rotX) + z1 * COS(rotX);
    var camDist = 900;
    var scale = camDist / (camDist - z2);
    return { x: w / 2 + x1 * scale, y: h / 2 + y1 * scale, z: z2, scale: scale };
  }

  // ─── SVG creation ──────────────────────────────────────────────────────────

  function make(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function (k) {
      e.setAttribute(k, attrs[k]);
    });
    return e;
  }

  function createSVGElements() {
    svg.innerHTML = '';
    nodeEls = [];
    linkEls = [];
    labelEls = [];
    latLines = [];

    var defs = make('defs');
    var glow = make('filter', { id: 'glow', x: '-50%', y: '-50%', width: '200%', height: '200%' });
    glow.appendChild(make('feGaussianBlur', { stdDeviation: '4', result: 'blur' }));
    var m1 = make('feMerge');
    m1.appendChild(make('feMergeNode', { in: 'blur' }));
    m1.appendChild(make('feMergeNode', { in: 'SourceGraphic' }));
    glow.appendChild(m1);

    var glowStrong = make('filter', {
      id: 'glow-strong',
      x: '-50%',
      y: '-50%',
      width: '200%',
      height: '200%',
    });
    glowStrong.appendChild(make('feGaussianBlur', { stdDeviation: '8', result: 'blur' }));
    var m2 = make('feMerge');
    m2.appendChild(make('feMergeNode', { in: 'blur' }));
    m2.appendChild(make('feMergeNode', { in: 'blur' }));
    m2.appendChild(make('feMergeNode', { in: 'SourceGraphic' }));
    glowStrong.appendChild(m2);

    var grad = make('radialGradient', { id: 'sphere-bg', cx: '50%', cy: '50%', r: '50%' });
    grad.appendChild(
      make('stop', { offset: '0%', 'stop-color': '#ff4d00', 'stop-opacity': '0.08' })
    );
    grad.appendChild(
      make('stop', { offset: '100%', 'stop-color': '#ff4d00', 'stop-opacity': '0' })
    );

    defs.appendChild(glow);
    defs.appendChild(glowStrong);
    defs.appendChild(grad);
    svg.appendChild(defs);

    glowGroup = make('g', { id: 'glowGroup' });
    wireGroup = make('g', { id: 'wireGroup' });
    linkGroup = make('g', { id: 'linkGroup' });
    nodeGroup = make('g', { id: 'nodeGroup' });
    labelGroup = make('g', { id: 'labelGroup' });
    svg.appendChild(glowGroup);
    svg.appendChild(wireGroup);
    svg.appendChild(linkGroup);
    svg.appendChild(nodeGroup);
    svg.appendChild(labelGroup);

    glowCircle = make('circle', { fill: 'url(#sphere-bg)', filter: 'url(#glow-strong)' });
    glowGroup.appendChild(glowCircle);

    // Wireframe rings + latitude lines — original theme only (redesign is cleaner)
    if (THEME !== 'redesign') {
      rimEllipse = make('ellipse', {
        fill: 'none',
        stroke: 'rgba(255,77,0,0.12)',
        'stroke-width': '1',
        'stroke-dasharray': '8,6',
      });
      wireGroup.appendChild(rimEllipse);

      var latYs = [-0.6, 0, 0.6];
      for (var li = 0; li < 3; li++) {
        var lat = make('ellipse', {
          fill: 'none',
          stroke: '#ffffff',
          'stroke-width': '0.5',
          opacity: String([0.03, 0.06, 0.03][li]),
        });
        wireGroup.appendChild(lat);
        latLines.push(lat);
      }
    }

    // Links — track links solid white, artist bridges dashed purple
    links.forEach(function (l) {
      var stroke =
        l.type === 'track'
          ? THEME === 'redesign'
            ? 'rgba(255,77,0,0.4)'
            : 'rgba(255,255,255,0.35)'
          : 'rgba(124,77,255,0.3)';
      var line = make('line', {
        stroke: stroke,
        'stroke-width': l.type === 'track' ? '1.2' : '0.7',
      });
      if (l.type === 'artist') line.setAttribute('stroke-dasharray', '3,4');
      linkGroup.appendChild(line);
      linkEls.push(line);
    });

    // Nodes + labels
    var isMono = THEME === 'redesign';
    nodes.forEach(function (node) {
      var r = 3 + Math.min(6, node.trackConnections * 0.22);
      var circle = make('circle', {
        r: String(r),
        fill: node.color,
        cursor: 'pointer',
        id: 'node-' + node.id,
      });
      circle.setAttribute('stroke', node.trackConnections > 0 ? '#ffffff' : 'none');
      circle.setAttribute('stroke-width', '0.6');
      if (node.trackConnections > 0) circle.setAttribute('filter', 'url(#glow)');
      nodeGroup.appendChild(circle);
      nodeEls.push(circle);

      var label = make('text', {
        fill: isMono ? 'rgba(255,255,255,0.85)' : '#ffffff',
        'font-size': isMono ? '8.5' : '10',
        'font-family': isMono ? "'Space Mono', monospace" : "'Inter', sans-serif",
        'text-anchor': 'middle',
        'pointer-events': 'none',
        opacity: '0',
      });
      if (isMono) label.setAttribute('letter-spacing', '1.5px');
      label.textContent = isMono ? node.name.toUpperCase() : node.name;
      labelGroup.appendChild(label);
      labelEls.push(label);
    });
  }

  // ─── Filter / active-set helpers ───────────────────────────────────────────

  function nodeMatch(node) {
    if (searchId) return node.id === searchId;
    if (activeGenre) return (node.genres || []).indexOf(activeGenre) >= 0;
    return true;
  }
  function connectedIds(id) {
    var set = {};
    for (var i = 0; i < links.length; i++) {
      if (links[i].source === id) set[links[i].target] = 1;
      if (links[i].target === id) set[links[i].source] = 1;
    }
    return set;
  }
  function isLinkActive(l) {
    if (searchId) return l.source === searchId || l.target === searchId;
    if (activeGenre) {
      return (
        (nodeMap[l.source].genres || []).indexOf(activeGenre) >= 0 &&
        (nodeMap[l.target].genres || []).indexOf(activeGenre) >= 0
      );
    }
    return true;
  }
  function isFiltering() {
    return !!(activeGenre || searchId || searchTerm);
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  function render() {
    var projected = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var p = project(n.x3, n.y3, n.z3);
      n.x2 = p.x;
      n.y2 = p.y;
      n.z2 = p.z;
      n.scale = p.scale;
      projected.push({ node: n, index: i });
    }
    projected.sort(function (a, b) {
      return a.node.z2 - b.node.z2;
    });

    // Sphere wireframe
    // Sphere wireframe (original theme only)
    glowCircle.setAttribute('cx', String(w / 2));
    glowCircle.setAttribute('cy', String(h / 2));
    glowCircle.setAttribute('r', String(RADIUS * 1.4));
    if (rimEllipse) {
      var rimProj = project(RADIUS, 0, 0);
      var rimWidth = Math.abs(rimProj.x - w / 2);
      var rimHeight = RADIUS * Math.abs(COS(rotX)) * rimProj.scale;
      rimEllipse.setAttribute('cx', String(w / 2));
      rimEllipse.setAttribute('cy', String(h / 2));
      rimEllipse.setAttribute('rx', String(Math.max(1, rimWidth)));
      rimEllipse.setAttribute('ry', String(Math.max(1, rimHeight)));

      var latYs = [-0.6, 0, 0.6];
      for (var li = 0; li < 3; li++) {
        var ly = latYs[li] * RADIUS;
        var latProj = project(0, ly, 0);
        var latWidth = Math.sqrt(RADIUS * RADIUS - ly * ly) * latProj.scale || 1;
        var latHeight =
          Math.sqrt(RADIUS * RADIUS - ly * ly) * Math.abs(COS(rotX)) * latProj.scale * 0.3 || 1;
        latLines[li].setAttribute('cx', String(w / 2));
        latLines[li].setAttribute('cy', String(latProj.y));
        latLines[li].setAttribute('rx', String(Math.max(1, latWidth)));
        latLines[li].setAttribute('ry', String(Math.max(1, latHeight)));
      }
    }

    var hoverSet = hoveredNode ? connectedIds(hoveredNode.id) : null;
    var selSet = selectedNode ? connectedIds(selectedNode.id) : null;
    var filtering = isFiltering();

    // Links
    for (var lk = 0; lk < links.length; lk++) {
      var l = links[lk];
      var src = nodeMap[l.source];
      var tgt = nodeMap[l.target];
      if (!src || !tgt) {
        linkEls[lk].setAttribute('opacity', '0');
        continue;
      }

      var hoverHit = hoveredNode && (l.source === hoveredNode.id || l.target === hoveredNode.id);
      var selHit = selectedNode && (l.source === selectedNode.id || l.target === selectedNode.id);

      var zNormSrc = (src.z2 + RADIUS) / (2 * RADIUS);
      var zNormTgt = (tgt.z2 + RADIUS) / (2 * RADIUS);
      var avgZ = (zNormSrc + zNormTgt) / 2;
      var baseOp = l.type === 'track' ? 0.35 : 0.14;
      var op = baseOp * (0.1 + avgZ * 0.9);

      if (filtering) {
        op = isLinkActive(l) ? op : 0.04;
      }
      if (hoverHit || selHit) op = Math.min(1, op * 3);

      linkEls[lk].setAttribute('x1', String(src.x2));
      linkEls[lk].setAttribute('y1', String(src.y2));
      linkEls[lk].setAttribute('x2', String(tgt.x2));
      linkEls[lk].setAttribute('y2', String(tgt.y2));
      linkEls[lk].setAttribute('opacity', String(Math.max(0, Math.min(1, op))));
    }

    // Nodes
    for (var pi = 0; pi < projected.length; pi++) {
      var item = projected[pi];
      var nd = item.node;
      var idx = item.index;
      var isHovered = hoveredNode && nd.id === hoveredNode.id;
      var isSelected = selectedNode && nd.id === selectedNode.id;
      var inFilter = nodeMatch(nd);
      var connected = !!(hoverSet && hoverSet[nd.id]) || !!(selSet && selSet[nd.id]);

      var zNorm = (nd.z2 + RADIUS) / (2 * RADIUS);
      var nodeOpacity = 0.1 + zNorm * 0.9;
      var nodeScale = 0.6 + (nd.scale - 0.75) * 2.0;
      var r =
        (THEME === 'redesign'
          ? 4 + Math.min(8, nd.trackConnections * 0.34)
          : 3 + Math.min(6, nd.trackConnections * 0.22)) * nodeScale;

      if (isHovered || isSelected) {
        nodeOpacity = 1;
        r *= 1.4;
      } else if (hoveredNode || selectedNode) {
        nodeOpacity = connected ? Math.max(0.75, nodeOpacity) : nodeOpacity * 0.16;
      } else if (filtering) {
        nodeOpacity = inFilter ? nodeOpacity : 0.05;
      }

      nodeEls[idx].setAttribute('cx', String(nd.x2));
      nodeEls[idx].setAttribute('cy', String(nd.y2));
      nodeEls[idx].setAttribute('r', String(Math.max(1, r)));
      nodeEls[idx].setAttribute('opacity', String(Math.max(0, Math.min(1, nodeOpacity))));

      // Labels: top connectors always (redesign) / front-hemisphere labels (original)
      var labelOp = 0;
      if (isHovered || isSelected) {
        labelOp = 1;
      } else if (hoveredNode && connected) {
        labelOp = 0.85;
      } else if (selectedNode && connected) {
        labelOp = 0.85;
      } else if (THEME === 'redesign') {
        if (topLabelIds.has(nd.id) && !filtering) labelOp = 0.62;
      } else if (!hoveredNode && !selectedNode && !filtering && zNorm > 0.6) {
        labelOp = (zNorm - 0.6) * 1.5;
      }

      labelEls[idx].setAttribute('x', String(nd.x2));
      labelEls[idx].setAttribute('y', String(nd.y2 - r - 5));
      labelEls[idx].setAttribute('opacity', String(Math.max(0, Math.min(1, labelOp))));
    }
  }

  // ─── Animation loop ────────────────────────────────────────────────────────

  var rafId = null;
  function animate() {
    if (autoRotate && !isDragging) {
      targetRotY += 0.002;
      targetRotX = 0.35 + Math.sin(Date.now() / 5000) * 0.08;
    }
    rotX += (targetRotX - rotX) * 0.08;
    rotY += (targetRotY - rotY) * 0.08;
    render();
    rafId = requestAnimationFrame(animate);
  }

  // ─── Tooltip ───────────────────────────────────────────────────────────────

  function showTooltip(e, node) {
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'nb-tooltip';
      document.body.appendChild(tooltipEl);
    }
    var html = '<div class="tt-name">' + esc(node.name) + '</div>';
    html +=
      '<div class="tt-meta">' +
      esc(node.genre || 'Unknown') +
      (node.connections > 0 ? ' · ' + node.connections + ' conexiones' : '') +
      '</div>';
    tooltipEl.innerHTML = html;
    tooltipEl.style.display = 'block';
    tooltipEl.style.left = Math.min(e.clientX + 14, window.innerWidth - 240) + 'px';
    tooltipEl.style.top = e.clientY - 10 + 'px';
  }
  function hideTooltip() {
    if (tooltipEl) tooltipEl.style.display = 'none';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function titleCase(str) {
    return str.replace(/\w\S*/g, function (t) {
      return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase();
    });
  }

  // ─── Side panel ────────────────────────────────────────────────────────────

  function sharedTracksFor(id) {
    var out = [];
    (crossRef.shared_tracks || []).forEach(function (st) {
      if (st.djs && st.djs.indexOf(id) >= 0) out.push(st);
    });
    return out;
  }
  function sharedArtistsFor(id) {
    var out = [];
    (crossRef.shared_artists || []).forEach(function (sa) {
      if (sa.djs && sa.djs.indexOf(id) >= 0) out.push(sa);
    });
    return out;
  }
  function djName(id) {
    return nodeMap[id] ? nodeMap[id].name : id;
  }
  function setTarget(setId) {
    return 'dj-library.html#set:' + encodeURIComponent(setId);
  }
  function setLabel(s) {
    if (typeof s === 'object' && s) return s.title || s.id || '';
    return String(s || '').replace(/-/g, ' ');
  }

  function djChips(ids, excludeId) {
    return ids
      .filter(function (id) {
        return id !== excludeId;
      })
      .map(function (id) {
        return (
          '<button type="button" class="nb-dj-chip" data-dj="' +
          esc(id) +
          '">' +
          esc(djName(id)) +
          '</button>'
        );
      })
      .join('');
  }
  function setTags(sets) {
    var list = sets || [];
    return list
      .map(function (s) {
        var id = typeof s === 'object' ? s.id : s;
        return '<a class="nb-set-tag" href="' + setTarget(id) + '">' + esc(setLabel(s)) + ' </a>';
      })
      .join('');
  }
  function openPanel(node) {
    selectedNode = node;
    autoRotate = false;
    showSidePanel(node);
  }
  function closePanel() {
    selectedNode = null;
    autoRotate = true;
    hideSidePanel();
  }

  function showSidePanel(node) {
    var panel = el('networkInfo');
    if (!panel) return;

    var sharedTracks = sharedTracksFor(node.id);
    var sharedArtists = sharedArtistsFor(node.id);
    var origin = node.origin ? ' · ' + node.origin : '';
    var setCount = (node.sets || []).length;

    var html = '<div class="nb-panel" data-dj="' + esc(node.id) + '">';

    if (THEME === 'redesign') {
      html += '<div class="nb-kicker">El hilo · ' + esc(node.genre) + '</div>';
      if (node.image)
        html +=
          '<img class="nb-panel-img" src="' +
          esc(node.image) +
          '" alt="' +
          esc(node.name) +
          '" loading="lazy">';
      html += '<h3 class="nb-panel-dj">' + esc(node.name) + '</h3>';
      html +=
        '<div class="nb-panel-meta"><span>' +
        esc(node.genre) +
        '</span><span>' +
        setCount +
        ' sets</span><span>' +
        node.connections +
        ' enlaces</span></div>';
      html +=
        '<div class="nb-section-title">Pistas compartidas · ' + sharedTracks.length + '</div>';
      if (!sharedTracks.length) {
        html += '<div class="nb-empty">Sin pistas compartidas todavía.</div>';
      }
      sharedTracks.forEach(function (st) {
        var parts = String(st.track || '').split(' - ');
        var artist = parts.length >= 2 ? parts[0].trim() : 'Various';
        var track = parts.length >= 2 ? parts.slice(1).join(' - ') : st.track;
        html += '<div class="nb-track">';
        html += '<div class="nb-track-title">' + esc(titleCase(track)) + '</div>';
        html += '<div class="nb-track-artist">by ' + esc(titleCase(artist)) + '</div>';
        html += '<div class="nb-dj-chips">' + djChips(st.djs, node.id) + '</div>';
        if (st.sets && st.sets.length)
          html += '<div class="nb-sets">' + setTags(st.sets) + '</div>';
        html += '</div>';
      });
      html +=
        '<div class="nb-section-title">Puentes por artista · ' + sharedArtists.length + '</div>';
      if (!sharedArtists.length) {
        html += '<div class="nb-empty">Sin puentes por artista todavía.</div>';
      }
      sharedArtists.forEach(function (sa) {
        html += '<div class="nb-artist"><div class="nb-artist-name">' + esc(sa.artist) + '</div>';
        if (sa.tracks && sa.tracks.length) {
          html += '<div class="nb-artist-tracks">' + esc(sa.tracks.join(', ')) + '</div>';
        }
        html += '<div class="nb-dj-chips">' + djChips(sa.djs, node.id) + '</div></div>';
      });
      html += '<div class="nb-panel-actions">';
      html += '<a class="nb-main-link" href="dj/' + esc(node.id) + '.html">Discoteca </a>';
      html += '<a class="nb-sec-link" href="dj-library.html">DJ Library</a>';
      html += '</div>';
    } else {
      html += '<div class="nb-kicker">Neural · conexiones</div>';
      if (node.image)
        html +=
          '<img class="nb-panel-img" src="' +
          esc(node.image) +
          '" alt="' +
          esc(node.name) +
          '" loading="lazy">';
      html += '<h3 class="nb-panel-dj">' + esc(node.name) + '</h3>';
      html +=
        '<div class="nb-panel-meta"><span>' +
        esc(node.genre) +
        '</span><span>' +
        setCount +
        ' sets</span><span>' +
        node.connections +
        ' enlaces</span></div>';
      html += '<div class="nb-section-title">Shared Tracks · ' + sharedTracks.length + '</div>';
      if (!sharedTracks.length) {
        html += '<div class="nb-empty">No shared tracks yet.</div>';
      }
      sharedTracks.forEach(function (st) {
        html += '<div class="nb-track">';
        html += '<div class="nb-track-title">' + esc(st.track) + '</div>';
        html += '<div class="nb-dj-chips">' + djChips(st.djs, node.id) + '</div>';
        if (st.sets && st.sets.length)
          html += '<div class="nb-sets">' + setTags(st.sets) + '</div>';
        html += '</div>';
      });
      html += '<div class="nb-section-title">Shared Artists · ' + sharedArtists.length + '</div>';
      if (!sharedArtists.length) {
        html += '<div class="nb-empty">No shared artists yet.</div>';
      }
      sharedArtists.forEach(function (sa) {
        html += '<div class="nb-artist"><div class="nb-artist-name">' + esc(sa.artist) + '</div>';
        if (sa.tracks && sa.tracks.length) {
          html += '<div class="nb-artist-tracks">Tracks: ' + esc(sa.tracks.join(', ')) + '</div>';
        }
        html += '<div class="nb-dj-chips">' + djChips(sa.djs, node.id) + '</div></div>';
      });
      html += '<div class="nb-panel-actions">';
      html += '<a class="nb-main-link" href="dj/' + esc(node.id) + '.html">Ver en DJ Library </a>';
      html += '</div>';
    }
    html += '</div>';

    panel.innerHTML = html;
    panel.classList.add('visible');

    panel.querySelectorAll('.nb-dj-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var dj = nodeMap[chip.dataset.dj];
        if (dj) openPanel(dj);
      });
    });
  }

  function hideSidePanel() {
    var panel = el('networkInfo');
    if (panel) panel.classList.remove('visible');
  }

  // ─── Stats ─────────────────────────────────────────────────────────────────

  function updateStats() {
    var trackConnCount = 0;
    var artistConnCount = 0;
    links.forEach(function (l) {
      if (l.type === 'track') trackConnCount++;
      else artistConnCount++;
    });
    var agg = aggregates();

    var out = [
      ['statDJs', nodes.length],
      ['statSets', agg.sets],
      ['statTracks', agg.tracks],
      ['statConns', links.length],
      ['statFromTracklists', trackConnCount],
      ['statArtistBridges', artistConnCount],
      ['helpStatDJs', nodes.length],
      ['helpStatConns', links.length],
      ['helpStatTracks', agg.tracks],
      ['helpStatSets', agg.sets],
      ['welcomeStatDJs', nodes.length],
      ['welcomeStatSets', agg.sets],
      ['welcomeStatTracks', agg.tracks],
      ['welcomeStatHours', agg.hours ? String(agg.hours) : false],
      ['welcomeStatMinutes', agg.minutes ? String(agg.minutes) : false],
      ['railDJs', nodes.length],
      ['railSets', agg.sets],
      ['railTracks', agg.tracks],
      ['railHours', agg.hours ? String(agg.hours) : false],
      ['statVis', nodes.length],
    ];
    out.forEach(function (pair) {
      if (pair[1] !== false) {
        var node = el(pair[0]);
        if (node) node.textContent = pair[1];
      }
    });
  }

  // ─── Search ────────────────────────────────────────────────────────────────

  function setupSearch() {
    var input = el('nbSearchInput');
    if (!input) return;
    var clearBtn = el('nbSearchClear');
    var wrap = input.closest('.nb-search');

    function apply(term) {
      searchTerm = term.trim().toLowerCase();
      input.closest('.nb-search').classList.toggle('has-value', searchTerm.length > 0);
      if (searchTerm) {
        var best = null;
        var bestScore = 0;
        nodes.forEach(function (n) {
          var name = n.name.toLowerCase();
          var genres = (n.genres || []).join(' ').toLowerCase();
          var score = name.indexOf(searchTerm) >= 0 ? 10 : 0;
          if (genres.indexOf(searchTerm) >= 0) score += 5;
          if (n.name.toLowerCase() === searchTerm) score += 20;
          if (score > bestScore) {
            bestScore = score;
            best = n;
          }
        });
        searchId = best && bestScore > 0 ? best.id : null;
      } else {
        searchId = null;
      }
      syncAutoRotate();
    }

    input.addEventListener('input', function () {
      apply(input.value);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && searchId) {
        var n = nodeMap[searchId];
        if (n) openPanel(n);
      }
      if (e.key === 'Escape') {
        input.value = '';
        apply('');
      }
    });
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        apply('');
        input.focus();
      });
    }
  }

  // ─── Genre chips ───────────────────────────────────────────────────────────

  function setupGenreChips() {
    var box = el('nbChips');
    if (!box) return;
    var genres = genreCandidates();

    function clearActive() {
      box.querySelectorAll('.nb-chip').forEach(function (b) {
        b.classList.remove('active');
      });
    }

    function build() {
      box.innerHTML = genres
        .map(function (g, i) {
          return (
            '<button type="button" class="nb-chip" data-genre="' +
            esc(g.genre) +
            '">' +
            esc(g.genre) +
            ' <em style="font-style:normal;opacity:.5">' +
            g.count +
            '</em></button>'
          );
        })
        .join('');
      box.querySelectorAll('.nb-chip').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var g = btn.dataset.genre;
          if (activeGenre === g) {
            activeGenre = null;
            clearActive();
          } else {
            activeGenre = g;
            clearActive();
            btn.classList.add('active');
          }
          syncAutoRotate();
        });
      });
    }

    build();
  }

  // ─── Reset / clear filters ─────────────────────────────────────────────────

  function syncAutoRotate() {
    if (isFiltering() || selectedNode || hoveredNode) {
      autoRotate = false;
    } else if (!isDragging) {
      autoRotate = true;
    }
  }

  function fullReset() {
    targetRotX = 0.35;
    targetRotY = 0;
    autoRotate = true;
    selectedNode = null;
    hoveredNode = null;
    activeGenre = null;
    searchTerm = '';
    searchId = null;
    hideTooltip();
    hideSidePanel();
    var input = el('nbSearchInput');
    if (input) {
      input.value = '';
      input.closest('.nb-search').classList.remove('has-value');
    }
    var box = el('nbChips');
    if (box) {
      box.querySelectorAll('.nb-chip').forEach(function (b) {
        b.classList.remove('active');
      });
    }
  }

  // ─── 2D "Plano del Hilo" (redesign only) ───────────────────────────────────

  var plano = null; // { svg, w, h, px, py, r, els }
  var planoActive = false;

  function setupModeToggle() {
    var b3d = el('btnMode3d');
    var b2d = el('btnMode2d');
    if (!b3d || !b2d) return;
    b3d.addEventListener('click', function () {
      setMode('3d');
    });
    b2d.addEventListener('click', function () {
      setMode('2d');
    });
  }

  function setMode(mode) {
    var stage = el('sphereStage');
    var hilo = el('hiloContainer');
    var b3d = el('btnMode3d');
    var b2d = el('btnMode2d');
    var was2d = planoActive;
    planoActive = mode === '2d';

    if (stage) stage.classList.toggle('hidden', mode === '2d');
    if (hilo) hilo.classList.toggle('active', mode === '2d');
    if (b3d) b3d.classList.toggle('active', mode === '3d');
    if (b2d) b2d.classList.toggle('active', mode === '2d');

    if (planoActive && !was2d) initPlano();
    if (planoActive) renderPlano();
  }

  function initPlano() {
    var hilo = el('hiloContainer');
    var svgEl = el('hiloSvg');
    if (!hilo || !svgEl || (plano && plano.svg === svgEl && plano.ready)) return;

    var pw = hilo.clientWidth || container.clientWidth || 900;
    var ph = hilo.clientHeight || container.clientHeight || 600;
    svgEl.setAttribute('width', String(pw));
    svgEl.setAttribute('height', String(ph));
    svgEl.setAttribute('viewBox', '0 0 ' + pw + ' ' + ph);
    svgEl.innerHTML = '';

    // Simple custom force layout (56 nodes — O(n²) is fine, one pass)
    var px = {};
    var py = {};
    var r = {};
    nodes.forEach(function (n, i) {
      var ang = (i / nodes.length) * Math.PI * 2;
      px[n.id] = pw / 2 + Math.cos(ang) * Math.min(pw, ph) * 0.35;
      py[n.id] = ph / 2 + Math.sin(ang) * Math.min(pw, ph) * 0.35;
    });

    var pad = 60;
    var R = Math.min(pw, ph) * 0.35;
    for (var it = 0; it < 160; it++) {
      // repulsion
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i],
            b = nodes[j];
          var dx = px[b.id] - px[a.id];
          var dy = py[b.id] - py[a.id];
          var d = Math.sqrt(dx * dx + dy * dy) || 1;
          if (d > 0) {
            var rep = 4200 / (d * d);
            var fx = (dx / d) * rep;
            var fy = (dy / d) * rep;
            px[a.id] -= fx;
            py[a.id] -= fy;
            px[b.id] += fx;
            py[b.id] += fy;
          }
        }
      }
      // attraction on shared links
      for (var k = 0; k < links.length; k++) {
        var l = links[k];
        var s = nodeMap[l.source];
        var t = nodeMap[l.target];
        if (!s || !t) continue;
        var dx2 = px[t.id] - px[s.id];
        var dy2 = py[t.id] - py[s.id];
        var d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
        var pull = (d2 - 90) * 0.06;
        px[s.id] += (dx2 / d2) * pull;
        py[s.id] += (dy2 / d2) * pull;
        px[t.id] -= (dx2 / d2) * pull;
        py[t.id] -= (dy2 / d2) * pull;
      }
      // center + boundary
      nodes.forEach(function (n) {
        px[n.id] += (pw / 2 - px[n.id]) * 0.01;
        py[n.id] += (ph / 2 - py[n.id]) * 0.01;
        px[n.id] = Math.max(pad, Math.min(pw - pad, px[n.id]));
        py[n.id] = Math.max(pad + 30, Math.min(ph - pad, py[n.id]));
      });
    }

    var grp = document.createElementNS(SVGNS, 'g');
    svgEl.appendChild(grp);

    var edgeEls = [];
    links.forEach(function () {
      var line = document.createElementNS(SVGNS, 'line');
      grp.appendChild(line);
      edgeEls.push(line);
    });

    var nodeEls2 = [];
    nodes.forEach(function (n) {
      r[n.id] = 3 + Math.min(6, n.trackConnections * 0.25);
      var circ = document.createElementNS(SVGNS, 'circle');
      circ.setAttribute('r', String(r[n.id]));
      circ.setAttribute('fill', n.color);
      circ.setAttribute('stroke', '#fff');
      circ.setAttribute('stroke-width', '0.6');
      circ.style.cursor = 'pointer';
      grp.appendChild(circ);

      var lab = document.createElementNS(SVGNS, 'text');
      lab.setAttribute('fill', 'rgba(255,255,255,0.8)');
      lab.setAttribute('font-size', '8.5');
      lab.setAttribute('font-family', "'Space Mono', monospace");
      lab.setAttribute('letter-spacing', '1.2px');
      lab.setAttribute('text-anchor', 'middle');
      lab.setAttribute('pointer-events', 'none');
      lab.textContent = n.name.toUpperCase();
      grp.appendChild(lab);

      nodeEls2.push({ circ: circ, lab: lab, n: n });
    });

    plano = {
      svg: svgEl,
      w: pw,
      h: ph,
      px: px,
      py: py,
      r: r,
      edges: edgeEls,
      nodes: nodeEls2,
      onmove: function (e) {
        var t = e.target;
        if (t.tagName !== 'circle') return;
        for (var i = 0; i < plano.nodes.length; i++) {
          if (plano.nodes[i].circ === t) {
            showTooltip(e, plano.nodes[i].n);
            return;
          }
        }
      },
    };

    svgEl.addEventListener('mousemove', plano.onmove);
    svgEl.addEventListener('mouseleave', hideTooltip);
    svgEl.addEventListener('click', function (e) {
      var t = e.target;
      if (t.tagName !== 'circle') return;
      for (var i = 0; i < plano.nodes.length; i++) {
        if (plano.nodes[i].circ === t) {
          openPanel(plano.nodes[i].n);
          return;
        }
      }
    });
  }

  function renderPlano() {
    if (!plano) return;
    var edges = plano.edges;
    for (var e = 0; e < links.length; e++) {
      var l = links[e];
      var s = nodeMap[l.source];
      var t = nodeMap[l.target];
      if (!s || !t) {
        edges[e].setAttribute('opacity', '0');
        continue;
      }
      edges[e].setAttribute('x1', String(plano.px[s.id]));
      edges[e].setAttribute('y1', String(plano.py[s.id]));
      edges[e].setAttribute('x2', String(plano.px[t.id]));
      edges[e].setAttribute('y2', String(plano.py[t.id]));
      edges[e].setAttribute(
        'stroke',
        l.type === 'track' ? 'rgba(255,77,0,0.35)' : 'rgba(124,77,255,0.3)'
      );
      edges[e].setAttribute('stroke-width', l.type === 'track' ? '1.2' : '0.7');
      if (l.type === 'artist') edges[e].setAttribute('stroke-dasharray', '3,4');
      var on = isLinkActive(l);
      edges[e].setAttribute('opacity', on ? '0.5' : '0.05');
    }
    plano.nodes.forEach(function (ne) {
      var n = ne.n;
      var on = nodeMatch(n) || (searchId && n.id === searchId);
      var hover = hoveredNode && (n.id === hoveredNode.id || connectedIds(hoveredNode.id)[n.id]);
      var sele = selectedNode && n.id === selectedNode.id;
      var op = on || hover || sele ? 1 : isFiltering() ? 0.08 : 0.85;
      ne.circ.setAttribute('cx', String(plano.px[n.id]));
      ne.circ.setAttribute('cy', String(plano.py[n.id]));
      ne.circ.setAttribute('opacity', String(op));
      ne.lab.setAttribute('x', String(plano.px[n.id]));
      ne.lab.setAttribute('y', String(plano.py[n.id] - plano.r[n.id] - 5));
      var showLabel = sele || hover || n.id === searchId || (on && topLabelIds.has(n.id));
      ne.lab.setAttribute('opacity', showLabel ? '0.8' : '0');
    });
  }

  // ─── Interactions (3D) ─────────────────────────────────────────────────────

  function setupInteractions() {
    if (nodeGroup) {
      nodeGroup.addEventListener('mousemove', function (e) {
        var t = e.target;
        if (t.tagName === 'circle') {
          var idx = nodeEls.indexOf(t);
          if (idx >= 0) {
            hoveredNode = nodes[idx];
            showTooltip(e, hoveredNode);
            autoRotate = false;
          }
        } else {
          hoveredNode = null;
          hideTooltip();
          if (!isDragging && !selectedNode) autoRotate = true;
        }
      });
      nodeGroup.addEventListener('mouseleave', function () {
        hoveredNode = null;
        hideTooltip();
        if (!isDragging && !selectedNode) autoRotate = true;
      });
      nodeGroup.addEventListener('click', function (e) {
        var t = e.target;
        if (t.tagName === 'circle') {
          var idx = nodeEls.indexOf(t);
          if (idx >= 0) openPanel(nodes[idx]);
        }
      });
    }

    if (svg) {
      svg.addEventListener('mousedown', function (e) {
        if (e.target.tagName === 'circle') return;
        isDragging = true;
        autoRotate = false;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartRotX = targetRotX;
        dragStartRotY = targetRotY;
        e.preventDefault();
      });
    }

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - dragStartX;
      var dy = e.clientY - dragStartY;
      targetRotY = dragStartRotY + dx * 0.005;
      targetRotX = Math.max(-1.2, Math.min(1.2, dragStartRotX + dy * 0.005));
    });
    window.addEventListener('mouseup', function () {
      if (isDragging) {
        isDragging = false;
        if (!selectedNode) autoRotate = true;
      }
    });

    if (svg) {
      svg.addEventListener(
        'touchstart',
        function (e) {
          if (e.touches.length === 1) {
            isDragging = true;
            autoRotate = false;
            dragStartX = e.touches[0].clientX;
            dragStartY = e.touches[0].clientY;
            dragStartRotX = targetRotX;
            dragStartRotY = targetRotY;
          }
        },
        { passive: true }
      );
      svg.addEventListener(
        'touchmove',
        function (e) {
          if (!isDragging || e.touches.length !== 1) return;
          var dx = e.touches[0].clientX - dragStartX;
          var dy = e.touches[0].clientY - dragStartY;
          targetRotY = dragStartRotY + dx * 0.005;
          targetRotX = Math.max(-1.2, Math.min(1.2, dragStartRotX + dy * 0.005));
        },
        { passive: true }
      );
      svg.addEventListener('touchend', function () {
        if (isDragging) {
          isDragging = false;
          if (!selectedNode) autoRotate = true;
        }
      });
    }

    var resetBtn = el('resetViewBtn');
    if (resetBtn) resetBtn.addEventListener('click', fullReset);

    var closeBtn = el('infoClose');
    if (closeBtn) closeBtn.addEventListener('click', closePanel);

    setupSearch();
    setupGenreChips();
    setupModeToggle();
  }

  // ─── Resize ────────────────────────────────────────────────────────────────

  function onResize() {
    if (!container || !svg) return;
    w = container.clientWidth;
    h = container.clientHeight;
    RADIUS = Math.min(w, h) * 0.38;
    svg.setAttribute('width', String(w));
    svg.setAttribute('height', String(h));
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    relaxPositions();
    if (plano) {
      plano = null;
      initPlano();
      renderPlano();
    }
    if (planoActive) renderPlano();
  }

  // ─── Welcome system (ported from legacy 3d-brain.js) ───────────────────────

  var WelcomeSystem = {
    STORAGE_KEY: 'muntaner336_welcome_seen',
    init: function () {
      var welcome = el('welcomeScreen');
      var enterBtn = el('welcomeEnterBtn');
      var dismiss = el('welcomeDismiss');
      var helpBtn = el('welcomeHelpBtn');
      var helpModal = el('helpModal');
      var helpClose = el('helpClose');
      var helpEnter = el('helpEnterBtn');

      var hasSeen = false;
      try {
        hasSeen = localStorage.getItem(this.STORAGE_KEY) === 'true';
      } catch (e) {
        /* private mode */
      }

      if (hasSeen && welcome) this.enter(true);

      if (enterBtn)
        enterBtn.addEventListener(
          'click',
          function () {
            this.enter();
          }.bind(this)
        );
      if (dismiss)
        dismiss.addEventListener(
          'click',
          function () {
            this.enter();
          }.bind(this)
        );
      if (helpBtn)
        helpBtn.addEventListener(
          'click',
          function () {
            this.showHelp();
          }.bind(this)
        );
      if (helpClose)
        helpClose.addEventListener(
          'click',
          function () {
            this.hideHelp();
          }.bind(this)
        );
      if (helpEnter)
        helpEnter.addEventListener(
          'click',
          function () {
            this.enter();
          }.bind(this)
        );

      if (helpModal) {
        helpModal.addEventListener(
          'click',
          function (e) {
            if (e.target === helpModal) this.hideHelp();
          }.bind(this)
        );
      }
      document.addEventListener(
        'keydown',
        function (e) {
          if (e.key === 'Escape') {
            if (helpModal && helpModal.classList.contains('active')) this.hideHelp();
            else if (welcome && !welcome.classList.contains('hidden')) this.enter();
          }
        }.bind(this)
      );
    },
    enter: function (silent) {
      var welcome = el('welcomeScreen');
      if (welcome) welcome.classList.add('hidden');
      if (!silent) {
        try {
          localStorage.setItem(this.STORAGE_KEY, 'true');
        } catch (e) {
          /* private mode */
        }
        this.track('welcome_completed');
      }
      setTimeout(function () {
        var c = el('network-container');
        if (c) c.classList.remove('hidden');
      }, 30);
    },
    showHelp: function () {
      var welcome = el('welcomeScreen');
      var helpModal = el('helpModal');
      if (welcome) welcome.classList.add('hidden');
      if (helpModal) helpModal.classList.add('active');
      this.track('welcome_help_shown');
    },
    hideHelp: function () {
      var welcome = el('welcomeScreen');
      var helpModal = el('helpModal');
      if (helpModal) helpModal.classList.remove('active');
      if (welcome) welcome.classList.remove('hidden');
      this.track('welcome_help_closed');
    },
    track: function (eventName) {
      if (typeof gtag === 'function') {
        gtag('event', eventName, { page: 'dj-hub' });
      }
    },
  };

  // ─── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    container = el('network-container');
    svg = el('sphere-svg');
    if (!container || !svg) return;
    if (svg.dataset.ready) return;
    svg.dataset.ready = '1';

    w = container.clientWidth;
    h = container.clientHeight;
    RADIUS = Math.min(w, h) * 0.38;
    svg.setAttribute('width', String(w));
    svg.setAttribute('height', String(h));
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);

    WelcomeSystem.init();

    try {
      await loadData();
    } catch (e) {
      console.error('Neural: failed to load DJ data', e);
      return;
    }

    relaxPositions();
    createSVGElements();
    setupInteractions();
    updateStats();
    animate();

    window.addEventListener('resize', onResize);
  }

  window.Muntaner336 = window.Muntaner336 || {};
  window.Muntaner336.init3DBrain = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
