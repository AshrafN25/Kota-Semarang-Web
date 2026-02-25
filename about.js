
// about.js
// Interaktivitas ringan untuk about.html
// Fitur: smooth anchor scroll, sticky header, reveal-on-scroll, typewriter judul tim,
// modal foto anggota tim, tilt hover pada kartu anggota, dan toggle tema gelap.

document.addEventListener('DOMContentLoaded', () => {
	try {
		initSmoothScroll();
		initRevealOnScroll();
			initTeamInteractions();
			initAboutImageInteractions();
		initTypewriter();
		initThemeToggle();
	} catch (err) {
		// Jangan ganggu UX bila ada error kecil
		console.error('about.js error:', err);
	}
});
			// initStickyHeader() removed to keep header/footer static on scroll

// Smooth scroll untuk anchor (#...)
function initSmoothScroll() {
	document.querySelectorAll('a[href^="#"]').forEach(a => {
		a.addEventListener('click', (e) => {
			const targetId = a.getAttribute('href');
			if (!targetId || targetId === '#') return;
			const target = document.querySelector(targetId);
			if (target) {
				e.preventDefault();
				target.scrollIntoView({ behavior: 'smooth', block: 'start' });
				history.replaceState(null, '', targetId);
			}
		});
	});
}

// Sticky header: tambahkan kelas saat di-scroll
function initStickyHeader() {
	const header = document.querySelector('.header');
	if (!header) return;

	const onScroll = () => {
		if (window.scrollY > 20) header.classList.add('scrolled');
		else header.classList.remove('scrolled');
	};

	onScroll();
	window.addEventListener('scroll', throttle(onScroll, 100));

	// Sisipkan sedikit style untuk .scrolled jika belum ada
	injectStyle(`
		.header.scrolled{ box-shadow: 0 6px 18px rgba(0,0,0,0.12); background: rgba(255,255,255,0.98); transition: background .25s ease, box-shadow .25s ease; }
		body.dark-theme .header.scrolled{ background: rgba(20,20,20,0.95); }
	`);
}

// Reveal-on-scroll dasar memakai IntersectionObserver
function initRevealOnScroll() {
	const selectors = ['.deskripsi', '.about', '.about-text', '.about-image', '.team', '.team-title', '.team-members'];
	const elems = selectors.flatMap(sel => Array.from(document.querySelectorAll(sel)));
	if (!elems.length) return;

	elems.forEach(el => {
		el.style.opacity = el.style.opacity || '0';
		el.style.transform = el.style.transform || 'translateY(18px)';
		el.style.transition = el.style.transition || 'opacity 600ms ease, transform 600ms ease';
	});

	const obs = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.style.opacity = '1';
				entry.target.style.transform = 'translateY(0)';
				obs.unobserve(entry.target);
			}
		});
	}, { threshold: 0.12 });

	elems.forEach(el => obs.observe(el));
}

