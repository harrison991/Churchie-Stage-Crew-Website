// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global state for dynamic content
let dynamicContent = {
    home: null,
    about: null
};

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Load dynamic content based on current page
    loadPageContent();
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Animated counters for stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current);
        }, 16);
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            
            // Trigger counter animation for stats section
            if (entry.target.classList.contains('stats')) {
                animateCounters();
            }
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.feature-card, .event-card, .stats, .content-card');
    animatedElements.forEach(el => observer.observe(el));
});

// Form validation and submission
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            input.style.borderColor = '#e1e5e9';
        }
        
        // Email validation
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                input.style.borderColor = '#e74c3c';
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Handle form submissions
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(form.id)) {
                // Show success message
                showNotification('Thank you! Your message has been sent successfully.', 'success');
                form.reset();
            } else {
                showNotification('Please fill in all required fields correctly.', 'error');
            }
        });
    });
});

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

// Add notification animations to CSS
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: auto;
        padding: 0;
        opacity: 0.8;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(notificationStyles);

// Gallery lightbox functionality
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            openLightbox(index);
        });
    });
}

function openLightbox(index) {
    const galleryItems = document.querySelectorAll('.gallery-item img');
    if (galleryItems.length === 0) return;
    
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <span class="lightbox-close">&times;</span>
            <img src="${galleryItems[index].src}" alt="${galleryItems[index].alt || 'Gallery Image'}">
            <div class="lightbox-nav">
                <button class="lightbox-prev">&#10094;</button>
                <button class="lightbox-next">&#10095;</button>
            </div>
            <div class="lightbox-counter">${index + 1} / ${galleryItems.length}</div>
        </div>
    `;
    
    // Lightbox styles
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';
    
    let currentIndex = index;
    
    // Navigation functions
    function showImage(newIndex) {
        if (newIndex >= 0 && newIndex < galleryItems.length) {
            currentIndex = newIndex;
            const img = lightbox.querySelector('img');
            const counter = lightbox.querySelector('.lightbox-counter');
            img.src = galleryItems[currentIndex].src;
            img.alt = galleryItems[currentIndex].alt || 'Gallery Image';
            counter.textContent = `${currentIndex + 1} / ${galleryItems.length}`;
        }
    }
    
    // Event listeners
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showImage(currentIndex - 1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => showImage(currentIndex + 1));
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeydown);
    
    // Click outside to close
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    function handleKeydown(e) {
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showImage(currentIndex - 1);
                break;
            case 'ArrowRight':
                showImage(currentIndex + 1);
                break;
        }
    }
    
    function closeLightbox() {
        document.removeEventListener('keydown', handleKeydown);
        document.body.style.overflow = '';
        lightbox.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (lightbox.parentNode) {
                lightbox.remove();
            }
        }, 300);
    }
}

// Add lightbox styles
const lightboxStyles = document.createElement('style');
lightboxStyles.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    .lightbox-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
    }
    
    .lightbox-content img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }
    
    .lightbox-close {
        position: absolute;
        top: -40px;
        right: 0;
        background: none;
        border: none;
        color: white;
        font-size: 2rem;
        cursor: pointer;
        z-index: 10001;
    }
    
    .lightbox-nav button {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 2rem;
        padding: 10px 15px;
        cursor: pointer;
        border-radius: 5px;
        transition: background 0.3s ease;
    }
    
    .lightbox-nav button:hover {
        background: rgba(255, 255, 255, 0.4);
    }
    
    .lightbox-prev {
        left: -60px;
    }
    
    .lightbox-next {
        right: -60px;
    }
    
    .lightbox-counter {
        position: absolute;
        bottom: -40px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        font-size: 1rem;
    }
    
    @media (max-width: 768px) {
        .lightbox-nav button {
            top: auto;
            bottom: 20px;
            position: fixed;
        }
        
        .lightbox-prev {
            left: 20px;
        }
        
        .lightbox-next {
            right: 20px;
        }
        
        .lightbox-close {
            top: 20px;
            right: 20px;
            position: fixed;
        }
        
        .lightbox-counter {
            bottom: 80px;
        }
    }
`;
document.head.appendChild(lightboxStyles);

// Initialize gallery when page loads
document.addEventListener('DOMContentLoaded', initGallery);

// Active navigation highlighting
function updateActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage || 
            (currentPage === '' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Update active nav on page load
document.addEventListener('DOMContentLoaded', updateActiveNav);

// API Integration Functions
async function makeAPIRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        // Return fallback data or null
        return null;
    }
}

