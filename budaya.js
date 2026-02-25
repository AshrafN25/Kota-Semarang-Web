// budaya.js
// Interaktivitas untuk budaya.html
// Fitur: smooth scroll, reveal-on-scroll, gallery lightbox (element match), hover/tilt, expandable descriptions, theme toggle

document.addEventListener('DOMContentLoaded', () => {
  try {
    initSmoothScroll();
    initRevealOnScroll();
    initGalleryInteractions();
    initExpandableDescriptions();
    initThemeToggle();
  } catch (err) {
    console.error('budaya.js error:', err);
  }
});

function initSmoothScroll(){
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', (e) => {
    const href = a.getAttribute('href'); if (!href || href === '#') return;
    const t = document.querySelector(href); if (t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth', block:'start'}); history.replaceState(null,'',href); }
  }));
}

function initRevealOnScroll(){
  const nodes = Array.from(document.querySelectorAll('.deskripsi, .gallery img, .feature-image img, .batik-item img, .event-row, .wayang-container'));
  if (!nodes.length) return;
  nodes.forEach(n => { n.style.opacity = n.style.opacity || '0'; n.style.transform = n.style.transform || 'translateY(18px)'; n.style.transition = n.style.transition || 'opacity 520ms ease, transform 520ms ease'; });
  const obs = new IntersectionObserver(entries => { entries.forEach(en => { if (en.isIntersecting){ en.target.style.opacity = '1'; en.target.style.transform = 'translateY(0)'; obs.unobserve(en.target); } }); }, { threshold: 0.12 });
  nodes.forEach(n => obs.observe(n));
}

