const slides = [
  {
    title: "Kuliner Semarang",
    text: "Kota Semarang, surga kuliner yang memadukan cita rasa tradisional dan modern. Dari kelezatan Lumpia yang legendaris, gurihnya Tahu Gimbal, hingga lembutnya bandeng presto khas Semarang, setiap sajian menyimpan cerita budaya dan sejarah kota ini. Jelajahi beragam rasa yang menggugah selera dan temukan kenikmatan khas Semarang dalam setiap suapan.",
    image: "grid",
    alt: "Kuliner Semarang",
    isGrid: true,
    gridImages: [
      "gambarrr/bfba541beb393c5fcf2b61db23dfcfc4.jpg",
      "gambarrr/cb26925efbd285f87a571e61634dadb3.jpg",
      "gambarrr/61b7e1c76da1e.jpeg",
      "gambarrr/22ba5a32fc0672274d7c1ebd261ef948.jpg",
      "gambarrr/Primarasa-Makanan_0000_Primarasa-Makanan-2.jpg",
      "gambarrr/6ba45dcdeec3b303fd66964256ee63ff.jpg",
      "gambarrr/230557.jpg"
    ]
  },
  {
    title: "Kuliner Semarang",
    text: "Lumpia merupakan ikon kuliner kota Semarang yang memadukan pengaruh Tionghoa dan Jawa. Kulitnya tipis dan renyah, berisi rebung, telur, dan daging ayam atau udang yang dimasak dengan bumbu gurih-manis khas. Biasanya disajikan dengan saus kental, acar, dan cabai rawit. Perpaduan tekstur renyah dan isian yang lembut membuat lumpia menjadi camilan sekaligus oleh-oleh favorit dari Semarang.",
    image: "gambarrr/bfba541beb393c5fcf2b61db23dfcfc4.jpg",
    alt: "Lumpia Semarang"
  },
  {
    title: "Kuliner Semarang",
    text: "Tahu gimbal adalah hidangan khas Semarang yang menggabungkan tahu goreng, lontong, kol, dan tauge dengan “gimbal” udang (bakwan udang). Semua disiram saus kacang yang kental dengan campuran petis sehingga rasanya manis, gurih, dan sedikit asin. Sajian ini terkenal mengenyangkan dan kaya tekstur, dari renyahnya gimbal hingga lembutnya tahu dan lontong.",
    image: "gambarrr/1247c1e7596d574bafddd262ac79f90a.jpg",
    alt: "Tahu Gimbal"
  },
  {
    title: "Kuliner Semarang",
    text: "Bandeng presto adalah olahan ikan bandeng yang dimasak menggunakan panci presto hingga durinya lunak dan dapat dimakan. Ikan dibumbui rempah seperti bawang putih, kunyit, dan garam sehingga meresap sampai ke dalam. Hasilnya adalah daging bandeng yang empuk, gurih, dan aromatik. Hidangan ini sering dijadikan buah tangan khas Semarang karena praktis dan bercita rasa kuat.",
    image: "gambarrr/61b7e1c76da1e.jpeg",
    alt: "Bandeng Presto"
  }
];

let currentIndex = 0;

// Utility functions for effects
function injectStyle(css) {
  if (window._kul_injected && window._kul_injected.has(css)) return;
  if (!window._kul_injected) window._kul_injected = new Set();
  window._kul_injected.add(css);
  const s = document.createElement('style');
  s.setAttribute('data-from', 'kuliner.js');
  s.appendChild(document.createTextNode(css));
  document.head.appendChild(s);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function(s) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s];
  });
}

// Initialize reveal on scroll effects
function initRevealOnScroll() {
  let nodes = Array.from(document.querySelectorAll('.gallery-title, .card-item, .feature, .spot, .recommendations h2, .rec-row'));
  if (!nodes.length) return;
  nodes.forEach(n => {
    n.style.opacity = '0';
    n.style.transform = 'translateY(18px)';
    n.style.transition = 'opacity 520ms ease, transform 520ms ease';
  });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.style.opacity = '1';
        en.target.style.transform = 'translateY(0)';
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  nodes.forEach(n => obs.observe(n));
}

