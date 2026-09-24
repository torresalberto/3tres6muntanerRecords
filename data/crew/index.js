const CREW_IG = [
  { f: '001', w: 640, h: 640, alt: 'Vista al mar desde un mirador entre árboles' },
  { f: '002', w: 640, h: 360, alt: 'Cabina: Frutis vs Stevie Toth en un club' },
  { f: '003', w: 640, h: 853, alt: 'Camino de campo con una furgoneta al atardecer' },
  { f: '004', w: 640, h: 800, alt: 'Flyer RËGAL Showcase con Landeep, Victor Hugo y Frutis' },
  { f: '005', w: 640, h: 853, alt: 'Flyer Veridis Oug, viernes 10.10, con Frutis' },
  { f: '006', w: 640, h: 360, alt: 'Cabina de un club con luces rosas' },
  { f: '007', w: 640, h: 640, alt: 'Figura sentada en una plaza, blanco y negro' },
  { f: '008', w: 640, h: 1136, alt: 'Flyer Nuna Cor — Frutis b2b Felipe O' },
  {
    f: '009',
    w: 640,
    h: 640,
    alt: 'Figura caminando contra una pared de azulejos, blanco y negro',
  },
  { f: '010', w: 640, h: 1138, alt: 'Flyer Alddara con Frutis' },
  { f: '011', w: 640, h: 640, alt: 'Retrato con dos columnas antiguas y cielo nublado' },
  { f: '012', w: 572, h: 572, alt: 'Retrato en duotono azul de Frutis en la cabina' },
  { f: '013', w: 1080, h: 1080, alt: 'Flyer Savage con Frutis b2b M.S.R. y Atimen' },
  { f: '014', w: 1080, h: 1350, alt: 'Figura de espaldas en un pasillo de hormigón' },
  { f: '015', w: 1080, h: 1350, alt: 'Plato girador y mezclador con luz roja' },
  { f: '016', w: 720, h: 900, alt: 'Vinilo girando bajo un haz de luz roja' },
  { f: '017', w: 640, h: 640, alt: 'Retrato sentado en un muro de piedra' },
  { f: '018', w: 1080, h: 1350, alt: 'Techo acristalado del Louvre bajo nubes' },
  { f: '019', w: 1080, h: 1350, alt: 'Torre de televisión de Berlín entre edificios' },
  { f: '020', w: 1080, h: 1079, alt: 'Columnas antiguas contra el cielo azul' },
  { f: '021', w: 1080, h: 1078, alt: 'Cabina de DJ en una tienda de discos' },
];

const CREW_MEMBERS = [
  {
    id: 'd-mfrutis',
    name: 'd.mfrutis',
    role: 'Piloto & Fundador',
    bio: 'Primer miembro del crew. Especialista en selections underground y vinilos de alta calidad. Elige, viaja, pincha y documenta: cada vinilo que llega a México pasó antes por sus manos en Barcelona.',
    image: 'crew/d-mfrutis/assets/ig/012.jpg',
    imageCaption: 'Archivo personal · duotono',
    portrait: 'crew/d-mfrutis/assets/ig/017.jpg',
    social: {
      instagram: 'https://instagram.com/d.mfrutis',
      soundcloud: 'https://soundcloud.com/d_frutis',
    },
    location: 'Barcelona',
    isPilot: true,
    crewPage: 'crew/d-mfrutis/',
    stats: { photos: CREW_IG.length, tracks: 3, picks: 10 },
  },
];

function crewImageSrc(member, ig) {
  return 'crew/d-mfrutis/assets/ig/' + ig.f + '.jpg';
}

function crewTileClass(ig) {
  const ratio = ig.w / ig.h;
  if (ratio < 0.8) return 'crew-tile is-tall';
  if (ratio > 1.35) return 'crew-tile is-wide';
  return 'crew-tile';
}

