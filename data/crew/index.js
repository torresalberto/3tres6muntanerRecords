const CREW_MEMBERS = [
  {
    id: 'carl-cox',
    name: 'Carl Cox',
    role: 'Co-fundador & Resident',
    bio: 'Pionero del techno y house, con más de 30 años girando vinilos en las mejores pistas del mundo.',
    image: 'https://i.ytimg.com/vi/vy-k0FopsmY/hqdefault.jpg',
    social: {
      instagram: 'https://instagram.com/carlcox',
      soundcloud: 'https://soundcloud.com/carlcox',
    },
    genre: 'Techno',
    location: 'Barcelona',
  },
  {
    id: 'richie-hawtin',
    name: 'Richie Hawtin',
    role: 'Co-fundador & Productor',
    bio: 'Maestro del minimal techno y fundador de plastik Recordings. Su curaduría define la voz underground.',
    image: 'https://i.ytimg.com/vi/Pl5d5U5r0dI/hqdefault.jpg',
    social: {
      instagram: 'https://instagram.com/richiehawtin',
      soundcloud: 'https://soundcloud.com/richiehawtin',
    },
    genre: 'Minimal Techno',
    location: 'Barcelona',
  },
  {
    id: 'laurent-garnier',
    name: 'Laurent Garnier',
    role: 'Co-fundador & DJ',
    bio: 'Conductor de sets épicos desde Berlín hasta Ciudad de México. Su playlist selection es impecable.',
    image: 'https://i.ytimg.com/vi/5r9kD5d0VhI/hqdefault.jpg',
    social: {
      instagram: 'https://instagram.com/laurentgarnier',
      soundcloud: 'https://soundcloud.com/laurentgarnier',
    },
    genre: 'House',
    location: 'Barcelona',
  },
  {
    id: 'honey-dijon',
    name: 'Honey Dijon',
    role: 'Co-fundador & DJ',
    bio: 'Conexión directa entre la escena Detroit y la comunidad mexicana. Sets que elevan la energía.',
    image: 'https://i.ytimg.com/vi/5h5h5h5h5h5/hqdefault.jpg',
    social: {
      instagram: 'https://instagram.com/honeydijon',
      soundcloud: 'https://soundcloud.com/honeydijon',
    },
    genre: 'House',
    location: 'Mexico City',
  },
  {
    id: 'd-mfrutis',
    name: 'd.mfrutis',
    role: 'Piloto & Fundador',
    bio: 'Primer miembro del crew. Especialista en selections underground y vinilos de alta calidad.',
    image: 'https://i.scdn.co/image/ab67616d0000b273e1f3c2e3e3e3e3e3e3e3e3e3e',
    social: {
      instagram: 'https://instagram.com/d.mfrutis',
      soundcloud: 'https://soundcloud.com/d_frutis',
    },
    genre: 'Underground',
    location: 'Barcelona',
    isPilot: true,
    crewPage: 'https://3tres6records.albto.me/crew/d-mfrutis/',
  },
];

function renderCrewGrid() {
  const container = document.getElementById('crewGrid');
  if (!container) return;

  const searchInput = document.getElementById('crewSearch');
  let filteredMembers = CREW_MEMBERS;

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const query = this.value.toLowerCase().trim();
      filteredMembers = CREW_MEMBERS.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.role.toLowerCase().includes(query) ||
          m.genre.toLowerCase().includes(query)
      );
      renderCrewGrid();
    });
  }

  if (filteredMembers.length === 0) {
    container.innerHTML =
      '<div style="text-align:center;color:rgba(255,255,255,0.4);padding:2rem;">No se encontraron miembros en el crew.</div>';
    return;
  }

  container.innerHTML = filteredMembers
    .map(
      (member) => `
    <div class="dj-card" style="margin-bottom:2rem;">
      <div style="display:flex;gap:1.5rem;align-items:flex-start;">
        <div style="width:120px;height:120px;border-radius:12px;overflow:hidden;background:#111;position:relative;">
          <img src="${member.image}" alt="${member.name}" style="width:100%;height:100%;object-fit:cover;" 
               onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%20100%20100%27%3E%3Crect%20fill=%27%23111%27%20width=%27100%27%20height=%27100%27/%3E%3Ctext%20fill=%27%23ff4d00%27%20x=%2750%27%20y=%2755%27%20text-anchor=%27middle%27%20font-size=%2740%27%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E'"/>
          ${member.isPilot ? '<span style="position:absolute;top:8px;right:8px;background:#ff4d00;color:#fff;font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600;">Piloto</span>' : ''}
        </div>
        <div style="flex:1;">
          <h3 style="margin:0 0 0.5rem 0;color:#ff4d00;">${member.name}</h3>
          <p style="color:rgba(255,255,255,0.6);font-size:0.9rem;margin:0 0 0.75rem;">${member.role}</p>
          <p style="color:rgba(255,255,255,0.7);font-size:0.85rem;line-height:1.5;margin:0 0 1rem;">${member.bio}</p>
          <div style="display:flex;gap:1rem;flex-wrap:wrap;">
            <span style="font-size:0.8rem;color:#ff4d00;background:rgba(255,77,0,0.1);padding:4px 8px;border-radius:4px;">${member.genre}</span>
            <span style="font-size:0.8rem;color:#888;background:rgba(255,255,255,0.05);padding:4px 8px;border-radius:4px;">📍 ${member.location}</span>
          </div>
          <div style="display:flex;gap:1rem;margin-top:1rem;">
            <a href="${member.crewPage || '../dj/' + member.id + '.html'}" class="subnav-tab" style="display:inline-block;">Ver página →</a>
            <a href="3d-brain.html" style="display:inline-block;color:#ff4d00;font-size:0.85rem;text-decoration:none;">Ver en Neural →</a>
          </div>
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', function () {
  renderCrewGrid();
});

window.Muntaner336 = window.Muntaner336 || {};
window.Muntaner336.crew = { CREW_MEMBERS, renderCrewGrid };
