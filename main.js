// Main JavaScript file

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application initialized');
    
    // Initialize mobile navigation
    initMobileNav();
    
    // Initialize contact form
    initContactForm();
});

// Mobile Navigation
function initMobileNav() {
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const navContainer = document.querySelector('.nav-container');

    if (navToggle && navContainer) {
        navToggle.addEventListener('click', () => {
            const isVisible = navContainer.getAttribute('data-visible') === 'true';
            navContainer.setAttribute('data-visible', !isVisible);
            navToggle.setAttribute('aria-expanded', !isVisible);
            navToggle.innerHTML = !isVisible ? 
                '<span class="sr-only">Close</span><i class="fas fa-times"></i>' : 
                '<span class="sr-only">Menu</span><i class="fas fa-bars"></i>';
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && 
                !navContainer.contains(e.target) && 
                navContainer.getAttribute('data-visible') === 'true') {
                navContainer.setAttribute('data-visible', 'false');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.innerHTML = '<span class="sr-only">Menu</span><i class="fas fa-bars"></i>';
            }
        });
    }
}

// User Authentication Status
function checkAuthStatus() {
    // TODO: Implement authentication status check
    return false; // Default to not authenticated
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Handle contact form submission
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: contactForm.name.value,
                email: contactForm.email.value,
                message: contactForm.message.value
            };
            
            // For now, just log the data (will be implemented with backend)
            console.log('Form submitted:', formData);
            
            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            
            // Reset form
            contactForm.reset();
        });
    }
}