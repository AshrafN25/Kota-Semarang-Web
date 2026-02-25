
// wisata.js
// Interaktivitas untuk halaman wisata.html
// Fitur: smooth scroll, reveal-on-scroll, gallery hover + lightbox, feature image tilt/zoom, theme toggle

document.addEventListener('DOMContentLoaded', () => {
	try {
		initSmoothScroll();
		initRevealOnScroll();
		initFeatureImage();
		initGalleryLightbox();
		initOurGalleryEffects();
		initThemeToggle();
	} catch (err) {
		console.error('wisata.js error:', err);
	}
});

// Helper: detect the Saloka image by filename
function isSalokaImage(img){
	if (!img) return false;
	const src = (img.getAttribute && (img.getAttribute('src') || '')) || (img.src || '');
	return String(src).toLowerCase().includes('saloka.jpeg') || String(src).toLowerCase().includes('saloka.jpg');
}

function initSmoothScroll(){
	document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', (e) => {
		const href = a.getAttribute('href'); if (!href || href === '#') return;
		const t = document.querySelector(href); if (t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth', block:'start'}); history.replaceState(null,'',href); }
	}));
}

function initRevealOnScroll(){
	let nodes = Array.from(document.querySelectorAll('.deskripsi, .gallery-item, .wisata-utama, .wisata-item, .wisata-religi-text, .wisata-alam-image, .gallery-grid img'));
	// exclude any node that contains the saloka image to avoid applying reveal/effects to it
	nodes = nodes.filter(n => {
		const imgs = Array.from(n.querySelectorAll && n.querySelectorAll('img') || []);
		return !imgs.some(isSalokaImage);
	});
	if (!nodes.length) return;
	nodes.forEach(n => { n.style.opacity = n.style.opacity || '0'; n.style.transform = n.style.transform || 'translateY(18px)'; n.style.transition = n.style.transition || 'opacity 520ms ease, transform 520ms ease'; });
	const obs = new IntersectionObserver(entries => { entries.forEach(en => { if (en.isIntersecting){ en.target.style.opacity = '1'; en.target.style.transform = 'translateY(0)'; obs.unobserve(en.target); } }); }, { threshold: 0.12 });
	nodes.forEach(n => obs.observe(n));
}