// Load dynamic content based on current page
async function loadPageContent() {
    const currentPage = getCurrentPageName();
    
    switch (currentPage) {
        case 'index':
        case 'home':
            await loadHomeContent();
            break;
        case 'about':
            await loadAboutContent();
            break;
        default:
            // For other pages, just initialize existing functionality
            break;
    }
}

function getCurrentPageName() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    return filename.replace('.html', '') || 'index';
}

// Load Home Page Content
async function loadHomeContent() {
    const content = await makeAPIRequest('/content/home');
    
    if (content) {
        dynamicContent.home = content;
        updateHomePageElements(content);
    }
}

function updateHomePageElements(content) {
    // Update hero section
    if (content.hero) {
        const titleElement = document.querySelector('.hero h1');
        const subtitleElement = document.querySelector('.hero .subtitle');
        const descriptionElement = document.querySelector('.hero p');
        
        if (titleElement) titleElement.textContent = content.hero.title;
        if (subtitleElement) subtitleElement.textContent = content.hero.subtitle;
        if (descriptionElement) descriptionElement.textContent = content.hero.description;
        
        // Update hero buttons
        const buttonContainer = document.querySelector('.hero-buttons');
        if (buttonContainer && content.hero.buttons) {
            buttonContainer.innerHTML = content.hero.buttons.map(btn => 
                `<a href="${btn.link}" class="btn btn-${btn.type}">${btn.text}</a>`
            ).join('');
        }
    }
    
    // Update features section
    if (content.features) {
        const featuresContainer = document.querySelector('.features-grid');
        if (featuresContainer) {
            featuresContainer.innerHTML = content.features.map(feature => `
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="${feature.icon}"></i>
                    </div>
                    <h3>${feature.title}</h3>
                    <p>${feature.description}</p>
                </div>
            `).join('');
        }
    }
    
    // Update statistics
    if (content.stats) {
        content.stats.forEach((stat, index) => {
            const statElements = document.querySelectorAll('.stat-item');
            if (statElements[index]) {
                const numberElement = statElements[index].querySelector('.stat-number');
                const labelElement = statElements[index].querySelector('.stat-label');
                
                if (numberElement) numberElement.textContent = stat.number;
                if (labelElement) labelElement.textContent = stat.label;
            }
        });
    }
    
    // Update upcoming events
    if (content.upcoming_events) {
        const eventsContainer = document.querySelector('.events-grid');
        if (eventsContainer) {
            eventsContainer.innerHTML = content.upcoming_events.map(event => `
                <div class="event-card">
                    <div class="event-date">
                        <span class="event-day">${event.date.day}</span>
                        <span class="event-month">${event.date.month}</span>
                    </div>
                    <div class="event-info">
                        <h3>${event.title}</h3>
                        <p>${event.description}</p>
                        <span class="event-time">${event.time}</span>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Load About Page Content
async function loadAboutContent() {
    const content = await makeAPIRequest('/content/about');
    
    if (content) {
        dynamicContent.about = content;
        updateAboutPageElements(content);
    }
}

function updateAboutPageElements(content) {
    // Update mission statement
    const missionElement = document.querySelector('.mission-statement p');
    if (missionElement && content.mission) {
        missionElement.textContent = content.mission;
    }
    
    // Update vision statement
    const visionElement = document.querySelector('.vision-statement p');
    if (visionElement && content.vision) {
        visionElement.textContent = content.vision;
    }
    
    // Update values
    if (content.values) {
        const valuesContainer = document.querySelector('.values-grid');
        if (valuesContainer) {
            valuesContainer.innerHTML = content.values.map(value => `
                <div class="value-card">
                    <h3>${value.name}</h3>
                    <p>${value.description}</p>
                </div>
            `).join('');
        }
    }
    
    // Update staff
    if (content.staff) {
        const staffContainer = document.querySelector('.staff-grid');
        if (staffContainer) {
            staffContainer.innerHTML = content.staff.map(staff => `
                <div class="staff-card">
                    <h3>${staff.name}</h3>
                    <h4>${staff.role}</h4>
                    <p>${staff.description}</p>
                </div>
            `).join('');
        }
    }
    
    // Update student leaders
    if (content.student_leaders) {
        const leadersContainer = document.querySelector('.leaders-grid');
        if (leadersContainer) {
            leadersContainer.innerHTML = content.student_leaders.map(leader => `
                <div class="leader-card">
                    <div class="leader-icon">
                        <i class="${leader.icon}"></i>
                    </div>
                    <h3>${leader.title}</h3>
                    <h4>${leader.name}</h4>
                    <p class="leader-year">${leader.year}</p>
                    <p>${leader.description}</p>
                </div>
            `).join('');
        }
    }
    
    // Update awards
    if (content.awards) {
        const awardsContainer = document.querySelector('.awards-grid');
        if (awardsContainer) {
            awardsContainer.innerHTML = content.awards.map(award => `
                <div class="award-card">
                    <div class="award-icon">
                        <i class="${award.icon}"></i>
                    </div>
                    <h3>${award.title}</h3>
                    <p class="award-year">${award.year}</p>
                    <p>${award.description}</p>
                </div>
            `).join('');
        }
    }
    
    // Update timeline if it exists
    if (content.history) {
        const timelineContainer = document.querySelector('.timeline');
        if (timelineContainer) {
            timelineContainer.innerHTML = content.history.map(item => `
                <div class="timeline-item">
                    <div class="timeline-year">${item.year}</div>
                    <div class="timeline-content">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Enhanced form submission for contact and application forms
async function submitContactForm(formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            return true;
        } else {
            showNotification(result.error || 'Error sending message. Please try again.', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error submitting contact form:', error);
        showNotification('Error sending message. Please check your connection and try again.', 'error');
        return false;
    }
}

async function submitApplicationForm(formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Application submitted successfully! We\'ll review it and get back to you.', 'success');
            return true;
        } else {
            showNotification(result.error || 'Error submitting application. Please try again.', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error submitting application:', error);
        showNotification('Error submitting application. Please check your connection and try again.', 'error');
        return false;
    }
}

// Update existing form handlers to use API
document.addEventListener('DOMContentLoaded', function() {
    // Contact form handler
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            
            const success = await submitContactForm(data);
            if (success) {
                contactForm.reset();
            }
        });
    }
    
    // Application form handler
    const applicationForm = document.getElementById('application-form');
    if (applicationForm) {
        applicationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(applicationForm);
            const data = Object.fromEntries(formData.entries());
            
            // Convert checkbox arrays to proper arrays
            const interests = formData.getAll('interests');
            const availability = formData.getAll('availability');
            const commitments = formData.getAll('commitments');
            
            data.interests = interests;
            data.availability = availability;
            data.commitments = commitments;
            data.parent_consent = formData.has('parent_consent');
            
            const success = await submitApplicationForm(data);
            if (success) {
                applicationForm.reset();
            }
        });
    }
});

// Fallback content loading for when API is not available
function loadFallbackContent() {
    console.log('API not available, using static content');
    // The existing static HTML content will be displayed
}

// Health check for API availability
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Initialize API connectivity check
document.addEventListener('DOMContentLoaded', async function() {
    const apiAvailable = await checkAPIHealth();
    if (!apiAvailable) {
        console.warn('API server not available, using static content');
        loadFallbackContent();
    }
});