function initGalleryInteractions(){
  const imgs = Array.from(document.querySelectorAll('.gallery img, .wrapper .gallery img, .feature-image img, .batik-item img, .event-img img, .wayang-image img'));
  if (!imgs.length) return;

  injectStyle(`
    .gallery img, .batik-item img, .wrapper .gallery img{ transition: transform .28s ease, box-shadow .28s ease, filter .2s ease; border-radius:8px; cursor:pointer }
    .gallery img:hover, .batik-item img:hover, .wrapper .gallery img:hover{ transform: scale(1.06); box-shadow:0 18px 44px rgba(0,0,0,0.22); filter:brightness(1.04) }
    .gallery img.wis-tilt, .batik-item img.wis-tilt{ will-change: transform }
  `);

  imgs.forEach(img => {
    img.classList.add('wis-tilt');
    let touching = false;
    img.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return; // keep tilt for mouse only
      const r = img.getBoundingClientRect(); const x = (e.clientX - r.left)/r.width - 0.5; const y = (e.clientY - r.top)/r.height - 0.5;
      const ry = x * 6; const rx = -y * 6; img.style.transform = `perspective(500px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
    });
    img.addEventListener('pointerleave', () => { img.style.transform = ''; img.style.transition = 'transform .3s ease'; setTimeout(()=>img.style.transition='',300); });
    img.addEventListener('click', () => openLightbox(img, buildGalleryImages()));
  });
}

function buildGalleryImages(){
  return Array.from(document.querySelectorAll('.gallery img, .wrapper .gallery img, .feature-image img, .batik-item img, .event-img img, .wayang-image img'));
}

function openLightbox(imgEl, gallery){
  const src = imgEl && imgEl.src;
  let start = gallery.findIndex(g => g === imgEl);
  if (start === -1 && src){
    try { const srcUrl = new URL(src, location.href); start = gallery.findIndex(g => { try { return new URL(g.src, location.href).href === srcUrl.href } catch { return false } }); } catch(e){}
  }
  if (start === -1 && src){ const srcName = src.split('/').pop(); start = gallery.findIndex(g => (g.src||'').split('/').pop() === srcName); }
  let idx = start >= 0 ? start : 0;

  const overlay = document.createElement('div'); overlay.className = 'budaya-lightbox'; overlay.innerHTML = `
    <div class="budaya-lightbox-inner">
      <button class="bl-close" aria-label="Tutup">×</button>
      <button class="bl-prev" aria-label="Sebelumnya">‹</button>
      <div class="bl-stage"><img src="${escapeHtml(gallery[idx].src)}" alt="${escapeHtml(gallery[idx].alt||'')}"></div>
      <button class="bl-next" aria-label="Selanjutnya">›</button>
    </div>`;
  document.body.appendChild(overlay); document.body.style.overflow='hidden';
  injectStyle(`
    .budaya-lightbox{ position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.75); z-index:9999 }
    .budaya-lightbox img{ max-width:100%; max-height:80vh; border-radius:8px }
    .budaya-lightbox button{ position:absolute; background:transparent; color:#fff; border:none; font-size:30px; cursor:pointer }
    .budaya-lightbox .bl-close{ right:8px; top:10px; font-size:38px }
    .budaya-lightbox .bl-prev{ left:-12px; top:50%; transform:translateY(-50%) }
    .budaya-lightbox .bl-next{ right:-12px; top:50%; transform:translateY(-50%) }
  `);

  const stageImg = overlay.querySelector('.bl-stage img');
  function render(){ stageImg.src = gallery[idx].src; stageImg.alt = gallery[idx].alt || ''; }
  function close(){ document.body.removeChild(overlay); document.body.style.overflow=''; document.removeEventListener('keydown', onKey); }
  function prev(){ idx = (idx - 1 + gallery.length) % gallery.length; render(); }
  function next(){ idx = (idx + 1) % gallery.length; render(); }
  overlay.addEventListener('click', (e)=>{ if (e.target === overlay) close(); });
  overlay.querySelector('.bl-close').addEventListener('click', close);
  overlay.querySelector('.bl-prev').addEventListener('click', prev);
  overlay.querySelector('.bl-next').addEventListener('click', next);
  function onKey(e){ if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); }
  document.addEventListener('keydown', onKey);
}

function initExpandableDescriptions(){
  const el = document.querySelector('.batik-desc');
  if (!el) return;
  const maxChars = 250;
  const full = el.textContent.trim();
  if (full.length <= maxChars) return;
  const short = full.slice(0, maxChars).trim() + '…';
  el.textContent = short;
  const btn = document.createElement('button'); btn.className = 'readmore'; btn.textContent = 'Baca selengkapnya';
  Object.assign(btn.style, { display:'inline-block', marginTop:'8px', padding:'8px 12px', borderRadius:'8px', border:'none', cursor:'pointer', background:'#eee' });
  el.parentNode.insertBefore(btn, el.nextSibling);
  let expanded = false;
  btn.addEventListener('click', () => {
    expanded = !expanded; el.textContent = expanded ? full : short; btn.textContent = expanded ? 'Tampilkan sedikit' : 'Baca selengkapnya';
  });
}

function initThemeToggle(){
  const btn = document.createElement('button'); btn.className = 'theme-toggle'; btn.title = 'Toggle tema gelap/terang'; btn.innerHTML = '🌓';
  Object.assign(btn.style, { position:'fixed', right:'16px', bottom:'16px', zIndex:999, padding:'10px', borderRadius:'10px', border:'none', cursor:'pointer', background:'#fff' });
  document.body.appendChild(btn);
  injectStyle(`
    body.dark-theme{ background:#0f1113; color:#e6e6e6 }
    body.dark-theme a{ color:#9fd3ff }
    .theme-toggle{ box-shadow: 0 6px 18px rgba(0,0,0,0.12) }
    body.dark-theme .theme-toggle{ background:#222; color:#fff }
  `);
  const current = localStorage.getItem('kotasemarang-theme'); if (current === 'dark') document.body.classList.add('dark-theme');
  btn.addEventListener('click', () => { const dark = document.body.classList.toggle('dark-theme'); localStorage.setItem('kotasemarang-theme', dark ? 'dark' : 'light'); });
}

// Utilities
function throttle(fn, wait){ let last = 0; return function(...args){ const now = Date.now(); if (now - last >= wait){ last = now; fn.apply(this, args); } }; }
const _budaya_injected = new Set(); function injectStyle(css){ if (_budaya_injected.has(css)) return; _budaya_injected.add(css); const s = document.createElement('style'); s.setAttribute('data-from','budaya.js'); s.appendChild(document.createTextNode(css)); document.head.appendChild(s); }
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, function(s){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s]; }); }