function initFeatureImage(){
	const container = document.querySelector('.wisata-utama');
	if (!container) return;
	const img = container.querySelector('img');
	if (!img) return;
	// Apply zoom/hover effects to all images including Saloka
	injectStyle(`
		.wisata-utama img{ transition: transform .28s ease, box-shadow .28s ease; border-radius:8px; max-width:100%; cursor: pointer; }
		.wisata-utama.is-hover img{ box-shadow: 0 26px 70px rgba(0,0,0,0.24) }
	`);
	container.addEventListener('pointerenter', () => container.classList.add('is-hover'));
	container.addEventListener('pointerleave', () => { container.classList.remove('is-hover'); img.style.transform = ''; img.style.transition = 'transform 300ms ease'; setTimeout(() => img.style.transition = '', 300); });
	container.addEventListener('pointermove', (e) => {
		const r = container.getBoundingClientRect(); const x = (e.clientX - r.left)/r.width - 0.5; const y = (e.clientY - r.top)/r.height - 0.5;
		const rx = -y*3; const ry = x*3; img.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px) scale(1.03)`; img.style.transition = 'transform 40ms linear';
	});
	img.addEventListener('click', () => openLightbox(img, buildGalleryImages()));
}

function initGalleryLightbox(){
	const galleryImgs = Array.from(document.querySelectorAll('.gallery img, .our-gallery .gallery-grid img, .wisata-item img, .wisata-religi-image img, .wisata-alam-image img'));
	if (!galleryImgs.length) return;
	injectStyle(`
		.gallery-item img, .gallery-grid img, .wisata-item img{ transition: transform .28s ease, box-shadow .28s ease; border-radius:8px }
		.gallery-item:hover img, .gallery-grid img:hover, .wisata-item img:hover{ transform: scale(1.06); box-shadow:0 20px 50px rgba(0,0,0,0.22) }
	`);
	const imgs = galleryImgs.filter(Boolean);
	imgs.forEach(img => img.addEventListener('click', () => openLightbox(img, buildGalleryImages())));
}

// Special effects for the Our Gallery grid: hover scale, brightness, subtle tilt and touch fallback
function initOurGalleryEffects(){
	const imgs = Array.from(document.querySelectorAll('.our-gallery .gallery-grid img'));
	if (!imgs.length) return;

	injectStyle(`
		.our-gallery .gallery-grid img{ transition: transform .28s cubic-bezier(.2,.9,.3,1), filter .25s ease, box-shadow .28s ease; cursor: pointer; border-radius:8px }
		.our-gallery .gallery-grid img:hover{ transform: scale(1.06); filter: brightness(1.06) saturate(1.03); box-shadow: 0 18px 44px rgba(0,0,0,0.22) }
		/* make space for 3D transform without affecting layout */
		.our-gallery .gallery-grid img.wis-tilt{ transform-origin: center center; will-change: transform }
	`);

	imgs.forEach(img => {
		let touching = false;

		img.classList.add('wis-tilt');

		img.addEventListener('pointerenter', () => { if (!touching) img.style.transition = 'transform .18s cubic-bezier(.2,.9,.3,1), filter .18s ease'; });
		img.addEventListener('pointerleave', () => { img.style.transform = ''; img.style.transition = 'transform .32s ease'; img.style.filter = ''; touching = false; });

		img.addEventListener('pointermove', (e) => {
			if (e.pressure && e.pressure > 0) touching = true; // stylus/touch detection
			if (touching && e.pointerType !== 'mouse') return; // don't tilt on touch move
			const r = img.getBoundingClientRect();
			const x = (e.clientX - r.left) / r.width - 0.5;
			const y = (e.clientY - r.top) / r.height - 0.5;
			const ry = x * 6; const rx = -y * 6;
			img.style.transform = `perspective(500px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04)`;
			img.style.filter = 'brightness(1.04)';
		});

		// touch fallback: on touchstart, apply scale; on touchend, remove
		img.addEventListener('touchstart', () => { touching = true; img.style.transform = 'scale(1.06)'; img.style.filter = 'brightness(1.06)'; }, { passive: true });
		img.addEventListener('touchend', () => { touching = false; img.style.transform = ''; img.style.filter = ''; }, { passive: true });
	});
}

function buildGalleryImages(){
	// return the actual image elements so we can match by reference
	return Array.from(document.querySelectorAll('.wisata-utama img, .gallery img, .our-gallery .gallery-grid img, .wisata-item img, .wisata-religi-image img, .wisata-alam-image img'));
}

function openLightbox(imgEl, gallery){
	const src = imgEl && imgEl.src;
	let start = -1;
	// Prefer matching by element identity if gallery contains elements
	start = gallery.findIndex(g => g === imgEl);
	// fallback to URL match or filename match
	if (start === -1 && src) {
		try {
			const srcUrl = new URL(src, location.href);
			start = gallery.findIndex(g => {
				try { return new URL(g.src, location.href).href === srcUrl.href; }
				catch { return false; }
			});
		} catch (err) {
			// ignore
		}
	}
	if (start === -1 && src) {
		const srcName = src.split('/').pop();
		start = gallery.findIndex(g => (g.src || '').split('/').pop() === srcName);
	}
	let idx = start >= 0 ? start : 0;
	const overlay = document.createElement('div'); overlay.className = 'wis-lightbox'; overlay.innerHTML = `
		<div class="wis-lightbox-inner">
			<button class="wl-close" aria-label="Tutup">×</button>
			<button class="wl-prev" aria-label="Sebelumnya">‹</button>
			<div class="wl-stage"><img src="${escapeHtml(gallery[idx].src)}" alt="${escapeHtml(gallery[idx].alt)}"></div>
			<button class="wl-next" aria-label="Selanjutnya">›</button>
		</div>`;
	document.body.appendChild(overlay); document.body.style.overflow = 'hidden';
	injectStyle(`
		.wis-lightbox{ position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.75); z-index:9999 }
		.wis-lightbox img{ max-width:100%; max-height:80vh; border-radius:8px }
		.wis-lightbox button{ position:absolute; background:transparent; color:#fff; border:none; font-size:30px; cursor:pointer }
		.wis-lightbox .wl-close{ right:8px; top:-18px; font-size:38px }
		.wis-lightbox .wl-prev{ left:-12px; top:50%; transform:translateY(-50%); }
		.wis-lightbox .wl-next{ right:-12px; top:50%; transform:translateY(-50%); }
	`);
	const stageImg = overlay.querySelector('.wl-stage img');
	function render(){ stageImg.src = gallery[idx].src; stageImg.alt = gallery[idx].alt || ''; }
	function close(){ document.body.removeChild(overlay); document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); }
	function prev(){ idx = (idx - 1 + gallery.length) % gallery.length; render(); }
	function next(){ idx = (idx + 1) % gallery.length; render(); }
	overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
	overlay.querySelector('.wl-close').addEventListener('click', close);
	const prevBtn = overlay.querySelector('.wl-prev'); const nextBtn = overlay.querySelector('.wl-next'); prevBtn && prevBtn.addEventListener('click', prev); nextBtn && nextBtn.addEventListener('click', next);
	function onKey(e){ if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); }
	document.addEventListener('keydown', onKey);
}

function initThemeToggle(){
	const btn = document.createElement('button'); btn.className = 'theme-toggle'; btn.title = 'Toggle tema gelap/terang'; btn.innerHTML = '🌓';
	Object.assign(btn.style, { position: 'fixed', right: '16px', bottom: '16px', zIndex: 999, padding: '10px', borderRadius:'10px', border:'none', cursor:'pointer', background:'#fff' });
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
const _wis_injected = new Set(); function injectStyle(css){ if (_wis_injected.has(css)) return; _wis_injected.add(css); const s = document.createElement('style'); s.setAttribute('data-from','wisata.js'); s.appendChild(document.createTextNode(css)); document.head.appendChild(s); }
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, function(s){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s]; }); }