// Team interactions: modal + tilt hover (tilt & scale applied only to the image)
function initTeamInteractions() {
	const members = document.querySelectorAll('.team-members .member');
	if (!members.length) return;

	// Inject styles so image effects don't affect the name (h4)
	injectStyle(`
		.team-members .member{ perspective:800px }
		.team-members .member .photo img{ display:block; width:100%; height:auto; transition: transform .28s ease, box-shadow .28s ease; border-radius:8px; will-change: transform, box-shadow; }
		.team-members .member.is-hover .photo img{ transform: scale(1.08); box-shadow: 0 18px 40px rgba(0,0,0,0.28); position: relative; z-index: 3 }
		/* ensure the name stays readable and above layout flow */
		.team-members .member h4{ position: relative; z-index: 4; margin-top:8px; }
	`);

	members.forEach(member => {
		const photo = member.querySelector('.photo') || member;
		const img = member.querySelector('img');
		if (!img) return;

		// When pointer enters photo area, mark hover so CSS scale applies
		photo.addEventListener('pointerenter', () => {
			member.classList.add('is-hover');
		});
		photo.addEventListener('pointerleave', () => {
			member.classList.remove('is-hover');
			// gently reset any tilt transform
			img.style.transform = '';
			img.style.transition = 'transform 320ms ease';
			setTimeout(() => { img.style.transition = ''; }, 320);
		});

		// Tilt effect: apply small rotation to the image only (follow cursor)
		photo.addEventListener('pointermove', (e) => {
			const rect = photo.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width - 0.5;
			const y = (e.clientY - rect.top) / rect.height - 0.5;
			const rotateY = x * 6; // degrees
			const rotateX = -y * 6;
			// keep a subtle scale when tilting
			img.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px) scale(1.03)`;
			img.style.transition = 'transform 40ms linear';
		});

		// clicking image or member opens modal
		img.addEventListener('click', (e) => { e.stopPropagation(); openMemberModal(member); });
		member.addEventListener('click', () => openMemberModal(member));
	});
}

function openMemberModal(member) {
	const img = member.querySelector('img');
	const name = member.querySelector('h4') ? member.querySelector('h4').innerHTML.replace(/<br\s*\/?>/i, ' ') : '';
	const src = img ? img.src : null;

	const overlay = document.createElement('div');
	overlay.className = 'asraf-modal-overlay';
	overlay.innerHTML = `
		<div class="asraf-modal">
			<button class="asraf-modal-close" aria-label="Tutup">×</button>
			${src ? `<img src="${src}" alt="${escapeHtml(name)}">` : ''}
			<h3>${escapeHtml(name)}</h3>
			<p class="asraf-modal-bio">Anggota tim dari SMKN 7 Semarang — siap memperkenalkan Kota Semarang. Klik di luar atau tekan Esc untuk menutup.</p>
		</div>`;

	document.body.appendChild(overlay);
	document.body.style.overflow = 'hidden';

	// Close handlers
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay || e.target.classList.contains('asraf-modal-close')) closeModal();
	});
	function closeModal() {
		document.body.removeChild(overlay);
		document.body.style.overflow = '';
		document.removeEventListener('keydown', onKey);
	}
	function onKey(e) { if (e.key === 'Escape') closeModal(); }
	document.addEventListener('keydown', onKey);

	// Minimal styles for modal
	injectStyle(`
		.asraf-modal-overlay{ position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.6); z-index:9999; }
		.asraf-modal{ background: #fff; color: #111; border-radius:10px; padding:18px; max-width:520px; width:92%; box-shadow:0 12px 40px rgba(0,0,0,0.35); text-align:center; }
		.asraf-modal img{ max-width:160px; border-radius:10px; margin-bottom:12px; }
		.asraf-modal h3{ margin:6px 0 8px; }
		.asraf-modal-bio{ font-size:14px; color:#444 }
		.asraf-modal-close{ position:absolute; right:14px; top:12px; background:transparent; border:none; font-size:26px; cursor:pointer }
		body.dark-theme .asraf-modal{ background:#111; color:#eee }
	`);
}

// Typewriter untuk .team-title
function initTypewriter() {
	const el = document.querySelector('.team-title');
	if (!el) return;
	const text = el.textContent.trim();
	el.textContent = '';
	let i = 0;
	const speed = 30;
	(function type(){
		if (i <= text.length) {
			el.textContent = text.slice(0, i++);
			setTimeout(type, speed + Math.random()*30);
		}
	})();
}

// Interaksi khusus untuk gambar di section .about (.about-image img)
function initAboutImageInteractions(){
	const container = document.querySelector('.about-image');
	if (!container) return;
	const img = container.querySelector('img');
	if (!img) return;

	// inject style for prominence without affecting surrounding text
	injectStyle(`
		.about-image{ display:flex; align-items:center; justify-content:center }
		.about-image img{ transition: transform .28s ease, box-shadow .28s ease; border-radius:10px; will-change: transform, box-shadow; max-width:100%; height:auto }
		.about-image.is-hover img{ transform: scale(1.06); box-shadow: 0 24px 60px rgba(0,0,0,0.32); z-index:2 }
	`);

	// pointer events for modern UX (works for mouse and stylus)
	container.addEventListener('pointerenter', () => container.classList.add('is-hover'));
	container.addEventListener('pointerleave', () => {
		container.classList.remove('is-hover');
		img.style.transform = '';
		img.style.transition = 'transform 320ms ease';
		setTimeout(() => img.style.transition = '', 320);
	});

	// subtle tilt that affects image only
	container.addEventListener('pointermove', (e) => {
		const rect = container.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width - 0.5;
		const y = (e.clientY - rect.top) / rect.height - 0.5;
		const rotateY = x * 4; // gentler than member cards
		const rotateX = -y * 4;
		img.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px) scale(1.04)`;
		img.style.transition = 'transform 40ms linear';
	});

	// clicking image opens zoom modal (image only, no description)
	img.addEventListener('click', () => {
		openImageZoomModal(img.src, img.alt);
	});
}

// Image zoom modal: display only the image without description
function openImageZoomModal(imageSrc, altText) {
	const overlay = document.createElement('div');
	overlay.className = 'image-zoom-overlay';
	overlay.innerHTML = `
		<div class="image-zoom-modal">
			<button class="image-zoom-close" aria-label="Tutup">×</button>
			<img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(altText)}" class="image-zoom-img">
		</div>
	`;

	document.body.appendChild(overlay);

	// Styles for zoom modal
	injectStyle(`
		.image-zoom-overlay { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.7); z-index: 9998; }
		.image-zoom-modal { position: relative; max-width: 90vw; max-height: 90vh; }
		.image-zoom-img { max-width: 100%; max-height: 90vh; border-radius: 8px; }
		.image-zoom-close { position: absolute; top: -35px; right: 0; background: none; border: none; font-size: 32px; color: #fff; cursor: pointer; padding: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
		.image-zoom-close:hover { opacity: 0.8; }
	`);

	// Close handlers
	const closeZoomModal = () => overlay.remove();

	overlay.addEventListener('click', (e) => {
		if (e.target === overlay || e.target.classList.contains('image-zoom-close')) closeZoomModal();
	});

	document.addEventListener('keydown', function onKey(e) {
		if (e.key === 'Escape') {
			closeZoomModal();
			document.removeEventListener('keydown', onKey);
		}
	});
}

// Theme toggle (inject button) with localStorage
function initThemeToggle() {
	const btn = document.createElement('button');
	btn.className = 'theme-toggle';
	btn.title = 'Toggle tema gelap/terang';
	btn.innerHTML = '🌓';
	Object.assign(btn.style, { position: 'fixed', right: '16px', bottom: '16px', zIndex: 999, padding: '10px', borderRadius:'10px', border:'none', cursor:'pointer', background:'#fff' });
	document.body.appendChild(btn);

	// styles
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

// Utility: simple throttle
function throttle(fn, wait){
	let last = 0;
	return function(...args){
		const now = Date.now();
		if (now - last >= wait){ last = now; fn.apply(this, args); }
	};
}

// Utility: inject style once
const _injected = new Set();
function injectStyle(css){
	if (_injected.has(css)) return;
	_injected.add(css);
	const s = document.createElement('style');
	s.setAttribute('data-from', 'about.js');
	s.appendChild(document.createTextNode(css));
	document.head.appendChild(s);
}

// Utility: escape HTML for safety when injecting text into modal
function escapeHtml(str){
	return String(str).replace(/[&<>"']/g, function(s){
		return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s];
	});
}
