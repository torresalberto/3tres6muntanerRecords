/**
 * DJ Relationship Graph — D3.js Force-Directed View
 * Shows connections between DJs via shared tracks, artists, genres, and festivals
 */
const DJGraph = {
  graphData: null,

  init: async function() {
    await this.loadData();
    if (this.graphData && this.graphData.nodes.length > 0) {
      this.renderGraph();
    } else {
      const el = document.getElementById('djGraphContainer');
      if (el) el.innerHTML = '<div class="graph-placeholder" style="display:flex;align-items:center;justify-content:center;height:500px"><div style="text-align:center;color:rgba(255,255,255,0.2)"><div style="font-size:3rem;margin-bottom:0.5rem">\ud83d\udd0d</div><h3 style="color:rgba(255,255,255,0.3)">Loading...</h3></div></div>';
    }
  },

  loadData: async function() {
    try {
      const idxRes = await fetch('/data/djs/index.json');
      const idx = await idxRes.json();
      const djs = idx.djs || [];

      const nodes = [], edges = [];
      const nodeMap = {};

      // DJ nodes
      djs.forEach(dj => {
        const nid = 'dj_' + dj.id;
        nodes.push({ id: nid, label: dj.name, type: 'dj', genres: (dj.genres || []).join(', '), image: dj.image });
        nodeMap[dj.id] = nid;
      });

      // Set nodes + DJ→Set edges
      djs.forEach(dj => {
        (dj.sets || []).forEach(setId => {
          const sid = 'set_' + setId;
          nodes.push({ id: sid, label: setId.replace(/-/g, ' ').replace(/\b\w/g,l=>l.toUpperCase()).slice(0,40), type: 'set', parent: dj.id });
          edges.push({ source: nodeMap[dj.id], target: sid, type: 'dj-set' });
        });
      });

      // Track registry — exact track overlaps
      try {
        const trRes = await fetch('/data/djs/tracks/track-registry.json');
        const tr = await trRes.json();

        // Group tracks by played_by for cross-DJ connections
        const artistDJs = {};
        tr.tracks.forEach(track => {
          // Track→DJ edges
          track.played_by.forEach(djId => {
            if (nodeMap[djId]) {
              const tid = 'tr_' + track.id;
              if (!nodes.find(n => n.id === tid)) {
                nodes.push({ id: tid, label: (track.title || '').slice(0,35), artist: track.artist, type: 'track' });
              }
              edges.push({ source: nodeMap[djId], target: tid, type: 'track' });
            }

            // Same-ARTIST connections across DJs
            const artist = track.artist || '';
            if (artist && !artist.includes('Unknown')) {
              if (!artistDJs[artist]) artistDJs[artist] = new Set();
              artistDJs[artist].add(djId);
            }
          });
        });

        // Create ARTIST nodes shared by 2+ DJs
        Object.entries(artistDJs).forEach(([artist, djsSet]) => {
          const djsArr = Array.from(djsSet);
          if (djsArr.length >= 2) {
            const aid = 'artist_' + artist.replace(/[^a-zA-Z0-9]/g, '_').slice(0,40);
            if (!nodes.find(n => n.id === aid)) {
              nodes.push({ id: aid, label: artist, type: 'artist' });
            }
            djsArr.forEach(djId => {
              if (nodeMap[djId]) {
                edges.push({ source: nodeMap[djId], target: aid, type: 'artist' });
              }
            });
          }
        });

        // Festival connections — same festival = connection
        const festivalMap = {};
        djs.forEach(dj => {
          (dj.sets || []).forEach(setId => {
            const festMatch = setId.match(/dekmantel/i);
            if (festMatch) {
              if (!festivalMap['Dekmantel']) festivalMap['Dekmantel'] = new Set();
              festivalMap['Dekmantel'].add(dj.id);
            }
            if (setId.includes('boiler-room') || setId.includes('br-')) {
              if (!festivalMap['Boiler Room']) festivalMap['Boiler Room'] = new Set();
              festivalMap['Boiler Room'].add(dj.id);
            }
            if (setId.includes('ballantine') || setId.includes('ballantines')) {
              if (!festivalMap["Ballantine's True Music"]) festivalMap["Ballantine's True Music"] = new Set();
              festivalMap["Ballantine's True Music"].add(dj.id);
            }
          });
        });

        Object.entries(festivalMap).forEach(([fest, djsSet]) => {
          const djsArr = Array.from(djsSet);
          if (djsArr.length >= 2) {
            const fid = 'fest_' + fest.replace(/[^a-zA-Z0-9]/g, '_');
            if (!nodes.find(n => n.id === fid)) {
              nodes.push({ id: fid, label: fest, type: 'festival' });
            }
            djsArr.forEach(djId => {
              if (nodeMap[djId]) {
                edges.push({ source: nodeMap[djId], target: fid, type: 'festival' });
              }
            });
          }
        });
      } catch(e) { console.warn('Track registry load error:', e); }

      this.graphData = { nodes, edges };
    } catch(e) {
      console.warn('Graph load error:', e);
      this.graphData = { nodes: [], edges: [] };
    }
  },

  renderGraph: function() {
    const container = document.getElementById('djGraphContainer');
    if (!container || !this.graphData || this.graphData.nodes.length === 0) return;

    const width = container.clientWidth || 900, height = 550;
    container.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width); svg.setAttribute('height', height);
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.style.background = 'transparent';
    container.appendChild(svg);

    if (typeof d3 === 'undefined') {
      const s = document.createElement('script');
      s.src = 'https://d3js.org/d3.v7.min.js';
      s.onload = () => this.buildGraph(svg, width, height);
      document.head.appendChild(s);
    } else {
      this.buildGraph(svg, width, height);
    }
  },

  buildGraph: function(svg, width, height) {
    const data = this.graphData;
    if (!data || data.nodes.length === 0) return;

    const g = svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
    const zoom = d3.zoom().scaleExtent([0.3,3]).on('zoom', ev => g.setAttribute('transform', ev.transform));
    d3.select(svg).call(zoom);

    const colorMap = { dj: '#ff4d00', set: '#7c4dff', track: '#00bcd4', artist: '#ff9100', festival: '#00c864' };
    const sizeMap = { dj: 20, set: 8, track: 5, artist: 12, festival: 14 };
    const edgeStyles = { 'dj-set': '#7c4dff', track: '#00bcd4', artist: '#ff9100', festival: '#00c864' };

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.edges).id(d => d.id).distance(d => d.type === 'artist' ? 150 : 100))
      .force('charge', d3.forceManyBody().strength(-250))
      .force('center', d3.forceCenter(width/2, height/2))
      .force('collision', d3.forceCollide(d => sizeMap[d.type] + 5));

    const link = d3.select(g).selectAll('line').data(data.edges).enter().append('line')
      .attr('stroke', d => edgeStyles[d.type] || 'rgba(255,255,255,0.06)')
      .attr('stroke-width', d => d.type === 'artist' ? 1.5 : 1)
      .attr('stroke-dasharray', d => d.type === 'artist' ? '4,3' : d.type === 'festival' ? '2,4' : '')
      .attr('opacity', d => d.type === 'artist' ? 0.5 : 0.15);

    const node = d3.select(g).selectAll('g').data(data.nodes).enter().append('g')
      .call(d3.drag()
        .on('start', (ev,d) => { if(!ev.active) simulation.alphaTarget(0.3).restart(); d.fx=d.x; d.fy=d.y; })
        .on('drag', (ev,d) => { d.fx=ev.x; d.fy=ev.y; })
        .on('end', (ev,d) => { if(!ev.active) simulation.alphaTarget(0); d.fx=null; d.fy=null; }));

    node.append('circle')
      .attr('r', d => sizeMap[d.type])
      .attr('fill', d => colorMap[d.type])
      .attr('opacity', d => d.type === 'dj' ? 0.9 : 0.5)
      .attr('stroke', d => d.type === 'dj' ? '#fff' : 'transparent')
      .attr('stroke-width', d => d.type === 'dj' ? 2 : 0);

    node.append('text')
      .text(d => d.label.length > 22 ? d.label.slice(0,20)+'...' : d.label)
      .attr('x', d => d.type === 'dj' ? 26 : 14)
      .attr('y', 4)
      .attr('fill', d => d.type === 'dj' ? '#fff' : 'rgba(255,255,255,0.4)')
      .attr('font-size', d => d.type === 'dj' ? 12 : 9)
      .attr('font-weight', d => d.type === 'dj' ? 700 : 400)
      .attr('font-family', 'Space Grotesk, sans-serif')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 1px 3px rgba(0,0,0,0.8)');

    node.append('title').text(d => d.label + (d.genres ? '\n' + d.genres : ''));

    simulation.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => 'translate('+d.x+','+d.y+')');
    });

    // Legend
    const legendItems = [
      { label: 'DJ', color: '#ff4d00', size: 10 },
      { label: 'Set', color: '#7c4dff', size: 7 },
      { label: 'Track', color: '#00bcd4', size: 5 },
      { label: 'Shared Artist', color: '#ff9100', size: 7, dash: '4,3' },
      { label: 'Festival', color: '#00c864', size: 8, dash: '2,4' }
    ];
    const lg = d3.select(svg).append('g').attr('transform', 'translate('+(width-160)+',15)');
    legendItems.forEach((l,i) => {
      const r = lg.append('g').attr('transform', 'translate(0,'+(i*20)+')');
      r.append('circle').attr('r', l.size).attr('fill', l.color).attr('opacity', 0.7);
      r.append('text').attr('x', 16).attr('y', 4).text(l.label)
        .attr('fill', 'rgba(255,255,255,0.5)').attr('font-size', 10).attr('font-family', 'Space Grotesk, sans-serif');
    });

    d3.select(svg).append('text').attr('x', 15).attr('y', height-15)
      .text('Drag nodes \u2022 Scroll to zoom \u2022 Orange dashed = shared artist')
      .attr('fill', 'rgba(255,255,255,0.15)').attr('font-size', 10).attr('font-family', 'Space Grotesk, sans-serif');
  }
};
document.addEventListener('DOMContentLoaded', () => DJGraph.init());
