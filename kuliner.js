const slides = [
  {
    title: "Kuliner Semarang",
    text: "Kota Semarang, surga kuliner yang memadukan cita rasa tradisional dan modern. Dari kelezatan Lumpia yang legendaris, gurihnya Tahu Gimbal, hingga hangatnya Nasi Ayam khas Semarang, setiap sajian menyimpan cerita budaya dan sejarah kota ini. Jelajahi beragam rasa yang menggugah selera dan temukan kenikmatan khas Semarang dalam setiap suapan.",
    image: "gambarrr/bfba541beb393c5fcf2b61db23dfcfc4.jpg",
    alt: "Lumpia Semarang"
  },
  {
    title: "Kuliner Semarang",
    text: "",
    image: "grid",
    alt: "Kuliner Semarang",
    isGrid: true,
    isFullGrid: true,
    leftGridImages: [
      "gambarrr/exterior-look-of-spiegel.jpg",
      "gambarrr/spiegel-1-1.jpg",
      "gambarrr/97673b7436fbc5fff0e1646cdce06bed.jpg",
      "gambarrr/Kafe-Tekodeko-Koffiehuis-Semarang.jpg",
      "gambarrr/Cafe-Tekodeko-Koffiehuis.jpg",
      "gambarrr/Primarasa-Makanan_0000_Primarasa-Makanan-2.jpg",
      "gambarrr/230557.jpg"
    ],
    rightGridImages: [
      "gambarrr/bfba541beb393c5fcf2b61db23dfcfc4.jpg",
      "gambarrr/cb26925efbd285f87a571e61634dadb3.jpg",
      "gambarrr/61b7e1c76da1e.jpeg",
      "gambarrr/22ba5a32fc0672274d7c1ebd261ef948.jpg",
      "gambarrr/6ba45dcdeec3b303fd66964256ee63ff.jpg",
      "gambarrr/unnamed.jpg",
      "gambarrr/230557.jpg"
    ]
  }
];

let currentIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
  const titleEl = document.getElementById("slide-title");
  const textEl = document.getElementById("slide-text");
  const imageContainer = document.querySelector(".image");
  const btnLeft = document.querySelector(".nav-btn.left");
  const btnRight = document.querySelector(".nav-btn.right");

  function renderSlide(index) {
    const slide = slides[index];
    
    titleEl.textContent = slide.title;
    textEl.textContent = slide.text;
    
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
      imageContainer.innerHTML = `
        <div class="image-grid">
          ${slide.gridImages.map(img => `
            <img src="${img}" alt="Kuliner Semarang">
          `).join('')}
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
});
