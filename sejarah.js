// sejarah.js
// Interaktivitas untuk sejarah.html
// Fitur: smooth scroll, reveal-on-scroll, timeline reveal, image modal/lightbox, tema toggle
document.addEventListener('DOMContentLoaded', () => {
	try {
		initSmoothScroll();
		initRevealOnScroll();
		initTimelineReveal();
	initImageModals();
	initImageEffects();
		initThemeToggle();
	} catch (err) {
		console.error('sejarah.js error:', err);
	}
});

function initSmoothScroll(){
	document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', (e) => {
		const href = a.getAttribute('href'); if (!href || href === '#') return;
		const t = document.querySelector(href); if (t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth', block:'start'}); history.replaceState(null,'',href); }
	}));
}

function initRevealOnScroll(){
	const nodes = Array.from(document.querySelectorAll('.page-header, .intro, .sejarah-section, .timeline, .gallery, .figure'));
	if (!nodes.length) return;
	nodes.forEach(n => { n.style.opacity = n.style.opacity || '0'; n.style.transform = n.style.transform || 'translateY(14px)'; n.style.transition = n.style.transition || 'opacity 520ms ease, transform 520ms ease'; });
	const obs = new IntersectionObserver(entries => { entries.forEach(en => { if (en.isIntersecting){ en.target.style.opacity = '1'; en.target.style.transform = 'translateY(0)'; obs.unobserve(en.target); } }); }, { threshold: 0.12 });
	nodes.forEach(n => obs.observe(n));
}

function initTimelineReveal(){
	// Keep timeline static — user requested no effects on timeline items.
	const items = Array.from(document.querySelectorAll('.timeline-item'));
	if (!items.length) return;
	items.forEach(it => {
		// ensure visible and remove any transform/animation applied earlier
		it.style.opacity = it.style.opacity || '';
		it.style.transform = '';
		it.style.transition = '';
	});
}

function initImageModals(){
	// Images dengan navigasi (panah kiri/kanan)
	const selWithNav = Array.from(document.querySelectorAll('.gallery img, .sejarah-figure img, .figure img, .development-grid img'));
	if (selWithNav.length) {
		selWithNav.forEach(img => img.style.cursor = 'zoom-in');
		selWithNav.forEach(img => img.addEventListener('click', () => openImageModal(img, true)));
	}

	// Images tanpa navigasi (hanya zoom) - hero dan colonial
	const selSimple = Array.from(document.querySelectorAll('.hero-image img, .colonial-image img'));
	if (selSimple.length) {
		selSimple.forEach(img => img.style.cursor = 'zoom-in');
		selSimple.forEach(img => img.addEventListener('click', () => openImageModal(img, false)));
	}

	function openImageModal(img, hasNavigation){
	const src = img.currentSrc || img.src;
	const alt = img.alt || '';
	let navButtons = '';
	if (hasNavigation) {
		navButtons = `<button class="lb-prev" aria-label="Sebelumnya">‹</button><button class="lb-next" aria-label="Berikutnya">›</button>`;
	}
	const overlay = document.createElement('div'); overlay.className = 'sejarah-lightbox';
	overlay.innerHTML = `
			<div class="sejarah-lightbox-inner">
				<button class="lb-close" aria-label="Tutup">×</button>
				${navButtons}
				<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />
	<div class="lb-caption">${escapeHtml(alt)}</div>
			</div>`;
		document.body.appendChild(overlay); document.body.style.overflow = 'hidden';
		injectStyle(`
	.sejarah-lightbox{ position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.86); z-index:9999 }
	.sejarah-lightbox-inner{ position:relative; max-width:92%; max-height:88%; display:flex; align-items:center; justify-content:center; flex-direction:column }
	.sejarah-lightbox img{ max-width:100%; max-height:78vh; border-radius:8px; box-shadow:0 20px 60px rgba(0,0,0,0.6) }
	.sejarah-lightbox .lb-close{ position:absolute; right:8px; top:6px; font-size:28px; background:transparent; border:none; color:#fff; cursor:pointer }
	.sejarah-lightbox .lb-prev, .sejarah-lightbox .lb-next{ position:absolute; top:50%; transform:translateY(-50%); font-size:32px; background:transparent; border:none; color:#fff; cursor:pointer }
	.sejarah-lightbox .lb-prev{ left:8px } .sejarah-lightbox .lb-next{ right:8px }
			.sejarah-lightbox .lb-caption{ margin-top:8px; color:#ddd }
		`);

		let images = [];
		let index = 0;
		
		if (hasNavigation) {
			// Determine which section the image belongs to and get images only from that section
			if (img.closest('.development-grid')) {
				// Building Cards section only
				images = Array.from(document.querySelectorAll('.development-grid img'));
			} else if (img.closest('.gallery')) {
				// Gallery section
				images = Array.from(document.querySelectorAll('.gallery img'));
			} else if (img.closest('.sejarah-figure')) {
				images = Array.from(document.querySelectorAll('.sejarah-figure img'));
			} else if (img.closest('.figure')) {
				images = Array.from(document.querySelectorAll('.figure img'));
			}
			index = images.indexOf(img);
		} else {
			// Untuk hero dan colonial, hanya gambar itu sendiri
			images = [img];
			index = 0;
		}

		function close(){ if (!overlay.parentElement) return; document.body.removeChild(overlay); document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); }
		function showIdx(i){ if (!hasNavigation || images.length <= 1) return; i = (i + images.length) % images.length; const im = images[i]; const s = im.currentSrc || im.src; overlay.querySelector('img').src = s; overlay.querySelector('.lb-caption').textContent = im.alt || ''; index = i; }
		function onKey(e){ if (e.key === 'Escape') close(); if (hasNavigation) { if (e.key === 'ArrowLeft') showIdx(index-1); if (e.key === 'ArrowRight') showIdx(index+1); } }

		overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
		overlay.querySelector('.lb-close').addEventListener('click', close);
		if (hasNavigation) {
			const prevBtn = overlay.querySelector('.lb-prev'); 
			const nextBtn = overlay.querySelector('.lb-next'); 
			prevBtn && prevBtn.addEventListener('click', () => showIdx(index-1));
			nextBtn && nextBtn.addEventListener('click', () => showIdx(index+1));
		}
		window.addEventListener('keydown', onKey);
	}

}