// Initialize hover effects for card items
function initCardItemEffects() {
  const items = Array.from(document.querySelectorAll('.card-item img'));
  if (!items.length) return;
  injectStyle(`
    .card-item img { transition: transform .28s ease, box-shadow .28s ease; border-radius: 18px; cursor: pointer; }
    .card-item:hover img { transform: scale(1.08); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.22); }
  `);
  items.forEach(img => {
    img.addEventListener('click', () => openLightbox(img, buildGalleryImages()));
  });
}

// Initialize hover effects for grid images with 3D tilt
function initGridImageEffects() {
  const imgs = Array.from(document.querySelectorAll('.image-grid img'));
  if (!imgs.length) return;
  injectStyle(`
    .image-grid img { transition: transform .28s cubic-bezier(.2,.9,.3,1), filter .25s ease, box-shadow .28s ease; cursor: pointer; border-radius: 6px; }
    .image-grid img:hover { transform: scale(1.06); filter: brightness(1.05); box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22); }
    .image-grid img.kul-tilt { transform-origin: center center; will-change: transform; }
  `);
  
  imgs.forEach(img => {
    img.classList.add('kul-tilt');
    let touching = false;
    
    img.addEventListener('pointerenter', () => {
      if (!touching) img.style.transition = 'transform .18s cubic-bezier(.2,.9,.3,1), filter .18s ease';
    });
    
    img.addEventListener('pointerleave', () => {
      img.style.transform = '';
      img.style.transition = 'transform .32s ease';
      img.style.filter = '';
      touching = false;
    });
    
    img.addEventListener('pointermove', (e) => {
      if (e.pressure && e.pressure > 0) touching = true;
      if (touching && e.pointerType !== 'mouse') return;
      const r = img.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const ry = x * 6;
      const rx = -y * 6;
      img.style.transform = `perspective(500px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04)`;
      img.style.filter = 'brightness(1.04)';
    });
    
    img.addEventListener('touchstart', () => {
      touching = true;
      img.style.transform = 'scale(1.06)';
      img.style.filter = 'brightness(1.06)';
    }, { passive: true });
    
    img.addEventListener('touchend', () => {
      touching = false;
      img.style.transform = '';
      img.style.filter = '';
    }, { passive: true });
    
    img.addEventListener('click', () => openLightbox(img, buildGalleryImages()));
  });
}

// Initialize hover effects for feature and spot section images
function initFeatureAndSpotEffects() {
  const featureImgs = Array.from(document.querySelectorAll('.feature-media img, .spot-gallery img'));
  if (!featureImgs.length) return;
  
  injectStyle(`
    .feature-media img, .spot-gallery img { transition: transform .28s ease, box-shadow .28s ease; cursor: pointer; }
    .feature-media img:hover, .spot-gallery img:hover { transform: scale(1.05); box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2); }
  `);
  
  featureImgs.forEach(img => {
    img.addEventListener('click', () => openLightbox(img, buildGalleryImages()));
  });
}

// Initialize hover effects for recommendation images
function initRecImageEffects() {
  const recImgs = Array.from(document.querySelectorAll('.rec-image img'));
  if (!recImgs.length) return;
  
  injectStyle(`
    .rec-image img { transition: transform .28s ease, box-shadow .28s ease; cursor: pointer; }
    .rec-image img:hover { transform: scale(1.04); box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22); }
  `);
  
  recImgs.forEach(img => {
    img.addEventListener('click', () => openLightbox(img, buildGalleryImages()));
  });
}

// Build gallery images array for lightbox
function buildGalleryImages() {
  return Array.from(document.querySelectorAll('.card-item img, .image-grid img, .feature-media img, .spot-gallery img, .rec-image img'));
}

