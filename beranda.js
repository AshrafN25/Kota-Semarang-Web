
// beranda.js
// Interaktivitas untuk beranda.html
// Fitur: smooth scroll, sticky header, reveal-on-scroll, hero tilt/zoom,
// gallery hover + lightbox modal (navigasi keyboard), dan theme toggle.

document.addEventListener('DOMContentLoaded', () => {
	try {
		initSmoothScroll();
		// initStickyHeader() removed to keep header/footer static on scroll
		initRevealOnScroll();
		initHeroInteractions();
		initGalleryInteractions();
		initThemeToggle();
	} catch (err) {
		console.error('beranda.js error:', err);
	}
});

function initSmoothScroll(){
	document.querySelectorAll('a[href^="#"]').forEach(a => {
		a.addEventListener('click', (e) => {
			const href = a.getAttribute('href');
			if (!href || href === '#') return;
			const target = document.querySelector(href);
			if (target){
				e.preventDefault();
				target.scrollIntoView({ behavior: 'smooth', block: 'start' });
				history.replaceState(null, '', href);
			}
		});
	});
}

function initStickyHeader(){
	const header = document.querySelector('.header');
	if (!header) return;
	const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
	onScroll();
	window.addEventListener('scroll', throttle(onScroll, 120));
	injectStyle(`
		.header.scrolled{ box-shadow: 0 8px 24px rgba(0,0,0,0.12); background: rgba(255,255,255,0.96); transition: box-shadow .2s, background .2s }
		body.dark-theme .header.scrolled{ background: rgba(12,12,12,0.93) }
	`);
}

function initRevealOnScroll(){
	const items = Array.from(document.querySelectorAll('.home-text, .home-image, .gallery-item, .know-text, .know-image, .sidebar-item, .deskripsi'));
	if (!items.length) return;
	items.forEach(it => {
		it.style.opacity = it.style.opacity || '0';
		it.style.transform = it.style.transform || 'translateY(18px)';
		it.style.transition = it.style.transition || 'opacity 520ms ease, transform 520ms ease';
	});
	const obs = new IntersectionObserver(entries => {
		entries.forEach(en => {
			if (en.isIntersecting){
				en.target.style.opacity = '1';
				en.target.style.transform = 'translateY(0)';
				obs.unobserve(en.target);
			}
		});
	}, { threshold: 0.12 });
	items.forEach(it => obs.observe(it));
}

