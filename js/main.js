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

// Sem vlož svoju Google Apps Script Web App URL po nasadení:
var SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwWpK9GNNWjtoT9CSLY2wamnyoFls4E8uyAdSfm2t97W0qqouazQxhIGxWfKoC8Nn8/exec';

/* --- Google Sheets logging (fire-and-forget) --- */
async function logToGoogleSheets(formData) {
  if (!SHEETS_ENDPOINT || SHEETS_ENDPOINT.includes('YOUR_GOOGLE')) return;
  try {
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (!key.startsWith('_')) params.append(key, value);
    }
    await fetch(SHEETS_ENDPOINT, { method: 'POST', body: params, mode: 'no-cors' });
  } catch (e) {
    console.warn('Sheets log failed:', e);
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

      // Zaznamenaj do Google Sheets (nezávisí od emailu)
      logToGoogleSheets(formData);

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

/* --- Testimonials 3D Marquee --- */
const TESTIMONIALS_FALLBACK = [
  { name: "Adam Kováč",    username: "@adam_k",  body: "OSVENA built us a website that doubled our conversions within a month. Exactly what we needed.",                     country: "🇸🇰 Slovakia" },
  { name: "Lucia Veselá",  username: "@luci_v",  body: "The AI receptionist never misses a call. It saved us dozens of hours every single month.",                           country: "🇨🇿 Czechia"  },
  { name: "Peter Horváth", username: "@peter_h", body: "OSVENA's PPC campaigns tripled our leads at the same budget. The results speak for themselves.",                     country: "🇸🇰 Slovakia" },
  { name: "Zuzana Blahová",username: "@zuzka_b", body: "The new brand identity from OSVENA elevated the entire perception of our company.",                                  country: "🇸🇰 Slovakia" },
  { name: "Mateo Rossi",   username: "@mat",      body: "Beautiful design, lightning-fast load times. Our clients are genuinely impressed.",                                  country: "🇮🇹 Italy"    },
  { name: "Maya Patel",    username: "@maya",     body: "The AI receptionist is available 24/7 and never misses a beat. A must-have for any business.",                      country: "🇬🇧 UK"       },
  { name: "Noah Smith",    username: "@noah",     body: "OSVENA delivered ahead of schedule with zero compromises on quality. Highly recommended.",                           country: "🇺🇸 USA"      },
  { name: "Emma Lee",      username: "@emma",     body: "Our follower count tripled after OSVENA took over our social media content strategy.",                               country: "🇨🇦 Canada"   },
  { name: "Lucas Stone",   username: "@luc",      body: "Always available, always professional. OSVENA feels like part of our own in-house team.",                           country: "🇫🇷 France"   }
];

const TESTIMONIAL_IMAGES = [
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

function initTestimonials() {
  renderTestimonials();
  window.addEventListener('i18nApplied', renderTestimonials);
}

function renderTestimonials() {
  const i18nItems = window.i18n?.get('testimonials.items');
  const testimonials = (Array.isArray(i18nItems) && i18nItems.length > 0)
    ? i18nItems
    : TESTIMONIALS_FALLBACK;

  function createCard(review, index) {
    const img = TESTIMONIAL_IMAGES[index % TESTIMONIAL_IMAGES.length];
    return `
      <div class="t-card">
        <div class="t-card-header">
          <div class="t-avatar"><img src="${img}" alt="${review.name}" loading="lazy"></div>
          <div class="t-meta">
            <figcaption class="t-name">${review.name} <span class="t-country">${review.country}</span></figcaption>
            <p class="t-username">${review.username}</p>
          </div>
        </div>
        <blockquote class="t-body">${review.body}</blockquote>
      </div>`;
  }

  const cardsHtml = testimonials.map(createCard).join('');
  const marqueeHtml = `
    <div class="t-marquee-inner">${cardsHtml}</div>
    <div class="t-marquee-inner" aria-hidden="true">${cardsHtml}</div>
    <div class="t-marquee-inner" aria-hidden="true">${cardsHtml}</div>`;

  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('marquee-' + i);
    if (el) el.innerHTML = marqueeHtml;
  }
}
