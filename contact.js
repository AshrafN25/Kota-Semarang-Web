// Contact Form Validation and Interactivity

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    const formInputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
    
    // Add smooth focus animations
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.borderColor = '#743014';
            this.parentElement.style.boxShadow = '0 0 8px rgba(116, 48, 20, 0.3)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.borderColor = '#ddd';
            this.parentElement.style.boxShadow = 'none';
        });
        
        // Real-time validation
        input.addEventListener('input', function() {
            validateField(this);
        });
    });
    
    // Form submission
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate all fields
            let isValid = true;
            formInputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            
            if (isValid) {
                showSuccessMessage();
                contactForm.reset();
                formInputs.forEach(input => {
                    input.parentElement.classList.remove('form-error');
                    const errorMsg = input.parentElement.querySelector('.error-message');
                    if (errorMsg) {
                        errorMsg.style.display = 'none';
                    }
                });
            }
        });
    }
    
    // Form field validation function
    function validateField(field) {
        const parent = field.parentElement;
        let isValid = true;
        let errorMessage = '';
        
        // Check if field is empty
        if (field.value.trim() === '') {
            isValid = false;
            errorMessage = 'Field ini harus diisi';
        } else {
            // Email validation
            if (field.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value)) {
                    isValid = false;
                    errorMessage = 'Email tidak valid';
                }
            }
            
            // Minimum length validation
            if (field.name === 'pesan' && field.value.trim().length < 10) {
                isValid = false;
                errorMessage = 'Pesan harus minimal 10 karakter';
            }
        }
        
        // Update visual feedback
        if (!isValid) {
            parent.classList.add('form-error');
            let errorMsg = parent.querySelector('.error-message');
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                parent.appendChild(errorMsg);
            }
            errorMsg.textContent = errorMessage;
            errorMsg.style.display = 'block';
        } else {
            parent.classList.remove('form-error');
            const errorMsg = parent.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.style.display = 'none';
            }
        }
        
        return isValid;
    }
    
    // Success message function
    function showSuccessMessage() {
        const formSection = document.querySelector('.form-section');
        
        // Remove existing success message if any
        const existingSuccess = formSection.querySelector('.form-success');
        if (existingSuccess) {
            existingSuccess.remove();
        }
        
        // Create success message
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        successDiv.innerHTML = '✓ Pesan Anda berhasil dikirim! Terima kasih telah menghubungi kami.';
        
        // Insert before form
        const formSection2 = document.querySelector('.form-section');
        formSection2.insertBefore(successDiv, formSection2.querySelector('.contact-form'));
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            successDiv.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => {
                successDiv.remove();
            }, 500);
        }, 5000);
    }
    
    // Add scroll animation for page header
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
        pageHeader.style.animation = 'fadeInUp 0.8s ease';
    }
    
    // Add ripple effect to contact cards on click
    const contactCards = document.querySelectorAll('.contact-card');
    contactCards.forEach(card => {
        card.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.pointerEvents = 'none';
            ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
            ripple.style.animation = 'ripple-animation 0.6s ease-out';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
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

// Copy to clipboard function for contact info
document.addEventListener('DOMContentLoaded', function() {
    const contactCards = document.querySelectorAll('.contact-card');
    contactCards.forEach((card) => {
        card.style.cursor = 'pointer';
        card.setAttribute('title', 'Klik untuk menyalin');
        
        card.addEventListener('click', function(e) {
            // Don't copy on ripple animation
            if (e.target.tagName === 'SPAN') return;
            
            const text = this.querySelector('p').textContent;
            navigator.clipboard.writeText(text).then(() => {
                // Show modern toast notification
                showToast();
            });
        });
    });
    
    // Toast notification function
    function showToast() {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = 'Tersalin ke clipboard!';
        
        document.body.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    }
});
