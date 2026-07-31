// d.mfrutis site — data-driven renderer.
// Consumes: data/design-brief.json, data/tracks.json, data/manifest.json

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

const SC_WIDGET = (url, auto = true) =>
  `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}` +
  `&color=%23e8643c&auto_play=${auto}&hide_related=true&show_comments=false` +
  `&show_user=true&show_reposts=false&show_teaser=false&visual=false`;

async function loadJSON(path, fallback) {
  try {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } catch (e) {
    console.warn(`loadJSON failed: ${path}`, e.message);
    return fallback;
  }
}

// ---- Design brief -> CSS variables ----
function applyBrief(brief) {
  const root = document.documentElement.style;
  const p = brief.palette || {};
  if (p.bg) root.setProperty("--bg", p.bg);
  if (p.bg2) root.setProperty("--bg-2", p.bg2);
  if (p.fg) root.setProperty("--fg", p.fg);
  if (p.accent) root.setProperty("--accent", p.accent);
  if (p.accent2) root.setProperty("--accent-2", p.accent2);
  if (p.muted) root.setProperty("--muted", p.muted);
  if (p.display) root.setProperty("--font-display", p.display);
  if (p.body) root.setProperty("--font-body", p.body);

  if (brief.artist_name) $("#heroName").textContent = brief.artist_name;
  if (brief.tagline) $("#heroTag").textContent = brief.tagline;
  if (brief.eyebrow) $("#heroEyebrow").textContent = brief.eyebrow;
  if (brief.site_title) document.title = brief.site_title;
  document.body.dataset.mood = brief.mood || "unknown";
}

// ---- Mini player ----
const mini = $("#miniPlayer");
const miniWidget = $("#miniWidget");
$("#miniClose").addEventListener("click", () => { mini.hidden = true; miniWidget.src = ""; });

function playTrack(url) {
  mini.hidden = false;
  miniWidget.src = SC_WIDGET(url, true);
  mini.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ---- Music ----
function renderTracks(tracks) {
  const grid = $("#trackGrid");
  grid.innerHTML = "";
  if (!tracks || !tracks.length) {
    grid.appendChild(el("p", "muted", "No tracks loaded yet — connect SoundCloud."));
    return;
  }
  tracks.forEach((t) => {
    const card = el("div", "track-card");
    const thumb = el("div", "track-thumb");
    if (t.thumbnail) thumb.appendChild(el("img")).src = t.thumbnail;
    else thumb.textContent = "♪";
    const body = el("div", "track-body");
    body.appendChild(el("div", "track-title", t.title || "Untitled"));
    body.appendChild(el("div", "track-meta", t.author || "SoundCloud"));
    const play = el("button", "track-play", "▶ Play");
    play.addEventListener("click", () => playTrack(t.url));
    body.appendChild(play);
    card.append(thumb, body);
    grid.appendChild(card);
  });
}

// ---- Gallery ----
function renderGallery(files) {
  const g = $("#gallery");
  const collage = $("#heroCollage");
  g.innerHTML = "";
  collage.innerHTML = "";
  (files || []).forEach((f) => {
    const fig = el("figure");
    const img = el("img");
    img.src = `assets/ig/${f}`;
    img.alt = "d.mfrutis";
    img.loading = "lazy";
    fig.appendChild(img);
    g.appendChild(fig);
    const c = el("img");
    c.src = `assets/ig/${f}`;
    c.alt = "";
    c.loading = "lazy";
    collage.appendChild(c);
  });
}

// ---- Boot ----
(async function init() {
  const [brief, tracksData, manifest] = await Promise.all([
    loadJSON("data/design-brief.json", {}),
    loadJSON("data/tracks.json", { tracks: [] }),
    loadJSON("data/manifest.json", { images: [] }),
  ]);
  applyBrief(brief);
  renderTracks(tracksData.tracks);
  renderGallery(manifest.images);
})();