// Open lightbox viewer
function openLightbox(imgEl, gallery) {
  const src = imgEl && imgEl.src;
  let start = -1;
  
  start = gallery.findIndex(g => g === imgEl);
  
  if (start === -1 && src) {
    try {
      const srcUrl = new URL(src, location.href);
      start = gallery.findIndex(g => {
        try { return new URL(g.src, location.href).href === srcUrl.href; }
        catch { return false; }
      });
    } catch (err) { }
  }
  
  if (start === -1 && src) {
    const srcName = src.split('/').pop();
    start = gallery.findIndex(g => (g.src || '').split('/').pop() === srcName);
  }
  
  let idx = start >= 0 ? start : 0;
  
  const overlay = document.createElement('div');
  overlay.className = 'kul-lightbox';
  overlay.innerHTML = `
    <div class="kul-lightbox-inner">
      <button class="kl-close" aria-label="Tutup">×</button>
      <button class="kl-prev" aria-label="Sebelumnya">‹</button>
      <div class="kl-stage"><img src="${escapeHtml(gallery[idx].src)}" alt="${escapeHtml(gallery[idx].alt)}"></div>
      <button class="kl-next" aria-label="Selanjutnya">›</button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  
  injectStyle(`
    .kul-lightbox { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.75); z-index: 9999; }
    .kul-lightbox img { max-width: 100%; max-height: 80vh; border-radius: 8px; }
    .kul-lightbox button { position: absolute; background: transparent; color: #fff; border: none; font-size: 30px; cursor: pointer; }
    .kul-lightbox .kl-close { right: 8px; top: -18px; font-size: 38px; }
    .kul-lightbox .kl-prev { left: -12px; top: 50%; transform: translateY(-50%); }
    .kul-lightbox .kl-next { right: -12px; top: 50%; transform: translateY(-50%); }
  `);
  
  const stageImg = overlay.querySelector('.kl-stage img');
  
  function render() {
    stageImg.src = gallery[idx].src;
    stageImg.alt = gallery[idx].alt || '';
  }
  
  function close() {
    document.body.removeChild(overlay);
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
  }
  
  function prev() {
    idx = (idx - 1 + gallery.length) % gallery.length;
    render();
  }
  
  function next() {
    idx = (idx + 1) % gallery.length;
    render();
  }
  
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('.kl-close').addEventListener('click', close);
  const prevBtn = overlay.querySelector('.kl-prev');
  const nextBtn = overlay.querySelector('.kl-next');
  prevBtn && prevBtn.addEventListener('click', prev);
  nextBtn && nextBtn.addEventListener('click', next);
  
  function onKey(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  }
  
  document.addEventListener('keydown', onKey);
}

document.addEventListener('DOMContentLoaded', function() {
  const titleEl = document.getElementById("slide-title");
  const textEl = document.getElementById("slide-text");
  const imageContainer = document.querySelector(".image");
  const btnLeft = document.querySelector(".nav-btn.left");
  const btnRight = document.querySelector(".nav-btn.right");

  function renderSlide(index) {
    const slide = slides[index];
    
    titleEl.textContent = slide.title;
    
    if (slide.isFullGrid) {
      // Layout dengan 2 grid (kiri dan kanan)
      const contentDiv = document.querySelector(".content");
      contentDiv.innerHTML = `
        <div class="image-grid">
          ${slide.leftGridImages.map(img => `
            <img src="${img}" alt="Resto Semarang">
          `).join('')}
        </div>
        <div class="image-grid">
          ${slide.rightGridImages.map(img => `
            <img src="${img}" alt="Kuliner Semarang">
          `).join('')}
        </div>
      `;
    } else if (slide.isGrid) {
      const contentDiv = document.querySelector(".content");
      contentDiv.innerHTML = `
        <div class="text">
          <p id="slide-text">${slide.text}</p>
        </div>
        <div class="image">
          <div class="image-grid">
            ${slide.gridImages.map(img => `
              <img src="${img}" alt="Kuliner Semarang">
            `).join('')}
          </div>
        </div>
      `;
    } else {
      // Kembalikan struktur normal dengan text dan image
      const contentDiv = document.querySelector(".content");
      contentDiv.innerHTML = `
        <div class="text">
          <p id="slide-text">${slide.text}</p>
        </div>
        <div class="image">
          <img id="slide-image" src="${slide.image}" alt="${slide.alt}">
        </div>
      `;
    }
    
    // Re-initialize effects after render
    setTimeout(() => {
      initGridImageEffects();
    }, 50);
  }

  if (btnRight) {
    btnRight.addEventListener("click", function() {
      currentIndex = (currentIndex + 1) % slides.length;
      renderSlide(currentIndex);
    });
  }

  if (btnLeft) {
    btnLeft.addEventListener("click", function() {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      renderSlide(currentIndex);
    });
  }

  renderSlide(currentIndex);
  
  // Initialize all effects
  try {
    initRevealOnScroll();
    initCardItemEffects();
    initGridImageEffects();
    initFeatureAndSpotEffects();
    initRecImageEffects();
  } catch (err) {
    console.error('kuliner.js effects error:', err);
  }
});