function initHeroInteractions(){
	const container = document.querySelector('.home-image');
	if (!container) return;
	const img = container.querySelector('img.home-img');
	if (!img) return;
	injectStyle(`
		.home-image img{ transition: transform .28s ease, box-shadow .28s ease; border-radius:10px; will-change: transform; max-width:100%; }
		.home-image.is-hover img{ box-shadow: 0 28px 80px rgba(0,0,0,0.28); }
	`);
	container.addEventListener('pointerenter', () => container.classList.add('is-hover'));
	container.addEventListener('pointerleave', () => {
		container.classList.remove('is-hover');
		img.style.transform = '';
		img.style.transition = 'transform 300ms ease';
		setTimeout(() => img.style.transition = '', 300);
	});
	container.addEventListener('pointermove', (e) => {
		const r = container.getBoundingClientRect();
		const x = (e.clientX - r.left) / r.width - 0.5;
		const y = (e.clientY - r.top) / r.height - 0.5;
		const rx = -y * 4; const ry = x * 4;
		img.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px) scale(1.03)`;
		img.style.transition = 'transform 40ms linear';
	});
}

function initGalleryInteractions(){
	const items = Array.from(document.querySelectorAll('.gallery-item'));
	if (!items.length) return;
	injectStyle(`
		.gallery-item img{ transition: transform .28s ease, box-shadow .28s ease; border-radius:8px; display:block; width:100%; height:auto }
		.gallery-item:hover img{ transform: scale(1.06); box-shadow: 0 20px 50px rgba(0,0,0,0.22) }
	`);
	const imgs = Array.from(document.querySelectorAll('.gallery-item img'));
	imgs.forEach(img => img.addEventListener('click', () => openLightbox(img, buildGalleryImages())));
}

function buildGalleryImages(){
	return Array.from(document.querySelectorAll('.gallery-item img')).map(i => ({ src: i.src, alt: i.alt || '' }));
}

// Lightbox modal with keyboard navigation
function openLightbox(imgEl, gallery){
	const src = imgEl.src;
	const startIndex = gallery.findIndex(g => g.src === src) || 0;
	let idx = startIndex >= 0 ? startIndex : 0;

	const overlay = document.createElement('div');
	overlay.className = 'beranda-lightbox';
	overlay.innerHTML = `
		<div class="beranda-lightbox-inner">
			<button class="lb-close" aria-label="Tutup">×</button>
			<button class="lb-prev" aria-label="Sebelumnya">‹</button>
			<div class="lb-stage"><img src="${escapeHtml(gallery[idx].src)}" alt="${escapeHtml(gallery[idx].alt)}"></div>
			<button class="lb-next" aria-label="Selanjutnya">›</button>
		</div>`;
	document.body.appendChild(overlay);
	document.body.style.overflow = 'hidden';
	injectStyle(`
		.beranda-lightbox{ position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.75); z-index:9999 }
		.beranda-lightbox-inner{ position:relative; max-width:900px; width:94%; }
		.beranda-lightbox .lb-stage{ text-align:center }
		.beranda-lightbox img{ max-width:100%; max-height:80vh; border-radius:8px }
		.beranda-lightbox button{ position:absolute; background:transparent; color:#fff; border:none; font-size:30px; cursor:pointer }
		.beranda-lightbox .lb-close{ right:8px; top:-18px; font-size:38px }
		.beranda-lightbox .lb-prev{ left:-12px; top:50%; transform:translateY(-50%); }
		.beranda-lightbox .lb-next{ right:-12px; top:50%; transform:translateY(-50%); }
		@media (max-width:600px){ .beranda-lightbox .lb-prev, .beranda-lightbox .lb-next{ display:none } }
	`);

	const stageImg = overlay.querySelector('.lb-stage img');
	function render(){ stageImg.src = gallery[idx].src; stageImg.alt = gallery[idx].alt || ''; }
	function close(){ document.body.removeChild(overlay); document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); }
	function prev(){ idx = (idx - 1 + gallery.length) % gallery.length; render(); }
	function next(){ idx = (idx + 1) % gallery.length; render(); }

	overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
	overlay.querySelector('.lb-close').addEventListener('click', close);
	const prevBtn = overlay.querySelector('.lb-prev');
	const nextBtn = overlay.querySelector('.lb-next');
	prevBtn && prevBtn.addEventListener('click', prev);
	nextBtn && nextBtn.addEventListener('click', next);

	function onKey(e){ if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); }
	document.addEventListener('keydown', onKey);
}

// Theme toggle for beranda (keberadaan tombol tunggal per halaman)
function initThemeToggle(){
	const btn = document.createElement('button');
	btn.className = 'theme-toggle';
	btn.title = 'Toggle tema gelap/terang';
	btn.innerHTML = '🌓';
	Object.assign(btn.style, { position: 'fixed', right: '16px', bottom: '16px', zIndex: 999, padding: '10px', borderRadius:'10px', border:'none', cursor:'pointer', background:'#fff' });
	document.body.appendChild(btn);
	injectStyle(`
		body.dark-theme{ background:#0f1113; color:#e6e6e6 }
		body.dark-theme a{ color:#9fd3ff }
		.theme-toggle{ box-shadow: 0 6px 18px rgba(0,0,0,0.12) }
		body.dark-theme .theme-toggle{ background:#222; color:#fff }
	`);
	const current = localStorage.getItem('kotasemarang-theme');
	if (current === 'dark') document.body.classList.add('dark-theme');
	btn.addEventListener('click', () => {
		const dark = document.body.classList.toggle('dark-theme');
		localStorage.setItem('kotasemarang-theme', dark ? 'dark' : 'light');
	});
}

// Utility: throttle
function throttle(fn, wait){ let last = 0; return function(...args){ const now = Date.now(); if (now - last >= wait){ last = now; fn.apply(this, args); } }; }

// Utility: inject style once
const _beranda_injected = new Set();
function injectStyle(css){ if (_beranda_injected.has(css)) return; _beranda_injected.add(css); const s = document.createElement('style'); s.setAttribute('data-from','beranda.js'); s.appendChild(document.createTextNode(css)); document.head.appendChild(s); }

function escapeHtml(str){ return String(str).replace(/[&<>"']/g, function(s){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s]; }); }
