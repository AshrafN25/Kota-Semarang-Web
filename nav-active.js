// nav-active.js - Mendeteksi halaman aktif dan menambahkan class active ke navbar

document.addEventListener('DOMContentLoaded', () => {
    setActiveNavLink();
});

function setActiveNavLink() {
    // Dapatkan nama file halaman saat ini
    const currentPage = window.location.pathname.split('/').pop() || 'beranda.html';
    
    // Dapatkan semua link di navbar
    const navLinks = document.querySelectorAll('.navbar a');
    
    // Loop melalui setiap link
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Hapus class active dari semua link
        link.classList.remove('active');
        
        // Tambahkan class active ke link yang sesuai dengan halaman saat ini
        if (href === currentPage || 
            (currentPage === '' && href === 'beranda.html') ||
            (currentPage === '/' && href === 'beranda.html')) {
            link.classList.add('active');
        }
    });
}

// Deteksi perubahan halaman dan tambahkan smooth transition
document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Jika link mengarah ke halaman lain (bukan anchor)
        if (href && !href.startsWith('#')) {
            e.preventDefault();
            document.body.style.animation = 'fadeOut 0.3s ease-out forwards';
            
            // Tunggu transisi selesai sebelum pindah halaman
            setTimeout(() => {
                window.location.href = href;
            }, 300);
        }
    });
});

// Tambahkan keyframe fadeOut dinamis jika belum ada
if (!document.querySelector('style[data-transition]')) {
    const style = document.createElement('style');
    style.setAttribute('data-transition', 'true');
    style.textContent = `
        @keyframes fadeOut {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-10px);
            }
        }
    `;
    document.head.appendChild(style);
}
