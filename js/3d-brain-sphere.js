(function() {
  'use strict';

  window.Muntaner336 = window.Muntaner336 || {};

  var GENRE_COLORS = {
    Techno: '#ff4d00',
    House: '#42a5f5',
    'Deep House': '#00bcd4',
    'Tech House': '#ff9800',
    'Minimal Techno': '#e91e63',
    'Detroit Techno': '#8bc34a',
    'Melodic House': '#9c27b0',
    'Melodic Techno': '#ab47bc',
    'UK Bass': '#00e676',
    Disco: '#ffeb3b',
    'Deep Dub Techno': '#26a69a',
    Ambient: '#607d8b',
    Minimal: '#78909c',
    'Acid House': '#ff7043',
    Funk: '#ffca28',
    Unknown: '#555555'
  };

  var container, svg;
  var w = 0, h = 0;
  var nodes = [];
  var links = [];
  var nodeMap = {};
  var filteredGenre = null;
  var hoveredNode = null;
  var selectedNode = null;

  var autoRotate = true;
  var rotX = 0.35;
  var rotY = 0;
  var targetRotX = 0.35;
  var targetRotY = 0;
  var isDragging = false;
  var dragStartX = 0;
  var dragStartY = 0;
  var dragStartRotX = 0;
  var dragStartRotY = 0;

  var RADIUS = 280;
  var COS = Math.cos;
  var SIN = Math.sin;

  var glowGroup, wireGroup, linkGroup, nodeGroup, labelGroup;
  var rimEllipse, glowCircle;
  var latLines = [];
  var nodeElements = [];
  var linkElements = [];
  var labelElements = [];

  // ─── Data Loading ─────────────────────────────────────────────────────────

  async function loadData() {
    var indexRes = await fetch('data/djs/index.json');
    var indexData = await indexRes.json();

    var crossRefRes = await fetch('data/djs/cross-references.json');
    var crossRefData = await crossRefRes.json();

    var djsList = indexData.djs || [];
    nodes = [];
    nodeMap = {};

    djsList.forEach(function(dj) {
      var node = {
        id: dj.id,
        name: dj.name,
        genre: (dj.genres && dj.genres.length) ? dj.genres[0] : 'Unknown',
        genres: dj.genres || [],
        image: dj.image || '',
        sets: dj.sets || [],
        stats: dj.stats || {},
        connections: 0,
        trackConnections: 0,
        x3: 0, y3: 0, z3: 0,
        x2: 0, y2: 0, z2: 0,
        scale: 1,
        color: GENRE_COLORS[(dj.genres && dj.genres.length) ? dj.genres[0] : 'Unknown'] || GENRE_COLORS.Unknown
      };
      nodes.push(node);
      nodeMap[dj.id] = node;
    });

    // Build links from shared tracks
    var linkSet = {};
    var trackLinkCount = 0;
    var artistLinkCount = 0;

    (crossRefData.shared_tracks || []).forEach(function(st) {
      var djs = st.djs || [];
      for (var i = 0; i < djs.length; i++) {
        for (var j = i + 1; j < djs.length; j++) {
          var key = djs[i] + '--' + djs[j];
          if (!linkSet[key]) {
            linkSet[key] = { source: djs[i], target: djs[j], type: 'track', strength: 0 };
          }
          linkSet[key].strength++;
          trackLinkCount++;
        }
      }
    });

    (crossRefData.shared_artists || []).forEach(function(sa) {
      var djs = sa.djs || [];
      for (var i = 0; i < djs.length; i++) {
        for (var j = i + 1; j < djs.length; j++) {
          var key = djs[i] + '--' + djs[j];
          if (!linkSet[key]) {
            linkSet[key] = { source: djs[i], target: djs[j], type: 'artist', strength: 0 };
            artistLinkCount++;
          } else if (linkSet[key].type === 'track') {
            // Already connected by track, don't add artist link
          } else {
            linkSet[key].strength++;
          }
        }
      }
    });

    links = [];
    Object.keys(linkSet).forEach(function(key) {
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
  }

  // ─── Sphere Layout ────────────────────────────────────────────────────────

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
      // Repulsion between all nodes
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

      // Attraction between connected nodes
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

      // Normalize back to sphere
      for (var m = 0; m < nodes.length; m++) {
        var n = nodes[m];
        var len = Math.sqrt(n.x3 * n.x3 + n.y3 * n.y3 + n.z3 * n.z3) || 1;
        n.x3 = (n.x3 / len) * RADIUS;
        n.y3 = (n.y3 / len) * RADIUS;
        n.z3 = (n.z3 / len) * RADIUS;
      }
    }
  }

  // ─── 3D Projection ────────────────────────────────────────────────────────

  function project(x, y, z) {
    var x1 = x * COS(rotY) - z * SIN(rotY);
    var z1 = x * SIN(rotY) + z * COS(rotY);
    var y1 = y * COS(rotX) - z1 * SIN(rotX);
    var z2 = y * SIN(rotX) + z1 * COS(rotX);
    var camDist = 900;
    var scale = camDist / (camDist - z2);
    return {
      x: w / 2 + x1 * scale,
      y: h / 2 + y1 * scale,
      z: z2,
      scale: scale
    };
  }

  // ─── SVG Element Creation ─────────────────────────────────────────────────

  function createSVGElements() {
    svg.innerHTML = '';

    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // Glow filter
    var filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'glow');
    var blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '4');
    blur.setAttribute('result', 'blur');
    var merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    var mn1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    mn1.setAttribute('in', 'blur');
    var mn2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    mn2.setAttribute('in', 'SourceGraphic');
    merge.appendChild(mn1);
    merge.appendChild(mn2);
    filter.appendChild(blur);
    filter.appendChild(merge);
    defs.appendChild(filter);

    // Glow strong filter
    var filterStrong = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filterStrong.setAttribute('id', 'glow-strong');
    var blurStrong = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    blurStrong.setAttribute('stdDeviation', '8');
    blurStrong.setAttribute('result', 'blur');
    var mergeStrong = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    var mns1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    mns1.setAttribute('in', 'blur');
    var mns2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    mns2.setAttribute('in', 'SourceGraphic');
    mergeStrong.appendChild(mns1);
    mergeStrong.appendChild(mns2);
    filterStrong.appendChild(blurStrong);
    filterStrong.appendChild(mergeStrong);
    defs.appendChild(filterStrong);

    // Radial gradient for sphere background
    var grad = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    grad.setAttribute('id', 'sphere-bg');
    var stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#ff4d00');
    stop1.setAttribute('stop-opacity', '0.08');
    var stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#ff4d00');
    stop2.setAttribute('stop-opacity', '0');
    grad.appendChild(stop1);
    grad.appendChild(stop2);
    defs.appendChild(grad);

    svg.appendChild(defs);

    // Groups
    glowGroup = createGroup('glowGroup');
    wireGroup = createGroup('wireGroup');
    linkGroup = createGroup('linkGroup');
    nodeGroup = createGroup('nodeGroup');
    labelGroup = createGroup('labelGroup');

    svg.appendChild(glowGroup);
    svg.appendChild(wireGroup);
    svg.appendChild(linkGroup);
    svg.appendChild(nodeGroup);
    svg.appendChild(labelGroup);

    // Ambient glow circle
    glowCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glowCircle.setAttribute('fill', 'url(#sphere-bg)');
    glowCircle.setAttribute('filter', 'url(#glow-strong)');
    glowGroup.appendChild(glowCircle);

    // Sphere rim ellipse
    rimEllipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    rimEllipse.setAttribute('fill', 'none');
    rimEllipse.setAttribute('stroke', 'rgba(255,77,0,0.12)');
    rimEllipse.setAttribute('stroke-width', '1');
    rimEllipse.setAttribute('stroke-dasharray', '8,6');
    wireGroup.appendChild(rimEllipse);

    // Latitude lines
    for (var i = 0; i < 3; i++) {
      var latEllipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      latEllipse.setAttribute('fill', 'none');
      latEllipse.setAttribute('stroke', 'white');
      latEllipse.setAttribute('stroke-width', '0.5');
      var opacities = [0.03, 0.06, 0.03];
      latEllipse.setAttribute('opacity', String(opacities[i]));
      wireGroup.appendChild(latEllipse);
      latLines.push(latEllipse);
    }

    // Create link elements
    links.forEach(function(l) {
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', l.type === 'track' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)');
      line.setAttribute('stroke-width', l.type === 'track' ? '1.2' : '0.6');
      if (l.type === 'artist') {
        line.setAttribute('stroke-dasharray', '3,4');
      }
      linkGroup.appendChild(line);
      linkElements.push(line);
    });

    // Create node elements
    nodes.forEach(function(node) {
      var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      var r = 3 + Math.min(5, node.trackConnections * 0.15);
      circle.setAttribute('r', String(r));
      circle.setAttribute('fill', node.color);
      circle.setAttribute('stroke', node.trackConnections > 0 ? 'white' : 'none');
      circle.setAttribute('stroke-width', node.trackConnections > 0 ? '0.5' : '0');
      if (node.trackConnections > 0) {
        circle.setAttribute('filter', 'url(#glow)');
      }
      circle.style.cursor = 'pointer';
      nodeGroup.appendChild(circle);
      nodeElements.push(circle);

      var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.textContent = node.name;
      label.setAttribute('fill', 'white');
      label.setAttribute('font-size', '10');
      label.setAttribute('font-family', "'Inter', sans-serif");
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('pointer-events', 'none');
      label.setAttribute('opacity', '0');
      labelGroup.appendChild(label);
      labelElements.push(label);
    });
  }

  function createGroup(id) {
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('id', id);
    return g;
  }

  // ─── Rendering ────────────────────────────────────────────────────────────

  function render() {
    // Project all nodes
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

    // Sort by z (back to front)
    projected.sort(function(a, b) { return a.node.z2 - b.node.z2; });

    // Update sphere wireframe
    var rimProj = project(RADIUS, 0, 0);
    var rimWidth = Math.abs(rimProj.x - w / 2);
    var rimHeight = RADIUS * Math.abs(COS(rotX)) * rimProj.scale;
    rimEllipse.setAttribute('cx', String(w / 2));
    rimEllipse.setAttribute('cy', String(h / 2));
    rimEllipse.setAttribute('rx', String(rimWidth));
    rimEllipse.setAttribute('ry', String(Math.max(1, rimHeight)));

    // Glow circle
    glowCircle.setAttribute('cx', String(w / 2));
    glowCircle.setAttribute('cy', String(h / 2));
    glowCircle.setAttribute('r', String(RADIUS * 1.4));

    // Latitude lines
    var latYs = [-0.6, 0, 0.6];
    for (var li = 0; li < 3; li++) {
      var ly = latYs[li] * RADIUS;
      var latProj = project(0, ly, 0);
      var latWidth = Math.sqrt(RADIUS * RADIUS - ly * ly) * latProj.scale;
      var latHeight = Math.sqrt(RADIUS * RADIUS - ly * ly) * Math.abs(COS(rotX)) * latProj.scale * 0.3;
      latLines[li].setAttribute('cx', String(w / 2));
      latLines[li].setAttribute('cy', String(latProj.y));
      latLines[li].setAttribute('rx', String(Math.max(1, latWidth)));
      latLines[li].setAttribute('ry', String(Math.max(1, latHeight)));
    }

    // Draw links
    for (var lk = 0; lk < links.length; lk++) {
      var l = links[lk];
      var src = nodeMap[l.source];
      var tgt = nodeMap[l.target];
      if (!src || !tgt) {
        linkElements[lk].setAttribute('opacity', '0');
        continue;
      }
      var srcVisible = !filteredGenre || src.genre === filteredGenre;
      var tgtVisible = !filteredGenre || tgt.genre === filteredGenre;
      var hoverHighlight = hoveredNode && (l.source === hoveredNode.id || l.target === hoveredNode.id);
      var selectHighlight = selectedNode && (l.source === selectedNode.id || l.target === selectedNode.id);

      if (!srcVisible && !tgtVisible) {
        linkElements[lk].setAttribute('opacity', '0');
        continue;
      }

      var zNormSrc = (src.z2 + RADIUS) / (2 * RADIUS);
      var zNormTgt = (tgt.z2 + RADIUS) / (2 * RADIUS);
      var avgZ = (zNormSrc + zNormTgt) / 2;
      var baseOp = l.type === 'track' ? 0.35 : 0.12;
      var linkOp = baseOp * (0.1 + avgZ * 0.9);

      if (hoverHighlight || selectHighlight) {
        linkOp = Math.min(1, linkOp * 3);
      }

      linkElements[lk].setAttribute('x1', String(src.x2));
      linkElements[lk].setAttribute('y1', String(src.y2));
      linkElements[lk].setAttribute('x2', String(tgt.x2));
      linkElements[lk].setAttribute('y2', String(tgt.y2));
      linkElements[lk].setAttribute('opacity', String(Math.max(0, Math.min(1, linkOp))));
    }

    // Draw nodes (back to front)
    for (var pi = 0; pi < projected.length; pi++) {
      var item = projected[pi];
      var nd = item.node;
      var idx = item.index;
      var visible = !filteredGenre || nd.genre === filteredGenre;
      var isHovered = hoveredNode && nd.id === hoveredNode.id;
      var isSelected = selectedNode && nd.id === selectedNode.id;
      var isConnected = false;

      if (hoveredNode) {
        for (var ci = 0; ci < links.length; ci++) {
          if ((links[ci].source === hoveredNode.id && links[ci].target === nd.id) ||
              (links[ci].target === hoveredNode.id && links[ci].source === nd.id)) {
            isConnected = true;
            break;
          }
        }
      }

      if (selectedNode) {
        for (var ci2 = 0; ci2 < links.length; ci2++) {
          if ((links[ci2].source === selectedNode.id && links[ci2].target === nd.id) ||
              (links[ci2].target === selectedNode.id && links[ci2].source === nd.id)) {
            isConnected = true;
            break;
          }
        }
      }

      var zNorm = (nd.z2 + RADIUS) / (2 * RADIUS);
      var nodeOpacity = 0.1 + zNorm * 0.9;
      var nodeScale = 0.6 + (nd.scale - 0.75) * 2.0;
      var r = (3 + Math.min(5, nd.trackConnections * 0.15)) * nodeScale;

      if (!visible) {
        nodeOpacity = 0;
      } else if (isHovered || isSelected) {
        nodeOpacity = 1;
        r *= 1.3;
      } else if (hoveredNode || selectedNode) {
        if (isConnected) {
          nodeOpacity = Math.max(0.7, nodeOpacity);
        } else {
          nodeOpacity *= 0.2;
        }
      }

      nodeElements[idx].setAttribute('cx', String(nd.x2));
      nodeElements[idx].setAttribute('cy', String(nd.y2));
      nodeElements[idx].setAttribute('r', String(Math.max(1, r)));
      nodeElements[idx].setAttribute('opacity', String(Math.max(0, Math.min(1, nodeOpacity))));

      // Label
      var labelOp = 0;
      if (isHovered || isSelected) {
        labelOp = 1;
      } else if ((hoveredNode && isConnected) || (selectedNode && isConnected)) {
        labelOp = 0.7;
      } else if (!hoveredNode && !selectedNode && zNorm > 0.6) {
        labelOp = (zNorm - 0.6) * 1.5;
      }

      if (!visible) labelOp = 0;

      labelElements[idx].setAttribute('x', String(nd.x2));
      labelElements[idx].setAttribute('y', String(nd.y2 - r - 4));
      labelElements[idx].setAttribute('opacity', String(Math.max(0, Math.min(1, labelOp))));
    }
  }

  // ─── Animation Loop ───────────────────────────────────────────────────────

  function animate() {
    if (autoRotate && !isDragging) {
      targetRotY += 0.002;
      targetRotX = 0.35 + Math.sin(Date.now() / 5000) * 0.08;
    }

    rotX += (targetRotX - rotX) * 0.08;
    rotY += (targetRotY - rotY) * 0.08;

    render();
    requestAnimationFrame(animate);
  }

  // ─── Interactions ─────────────────────────────────────────────────────────

  function setupInteractions() {
    // Hover and click on nodes
    nodeGroup.addEventListener('mousemove', function(e) {
      var target = e.target;
      if (target.tagName === 'circle') {
        var idx = nodeElements.indexOf(target);
        if (idx >= 0) {
          hoveredNode = nodes[idx];
          showTooltip(e, hoveredNode);
          autoRotate = false;
          target.style.cursor = 'pointer';
        }
      } else {
        hoveredNode = null;
        hideTooltip();
        if (!isDragging) autoRotate = true;
      }
    });

    nodeGroup.addEventListener('mouseleave', function() {
      hoveredNode = null;
      hideTooltip();
      if (!isDragging) autoRotate = true;
    });

    nodeGroup.addEventListener('click', function(e) {
      var target = e.target;
      if (target.tagName === 'circle') {
        var idx = nodeElements.indexOf(target);
        if (idx >= 0) {
          selectedNode = nodes[idx];
          showSidePanel(selectedNode);
        }
      }
    });

    // Drag to rotate
    svg.addEventListener('mousedown', function(e) {
      if (e.target.tagName === 'circle') return;
      isDragging = true;
      autoRotate = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragStartRotX = targetRotX;
      dragStartRotY = targetRotY;
      e.preventDefault();
    });

    window.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var dx = e.clientX - dragStartX;
      var dy = e.clientY - dragStartY;
      targetRotY = dragStartRotY + dx * 0.005;
      targetRotX = Math.max(-1.2, Math.min(1.2, dragStartRotX + dy * 0.005));
    });

    window.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        autoRotate = true;
      }
    });

    // Touch support
    svg.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        isDragging = true;
        autoRotate = false;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        dragStartRotX = targetRotX;
        dragStartRotY = targetRotY;
      }
    }, { passive: true });

    svg.addEventListener('touchmove', function(e) {
      if (!isDragging || e.touches.length !== 1) return;
      var dx = e.touches[0].clientX - dragStartX;
      var dy = e.touches[0].clientY - dragStartY;
      targetRotY = dragStartRotY + dx * 0.005;
      targetRotX = Math.max(-1.2, Math.min(1.2, dragStartRotX + dy * 0.005));
    }, { passive: true });

    svg.addEventListener('touchend', function() {
      if (isDragging) {
        isDragging = false;
        autoRotate = true;
      }
    });

    // Reset button
    var resetBtn = document.getElementById('resetViewBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        targetRotX = 0.35;
        targetRotY = 0;
        autoRotate = true;
        selectedNode = null;
        hoveredNode = null;
        hideTooltip();
        hideSidePanel();
      });
    }

    // Close panel button
    var closeBtn = document.getElementById('infoClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        selectedNode = null;
        hideSidePanel();
      });
    }
  }

  // ─── Tooltip ──────────────────────────────────────────────────────────────

  var tooltipEl = null;

  function showTooltip(e, node) {
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'sphere-tooltip';
      tooltipEl.style.cssText = 'position:fixed;pointer-events:none;z-index:1000;background:rgba(0,0,0,0.9);border:1px solid rgba(255,77,0,0.3);border-radius:8px;padding:8px 12px;color:white;font-size:12px;font-family:Inter,sans-serif;max-width:200px;box-shadow:0 4px 20px rgba(0,0,0,0.5);';
      document.body.appendChild(tooltipEl);
    }

    var html = '<div style="font-weight:600;margin-bottom:2px;">' + node.name + '</div>';
    html += '<div style="color:rgba(255,255,255,0.6);">' + node.genre + '</div>';
    if (node.connections > 0) {
      html += '<div style="color:rgba(255,255,255,0.5);margin-top:2px;">' + node.connections + ' connections</div>';
    }

    tooltipEl.innerHTML = html;
    tooltipEl.style.display = 'block';
    tooltipEl.style.left = (e.clientX + 12) + 'px';
    tooltipEl.style.top = (e.clientY - 8) + 'px';
  }

  function hideTooltip() {
    if (tooltipEl) {
      tooltipEl.style.display = 'none';
    }
  }

  // ─── Side Panel ───────────────────────────────────────────────────────────

  function showSidePanel(node) {
    var panel = document.getElementById('networkInfo');
    if (!panel) return;

    var conns = [];
    links.forEach(function(l) {
      if (l.source === node.id) {
        conns.push({ dj: nodeMap[l.target], type: l.type });
      } else if (l.target === node.id) {
        conns.push({ dj: nodeMap[l.source], type: l.type });
      }
    });

    var html = '';
    if (node.image) {
      html += '<img src="' + node.image + '" alt="' + node.name + '" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;margin-bottom:12px;">';
    }
    html += '<h3 style="margin:0 0 4px;color:#ff4d00;">' + node.name + '</h3>';
    html += '<div style="color:rgba(255,255,255,0.6);margin-bottom:12px;">' + node.genre + '</div>';

    if (conns.length > 0) {
      html += '<div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:6px;">CONNECTIONS (' + conns.length + ')</div>';
      html += '<div style="max-height:300px;overflow-y:auto;">';
      conns.forEach(function(c) {
        var typeIcon = c.type === 'track' ? '♪' : '🎤';
        var typeColor = c.type === 'track' ? '#ff4d00' : '#42a5f5';
        html += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">';
        html += '<span style="color:' + typeColor + ';font-size:14px;">' + typeIcon + '</span>';
        html += '<span style="color:white;font-size:12px;">' + (c.dj ? c.dj.name : 'Unknown') + '</span>';
        html += '<span style="color:rgba(255,255,255,0.3);font-size:10px;margin-left:auto;">' + c.type + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    html += '<a href="dj-library.html" style="display:inline-block;margin-top:12px;color:#ff4d00;text-decoration:none;font-size:12px;font-weight:600;">Ver en DJ Library →</a>';

    panel.innerHTML = html;
    panel.style.display = 'block';
    panel.classList.add('visible');
  }

  function hideSidePanel() {
    var panel = document.getElementById('networkInfo');
    if (panel) {
      panel.classList.remove('visible');
      panel.style.display = 'none';
    }
  }

  // ─── Genre Legend ──────────────────────────────────────────────────────────

  function buildGenreLegend() {
    var legendEl = document.getElementById('genreLegend');
    if (!legendEl) return;

    var genreCounts = {};
    nodes.forEach(function(n) {
      genreCounts[n.genre] = (genreCounts[n.genre] || 0) + 1;
    });

    var html = '';
    Object.keys(genreCounts).sort(function(a, b) {
      return genreCounts[b] - genreCounts[a];
    }).forEach(function(genre) {
      var color = GENRE_COLORS[genre] || GENRE_COLORS.Unknown;
      var count = genreCounts[genre];
      var isActive = filteredGenre === genre;
      html += '<div class="genre-dot' + (isActive ? ' active' : '') + '" data-genre="' + genre + '" style="display:inline-flex;align-items:center;gap:4px;margin:2px 6px;cursor:pointer;opacity:' + (isActive || !filteredGenre ? '1' : '0.3') + ';">';
      html += '<span style="width:8px;height:8px;border-radius:50%;background:' + color + ';display:inline-block;"></span>';
      html += '<span style="color:white;font-size:10px;">' + genre + ' (' + count + ')</span>';
      html += '</div>';
    });

    legendEl.innerHTML = html;

    // Click to filter
    legendEl.querySelectorAll('.genre-dot').forEach(function(dot) {
      dot.addEventListener('click', function() {
        var genre = this.getAttribute('data-genre');
        if (filteredGenre === genre) {
          filteredGenre = null;
        } else {
          filteredGenre = genre;
        }
        buildGenreLegend();
        updateStats();
      });
    });
  }

  // ─── Stats ────────────────────────────────────────────────────────────────

  function updateStats() {
    var statDJs = document.getElementById('statDJs');
    var statConns = document.getElementById('statConns');
    var statVis = document.getElementById('statVis');
    var statFromTracklists = document.getElementById('statFromTracklists');
    var statArtistBridges = document.getElementById('statArtistBridges');

    var trackConnCount = 0;
    var artistConnCount = 0;
    links.forEach(function(l) {
      if (l.type === 'track') trackConnCount++;
      else artistConnCount++;
    });

    var visibleCount = filteredGenre
      ? nodes.filter(function(n) { return n.genre === filteredGenre; }).length
      : nodes.length;

    if (statDJs) statDJs.textContent = nodes.length;
    if (statConns) statConns.textContent = links.length;
    if (statVis) statVis.textContent = visibleCount;
    if (statFromTracklists) statFromTracklists.textContent = trackConnCount;
    if (statArtistBridges) statArtistBridges.textContent = artistConnCount;
  }

  // ─── Resize ───────────────────────────────────────────────────────────────

  function onResize() {
    if (!container || !svg) return;
    w = container.clientWidth;
    h = container.clientHeight;
    RADIUS = Math.min(w, h) * 0.38;
    svg.setAttribute('width', String(w));
    svg.setAttribute('height', String(h));
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    relaxPositions();
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  async function init() {
    container = document.getElementById('network-container');
    svg = document.getElementById('sphere-svg');
    if (!container || !svg) return;

    w = container.clientWidth;
    h = container.clientHeight;
    RADIUS = Math.min(w, h) * 0.38;
    svg.setAttribute('width', String(w));
    svg.setAttribute('height', String(h));
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);

    await loadData();
    relaxPositions();
    createSVGElements();
    setupInteractions();
    buildGenreLegend();
    updateStats();
    animate();

    window.addEventListener('resize', onResize);
  }

  window.Muntaner336.init3DBrain = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
