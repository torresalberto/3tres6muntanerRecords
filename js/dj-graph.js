/**
 * DJ Relationship Graph — D3.js Force-Directed View
 * Shows connections between DJs, sets, and shared tracks
 * Inspired by Obsidian mind map / graph view
 */
const DJGraph = {
  graphData: null,

  init: async function() {
    await this.loadData();
    if (this.graphData && this.graphData.nodes.length > 0) {
      this.renderGraph();
    } else {
      document.getElementById('djGraphContainer').innerHTML = '<div class="graph-placeholder"><span class="graph-icon">\ud83d\udd0d</span><h3>M\u00e1s datos necesarios</h3><p>El grafo aparecer\u00e1 cuando haya m\u00e1s DJs y tracks interconectados en la biblioteca.</p></div>';
    }
  },

  loadData: async function() {
    try {
      const idxRes = await fetch('/data/djs/index.json');
      const idx = await idxRes.json();
      const djs = idx.djs || [];

      // Build nodes and edges from DJ + set data
      const nodes = [];
      const edges = [];
      const nodeMap = {};
      let nodeId = 0;

      djs.forEach(dj => {
        // DJ node
        const djNodeId = 'dj_' + dj.id;
        nodes.push({
          id: djNodeId,
          label: dj.name,
          type: 'dj',
          genres: dj.genres.slice(0, 3).join(', '),
          image: dj.image
        });
        nodeMap[dj.id] = djNodeId;

        // Set nodes + edges
        (dj.sets || []).forEach(setId => {
          const setNodeId = 'set_' + setId;
          nodes.push({
            id: setNodeId,
            label: setId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).slice(0, 40),
            type: 'set',
            parent: dj.id
          });
          edges.push({ source: djNodeId, target: setNodeId });
        });
      });

      // Try to load track registry for cross-DJ track connections
      try {
        const trackRes = await fetch('/data/djs/tracks/track-registry.json');
        const trackData = await trackRes.json();
        const tracks = trackData.tracks || [];

        tracks.forEach(track => {
          if (!track.played_by || track.played_by.length < 2) return;
          // Track connects multiple DJs
          track.played_by.forEach(djId => {
            if (nodeMap[djId]) {
              const trackNodeId = 'track_' + track.id;
              if (!nodes.find(n => n.id === trackNodeId)) {
                nodes.push({
                  id: trackNodeId,
                  label: track.title + ' - ' + track.artist,
                  type: 'track',
                  requests: track.request_count || 0
                });
              }
              edges.push({ source: nodeMap[djId], target: trackNodeId });
            }
          });
        });
      } catch(e) { /* Track registry not ready yet */ }

      this.graphData = { nodes, edges };
    } catch(e) {
      console.warn('Graph data load error:', e);
      this.graphData = { nodes: [], edges: [] };
    }
  },

  renderGraph: function() {
    const container = document.getElementById('djGraphContainer');
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = 550;

    container.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.background = 'transparent';
    container.appendChild(svg);

    // Load D3.js from CDN
    if (typeof d3 === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://d3js.org/d3.v7.min.js';
      script.onload = () => this.buildForceGraph(svg, width, height);
      document.head.appendChild(script);
    } else {
      this.buildForceGraph(svg, width, height);
    }
  },

  buildForceGraph: function(svg, width, height) {
    const data = this.graphData;
    if (!data || data.nodes.length === 0) return;

    const g = svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));

    // Zoom
    svg.appendChild(g);
    const zoom = d3.zoom().scaleExtent([0.3, 3]).on('zoom', (event) => {
      g.setAttribute('transform', event.transform);
    });
    d3.select(svg).call(zoom);

    // Colors
    const colorMap = { dj: '#ff4d00', set: '#7c4dff', track: '#00bcd4' };
    const sizeMap = { dj: 22, set: 10, track: 6 };

    // Simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.edges).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(d => sizeMap[d.type] + 8));

    // Edges
    const link = d3.select(g).selectAll('line')
      .data(data.edges).enter().append('line')
      .attr('stroke', 'rgba(255,255,255,0.08)')
      .attr('stroke-width', 1.5);

    // Nodes
    const node = d3.select(g).selectAll('g')
      .data(data.nodes).enter().append('g')
      .call(d3.drag()
        .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    // Node circles
    node.append('circle')
      .attr('r', d => sizeMap[d.type])
      .attr('fill', d => colorMap[d.type])
      .attr('opacity', d => d.type === 'dj' ? 0.9 : 0.6)
      .attr('stroke', d => d.type === 'dj' ? '#fff' : 'transparent')
      .attr('stroke-width', d => d.type === 'dj' ? 2 : 0);

    // Node labels
    node.append('text')
      .text(d => d.label.length > 20 ? d.label.slice(0, 18) + '...' : d.label)
      .attr('x', d => d.type === 'dj' ? 28 : 14)
      .attr('y', 4)
      .attr('fill', d => d.type === 'dj' ? '#fff' : 'rgba(255,255,255,0.5)')
      .attr('font-size', d => d.type === 'dj' ? 13 : 10)
      .attr('font-weight', d => d.type === 'dj' ? 700 : 400)
      .attr('font-family', 'Space Grotesk, sans-serif')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 1px 3px rgba(0,0,0,0.8)');

    // Title tooltips
    node.append('title').text(d => d.label + (d.genres ? ' \n' + d.genres : ''));

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Legend
    const legend = [
      { label: 'DJ', color: '#ff4d00', size: 10 },
      { label: 'Set', color: '#7c4dff', size: 7 },
      { label: 'Track', color: '#00bcd4', size: 5 }
    ];

    const legendG = d3.select(svg).append('g')
      .attr('transform', `translate(${width - 140}, 20)`);

    legend.forEach((l, i) => {
      const row = legendG.append('g').attr('transform', `translate(0, ${i * 22})`);
      row.append('circle').attr('r', l.size).attr('fill', l.color).attr('opacity', 0.8);
      row.append('text')
        .attr('x', 16).attr('y', 4)
        .text(l.label)
        .attr('fill', 'rgba(255,255,255,0.6)')
        .attr('font-size', 11)
        .attr('font-family', 'Space Grotesk, sans-serif');
    });

    // Instructions
    const instructions = d3.select(svg).append('text')
      .attr('x', 20).attr('y', height - 15)
      .text('Arrastra los nodos \u2022 Rueda para zoom')
      .attr('fill', 'rgba(255,255,255,0.2)')
      .attr('font-size', 11)
      .attr('font-family', 'Space Grotesk, sans-serif');
  }
};

document.addEventListener('DOMContentLoaded', () => DJGraph.init());