function renderCrewGrid() {
  const container = document.getElementById('crewGrid');
  if (!container) return;

  const searchSlot = document.getElementById('crewSearchSlot');
  if (searchSlot) {
    if (CREW_MEMBERS.length > 1) {
      searchSlot.innerHTML =
        '<div class="crew-search"><input type="text" id="crewSearch" autocomplete="off" ' +
        'placeholder="Buscar en el crew…" aria-label="Buscar en el crew" /></div>';
    } else {
      searchSlot.innerHTML = '';
    }
  }

  const searchInput = document.getElementById('crewSearch');
  const query = (searchInput && searchInput.value ? searchInput.value : '').toLowerCase().trim();

  const filtered = CREW_MEMBERS.filter(
    (m) => !query || m.name.toLowerCase().includes(query) || m.role.toLowerCase().includes(query)
  );

  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = '1';
    searchInput.addEventListener('input', renderCrewGrid);
  }

  if (filtered.length === 0) {
    container.innerHTML =
      '<div class="crew-empty">Nadie en el crew coincide con esa búsqueda.</div>';
    return;
  }

  container.innerHTML = filtered
    .map((member, i) => {
      const num = String(i + 1).padStart(3, '0');
      const ig = CREW_IG[11];
      const links = [];
      if (member.crewPage) {
        links.push(`<a class="crew-link" href="${member.crewPage}" data-no-swup>Ver página →</a>`);
      }
      if (member.social && member.social.instagram) {
        links.push(
          `<a class="crew-link is-ghost" href="${member.social.instagram}" target="_blank" rel="noopener">Instagram ↗</a>`
        );
      }
      if (member.social && member.social.soundcloud) {
        links.push(
          `<a class="crew-link is-ghost" href="${member.social.soundcloud}" target="_blank" rel="noopener">SoundCloud ↗</a>`
        );
      }
      links.push('<a class="crew-link is-ghost" href="3d-brain.html">Ver en Neural →</a>');

      const chips = [
        member.isPilot ? '<span class="crew-chip is-pilot">Piloto</span>' : '',
        `<span class="crew-chip">${member.location}</span>`,
        `<span class="crew-chip">Miembro Nº ${num}</span>`,
      ].join('');

      return `
      <article class="dj-card crew-dossier-card" data-member="${member.id}">
        <figure class="crew-portrait">
          <img src="${member.portrait || member.image}" alt="Retrato de ${member.name}" width="${ig.w}" height="${ig.h}" loading="lazy" decoding="async" />
          <figcaption><span>${member.location}</span><span>${ig.f}/21</span></figcaption>
        </figure>
        <div class="crew-card-body">
          <span class="crew-card-num">Dossier · Nº ${num} — Fundador</span>
          <h3 class="crew-name">${member.name}</h3>
          <p class="crew-role">${member.role}</p>
          <p class="crew-bio">${member.bio}</p>
          <div class="crew-chips">${chips}</div>
          <div class="crew-links">${links.join('')}</div>
          <div class="crew-tracks" id="crewTracks" hidden>
            <div class="crew-tracks-title">Señal · SoundCloud</div>
          </div>
        </div>
      </article>`;
    })
    .join('');
}

function renderCrewWall() {
  const track = document.getElementById('crewWall');
  if (!track) return;

  track.innerHTML = CREW_IG.map((ig, i) => {
    const idx = String(i + 1).padStart(3, '0');
    return `
    <figure class="${crewTileClass(ig)}" style="aspect-ratio:${ig.w} / ${ig.h}">
      <span class="crew-tile-idx">${idx}</span>
      <img src="${crewImageSrc(CREW_MEMBERS[0], ig)}" alt="${ig.alt}" width="${ig.w}" height="${ig.h}" decoding="async" />
    </figure>`;
  }).join('');
}

function renderCrewTracks(tracks) {
  const box = document.getElementById('crewTracks');
  if (!box || !tracks || !tracks.length) return;
  box.hidden = false;
  box.innerHTML =
    '<div class="crew-tracks-title">Señal · SoundCloud</div>' +
    tracks
      .map(
        (t, i) => `
      <a class="crew-track" href="${t.url}" target="_blank" rel="noopener">
        <span class="crew-track-idx">${String(i + 1).padStart(2, '0')}</span>
        <img class="crew-track-art" src="${t.thumbnail}" alt="" width="42" height="42" loading="lazy" decoding="async" />
        <span class="crew-track-name">${t.title}</span>
        <span class="crew-track-go">SC ↗</span>
      </a>`
      )
      .join('');
}

function renderCrewPicks(items) {
  const box = document.getElementById('crewPicks');
  if (!box) return;
  if (!items || !items.length) {
    box.closest('[data-signal]')?.setAttribute('hidden', '');
    return;
  }
  box.innerHTML = items
    .map((item, i) => {
      const idx = String(i + 1).padStart(2, '0');
      const meta = [item.year, item.genre]
        .filter(Boolean)
        .concat(item.grade ? ['<span class="grade">' + item.grade + '</span>'] : [])
        .concat(item.price ? ['<span class="price">' + item.price + '</span>'] : []);
      return `
      <div class="crew-pick">
        <span class="crew-pick-idx">${idx}</span>
        <span class="crew-pick-title"><b>${item.title}</b><span>${item.artist || ''}</span></span>
        <span class="crew-pick-meta">${meta.join(' · ')}</span>
      </div>`;
    })
    .join('');
}

function loadCrewSignals() {
  fetch('crew/d-mfrutis/data/tracks.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => renderCrewTracks(d.tracks))
    .catch(() => {
      const box = document.getElementById('crewTracks');
      if (box) box.hidden = true;
    });

  fetch('crew/d-mfrutis/data/inventory.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => renderCrewPicks(d.items))
    .catch(() => {
      const box = document.getElementById('crewPicks');
      if (box && box.closest('[data-signal]')) box.closest('[data-signal]').hidden = true;
    });
}

function initCrewData() {
  if (!document.getElementById('crewGrid')) return;
  renderCrewGrid();
  renderCrewWall();
  loadCrewSignals();
}

window.Muntaner336 = window.Muntaner336 || {};
window.Muntaner336.crew = {
  CREW_MEMBERS,
  CREW_IG,
  renderCrewGrid,
  renderCrewWall,
  initCrewData,
};

if (typeof window.Muntaner336.onPageView === 'function') {
  window.Muntaner336.onPageView(initCrewData);
} else if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCrewData, { once: true });
} else {
  initCrewData();
}
