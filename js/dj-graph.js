/**
 * DJ Relationship Graph — D3.js Force-Directed View
 * Shows connections between DJs via shared tracks.
 *
 * v2 (perf fix):
 *   - Drops per-set and per-track "noise" nodes (was 839 nodes; now ~58).
 *   - Renders only DJs (51) + shared-track connector nodes (7) for clarity.
 *   - Initializes node positions in a circle so the first frame is visible.
 *   - Uses bounded forces (forceX/forceY) to keep the layout inside the viewBox.
 */
const DJGraph = {
  graphData: null,

  init: async function () {
    const el = document.getElementById('djGraphContainer');
    if (el) {
      el.innerHTML =
        '<div class="graph-placeholder" style="display:flex;align-items:center;justify-content:center;height:500px"><div style="text-align:center;color:rgba(255,255,255,0.2)"><div style="font-size:3rem;margin-bottom:0.5rem">\ud83d\udd0d</div><h3 style="color:rgba(255,255,255,0.3)">Cargando grafo\u2026</h3></div></div>';
    }
    await this.loadData();
    if (this.graphData && this.graphData.nodes.length > 0) {
      this.renderGraph();
    } else {
      if (el) {
        el.innerHTML =
          '<div class="graph-placeholder" style="display:flex;align-items:center;justify-content:center;height:500px"><div style="text-align:center;color:rgba(255,255,255,0.2)"><div style="font-size:3rem;margin-bottom:0.5rem">\ud83d\udd17</div><h3 style="color:rgba(255,255,255,0.3);margin-bottom:0.5rem">A\u00fan no hay conexiones</h3><p style="color:rgba(255,255,255,0.2);font-size:0.9rem">Tracks compartidos entre DJs aparecer\u00e1n aqu\u00ed cuando se identifiquen.</p></div></div>';
      }
    }
  },

  loadData: async function () {
    try {
      const idxRes = await fetch('data/djs/index.json');
      const idx = await idxRes.json();
      const djs = idx.djs || [];

      const nodes = [];
      const edges = [];
      const nodeMap = {};

      // DJ nodes (the primary actors)
      djs.forEach((dj) => {
        const nid = 'dj_' + dj.id;
        nodes.push({
          id: nid,
          label: dj.name,
          type: 'dj',
          genres: (dj.genres || []).join(', '),
          image: dj.image,
        });
        nodeMap[dj.id] = nid;
      });

      // Shared-track connector nodes (only tracks played by 2+ DJs).
      // This is the key insight: shared tracks connect DJs visually.
      try {
        const trRes = await fetch('data/djs/tracks/track-registry.json');
        const tr = await trRes.json();
        tr.tracks.forEach((track) => {
          const djArr = (track.played_by || []).filter((djId) => nodeMap[djId]);
          if (djArr.length >= 2) {
            const sharedId = 'shared_' + track.id;
            const artistSuffix = track.artist ? ' \u2014 ' + track.artist : '';
            nodes.push({
              id: sharedId,
              label: ((track.title || '').slice(0, 30)) + artistSuffix,
              artist: track.artist,
              type: 'shared-track',
            });
            djArr.forEach((djId) => {
              edges.push({ source: nodeMap[djId], target: sharedId, type: 'shared-track' });
            });
          }
        });
      } catch (e) {
        console.warn('Track registry load error:', e);
      }

      this.graphData = { nodes, edges };
    } catch (e) {
      console.warn('Graph load error:', e);
      this.graphData = { nodes: [], edges: [] };
    }
  },

  renderGraph: function () {
    const container = document.getElementById('djGraphContainer');
    if (!container || !this.graphData || this.graphData.nodes.length === 0) return;

    const width = container.clientWidth || 900;
    const height = 550;
    container.innerHTML = '';

    // Initialize node positions in a circle so the first frame is visible
    // (otherwise force-many-body launches them outside the viewBox).
    // Radius reduced to 0.28 so labels (which extend ~60px right) stay inside.
    const total = this.graphData.nodes.length;
    const radius = Math.min(width, height) * 0.28;
    const labelPad = 70; // keep DJ labels visible (label is ~60px wide)
    this.graphData.nodes.forEach((n, i) => {
      const angle = (i / total) * 2 * Math.PI;
      n.x = width / 2 + Math.cos(angle) * radius;
      n.y = height / 2 + Math.sin(angle) * radius;
    });

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
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

  buildGraph: function (svg, width, height) {
    const data = this.graphData;
    if (!data || data.nodes.length === 0) return;

    const g = svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
    const zoom = d3
      .zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (ev) => g.setAttribute('transform', ev.transform));
    d3.select(svg).call(zoom);

    const colorMap = { dj: '#ff4d00', set: '#7c4dff', track: '#00bcd4', 'shared-track': '#00c864' };
    const sizeMap = { dj: 14, set: 8, track: 5, 'shared-track': 10 };
    const edgeStyles = { 'dj-set': '#7c4dff', track: '#00bcd4', 'shared-track': '#00c864' };

    // Bounded forces: weaker charge + stronger x/y gravity to keep things inside the viewBox.
    // Strength bumped 0.05 → 0.18 so the 60-node simulation actually settles inside the SVG.
    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        'link',
        d3
          .forceLink(data.edges)
          .id((d) => d.id)
          .distance(70)
          .strength(0.6)
      )
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.18))
      .force('y', d3.forceY(height / 2).strength(0.18))
      .force(
        'collision',
        d3.forceCollide((d) => sizeMap[d.type] + 8)
      );

    const link = d3
      .select(g)
      .selectAll('line')
      .data(data.edges)
      .enter()
      .append('line')
      .attr('stroke', (d) => edgeStyles[d.type] || 'rgba(255,255,255,0.06)')
      .attr('stroke-width', (d) => (d.type === 'shared-track' ? 1.5 : 1))
      .attr('stroke-dasharray', (d) =>
        d.type === 'artist' ? '4,3' : d.type === 'festival' ? '2,4' : ''
      )
      .attr('opacity', (d) => (d.type === 'shared-track' ? 0.6 : 0.2));

    const node = d3
      .select(g)
      .selectAll('g')
      .data(data.nodes)
      .enter()
      .append('g')
      .call(
        d3
          .drag()
          .on('start', (ev, d) => {
            if (!ev.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (ev, d) => {
            d.fx = ev.x;
            d.fy = ev.y;
          })
          .on('end', (ev, d) => {
            if (!ev.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    node
      .append('circle')
      .attr('r', (d) => sizeMap[d.type])
      .attr('fill', (d) => colorMap[d.type])
      .attr('opacity', (d) => (d.type === 'dj' ? 0.9 : 0.7))
      .attr('stroke', (d) => (d.type === 'dj' ? '#fff' : 'transparent'))
      .attr('stroke-width', (d) => (d.type === 'dj' ? 2 : 0));

    node
      .append('text')
      .text((d) => (d.label.length > 22 ? d.label.slice(0, 20) + '...' : d.label))
      .attr('x', (d) => (d.type === 'dj' ? 18 : 14))
      .attr('y', 4)
      .attr('fill', (d) => (d.type === 'dj' ? '#fff' : 'rgba(255,255,255,0.55)'))
      .attr('font-size', (d) => (d.type === 'dj' ? 12 : 9))
      .attr('font-weight', (d) => (d.type === 'dj' ? 700 : 400))
      .attr('font-family', 'Space Grotesk, sans-serif')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 1px 3px rgba(0,0,0,0.8)');

    node.append('title').text((d) => d.label);

    simulation.on('tick', () => {
      // Clamp every node inside the viewBox so labels (which extend ~60px right of
      // the node) never escape the SVG. Force x/y isn't strong enough on its own.
      const pad = 20;
      data.nodes.forEach((d) => {
        d.x = Math.max(pad, Math.min(width - pad, d.x));
        d.y = Math.max(pad, Math.min(height - pad, d.y));
      });
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
      node.attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')');
    });

    // Legend
    const legendItems = [
      { label: 'DJ', color: '#ff4d00', size: 9 },
      { label: 'Track compartido', color: '#00c864', size: 7 },
    ];
    const lg = d3
      .select(svg)
      .append('g')
      .attr('transform', 'translate(' + (width - 180) + ',15)');
    legendItems.forEach((l, i) => {
      const r = lg.append('g').attr('transform', 'translate(0,' + i * 20 + ')');
      r.append('circle').attr('r', l.size).attr('fill', l.color).attr('opacity', 0.8);
      r.append('text')
        .attr('x', 16)
        .attr('y', 4)
        .text(l.label)
        .attr('fill', 'rgba(255,255,255,0.5)')
        .attr('font-size', 10)
        .attr('font-family', 'Space Grotesk, sans-serif');
    });

    d3.select(svg)
      .append('text')
      .attr('x', 15)
      .attr('y', height - 15)
      .text('Arrastra nodos \u2022 Scroll para zoom \u2022 Verde = track compartido entre 2+ DJs')
      .attr('fill', 'rgba(255,255,255,0.15)')
      .attr('font-size', 10)
      .attr('font-family', 'Space Grotesk, sans-serif');
  },
};
document.addEventListener('DOMContentLoaded', () => DJGraph.init());