// Make images on this page have consistent tilt/scale/shadow like other pages
function initImageEffects(){
	// select all images but exclude those inside header/footer areas
	const allImgs = Array.from(document.querySelectorAll('img'));
	const imgs = allImgs.filter(img => !img.closest('header, footer, .site-header, .site-footer'));
	if (!imgs.length) return;
	injectStyle(`
		.sejarah-img-tilt{ transition: transform .22s ease, box-shadow .22s ease; transform-origin: center; will-change: transform }
		.sejarah-img-tilt:hover{ box-shadow: 0 26px 60px rgba(0,0,0,0.28); transform: translateY(-6px) scale(1.03) }
		@media (hover: none){ .sejarah-img-tilt:hover{ transform:none; box-shadow:none } }
	`);

	imgs.forEach(img => {
		// skip if image is inside an element explicitly marked to avoid effects
		if (img.closest('[data-no-effect]')) return;
		img.classList.add('sejarah-img-tilt');
		// only set zoom cursor if image is likely interactive
		if (!img.closest('picture') && !img.classList.contains('no-zoom')) img.style.cursor = 'zoom-in';

		let isPointerDown = false;
		img.addEventListener('pointermove', (e) => {
			if (e.pointerType !== 'mouse') return;
			const r = img.getBoundingClientRect(); const x = (e.clientX - r.left)/r.width - 0.5; const y = (e.clientY - r.top)/r.height - 0.5;
			const rx = -y * 4; const ry = x * 4; img.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
		});
		img.addEventListener('pointerleave', () => { img.style.transform = ''; });

		// press feedback
		img.addEventListener('pointerdown', () => { isPointerDown = true; img.style.transform = 'scale(.995)'; });
		img.addEventListener('pointerup', () => { if (isPointerDown){ isPointerDown = false; img.style.transform = ''; } });
		img.addEventListener('pointercancel', () => { isPointerDown = false; img.style.transform = ''; });
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
const _sejarah_injected = new Set(); function injectStyle(css){ if (_sejarah_injected.has(css)) return; _sejarah_injected.add(css); const s = document.createElement('style'); s.setAttribute('data-from','sejarah.js'); s.appendChild(document.createTextNode(css)); document.head.appendChild(s); }
function escapeHtml(str){ return String(str).replace(/[&<>"]+/g, function(s){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]) || s; }); }

