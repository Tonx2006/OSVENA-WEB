/* ============================================
   OSVENA — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSmoothScroll();
  initMobileMenu();
  initContactForm();
  initTestimonials();
});

/* --- Navbar scroll effect --- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
        updateActiveNav();
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* --- Active nav link on scroll --- */
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a, .mobile-overlay a');
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) current = section.id;
  });
  links.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
}

/* --- Smooth scroll for anchor links --- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = 80;
        const y = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        // Close mobile menu if open
        closeMobileMenu();
      }
    });
  });
}

/* --- Mobile menu --- */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('mobileOverlay');
  if (!hamburger || !overlay) return;
  hamburger.addEventListener('click', () => {
    const open = overlay.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
}

function closeMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('mobileOverlay');
  if (overlay && overlay.classList.contains('open')) {
    overlay.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* --- Contact Form --- */
function initContactForm() {
  const form = document.getElementById('contactFormInner');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm(form)) return;
    
    const btn = form.querySelector('.form-submit');
    if (btn) btn.classList.add('loading');
    btn.disabled = true;

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        showFormSuccess();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Sorry, there was an error sending your message. Please try again or contact us directly.');
    } finally {
      if (btn) {
        btn.classList.remove('loading');
        btn.disabled = false;
      }
    }
  });

  // Real-time validation clear
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => {
      input.closest('.form-group')?.classList.remove('error');
    });
  });
}

function validateForm(form) {
  let valid = true;
  const fields = [
    { name: 'firstName', validate: v => v.trim().length > 0 },
    { name: 'lastName', validate: v => v.trim().length > 0 },
    { name: 'email', validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { name: 'phone', validate: v => /^[\d\s\+\-\(\)]{6,}$/.test(v) },
    { name: 'message', validate: v => v.trim().length > 0 }
  ];

  fields.forEach(({ name, validate }) => {
    const input = form.querySelector(`[name="${name}"]`);
    const group = input?.closest('.form-group');
    if (input && group) {
      if (!validate(input.value)) {
        group.classList.add('error');
        valid = false;
      } else {
        group.classList.remove('error');
      }
    }
  });

  return valid;
}

function showFormSuccess() {
  const formEl = document.getElementById('contactFormInner');
  const successEl = document.getElementById('formSuccess');
  if (formEl) formEl.style.display = 'none';
  if (successEl) successEl.classList.add('show');
}

/* --- 3D Testimonials Marquee --- */
function initTestimonials() {
  window.addEventListener('i18nApplied', () => {
    renderTestimonials();
  });
  
  // Initial render
  renderTestimonials();
}

function renderTestimonials() {
  const testimonials = window.i18n?.get('testimonials.items') || [];
  if (testimonials.length === 0) return;

  // We reuse images from a set of diverse placeholders if they are not provided in JSON
  const images = [
    'https://randomuser.me/api/portraits/men/32.jpg',
    'https://randomuser.me/api/portraits/women/68.jpg',
    'https://randomuser.me/api/portraits/men/51.jpg',
    'https://randomuser.me/api/portraits/women/53.jpg',
    'https://randomuser.me/api/portraits/men/33.jpg',
    'https://randomuser.me/api/portraits/men/22.jpg',
    'https://randomuser.me/api/portraits/men/85.jpg',
    'https://randomuser.me/api/portraits/women/45.jpg',
    'https://randomuser.me/api/portraits/men/61.jpg'
  ];

  function createCard(review, index) {
    const img = images[index % images.length];
    return `
      <div class="t-card">
        <div class="t-card-header">
          <div class="t-avatar"><img src="${img}" alt="${review.username}" loading="lazy"></div>
          <div class="t-meta">
            <figcaption class="t-name">${review.name} <span class="t-country">${review.country}</span></figcaption>
            <p class="t-username">${review.username}</p>
          </div>
        </div>
        <blockquote class="t-body">${review.body}</blockquote>
      </div>
    `;
  }

  const cardsHtml = testimonials.map(createCard).join('');
  
  // Create 3 chunks to ensure seamless infinite scrolling
  const marqueeInnerHtml = `
    <div class="t-marquee-inner">${cardsHtml}</div>
    <div class="t-marquee-inner" aria-hidden="true">${cardsHtml}</div>
    <div class="t-marquee-inner" aria-hidden="true">${cardsHtml}</div>
  `;

  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('marquee-' + i);
    if (el) el.innerHTML = marqueeInnerHtml;
  }
}

