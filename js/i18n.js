/* ============================================
   OSVENA — i18n (Internationalization)
   ============================================ */

(function () {
  let translations = {};
  let currentLang = localStorage.getItem('osvena-lang') || 'en';

  document.addEventListener('DOMContentLoaded', async () => {
    await loadTranslations(currentLang);
    applyTranslations();
    initLangToggle();
    updateToggleLabel();
  });

  async function loadTranslations(lang) {
    try {
      const res = await fetch(`lang/${lang}.json`);
      translations = await res.json();
    } catch (e) {
      console.warn('i18n: Could not load', lang, e);
    }
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = getNestedValue(translations, key);
      if (val) el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = getNestedValue(translations, key);
      if (val) el.setAttribute('placeholder', val);
    });
    document.querySelectorAll('[data-i18n-label]').forEach(el => {
      const key = el.getAttribute('data-i18n-label');
      const val = getNestedValue(translations, key);
      if (val) {
        // Preserve the required asterisk if present
        const req = el.querySelector('.required');
        el.textContent = val + ' ';
        if (req) el.appendChild(req.cloneNode(true));
      }
    });
    // Update html lang attribute
    document.documentElement.lang = currentLang;
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
  }

  function initLangToggle() {
    const btn = document.getElementById('langToggle');
    const btnMobile = document.getElementById('langToggleMobile');
    [btn, btnMobile].forEach(b => {
      if (b) b.addEventListener('click', toggleLanguage);
    });
  }

  async function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'sk' : 'en';
    localStorage.setItem('osvena-lang', currentLang);
    await loadTranslations(currentLang);
    applyTranslations();
    updateToggleLabel();
  }

  function updateToggleLabel() {
    const label = currentLang === 'en' ? 'SK' : 'EN';
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      const span = btn.querySelector('span');
      if (span) span.textContent = label;
    });
  }

  // Expose to window for other scripts
  window.i18n = {
    get: (key) => getNestedValue(translations, key),
    getLanguage: () => currentLang,
    apply: applyTranslations
  };

  // Dispatch event so other scripts know when translations are ready
  function dispatchUpdate() {
    window.dispatchEvent(new CustomEvent('i18nApplied', { detail: { lang: currentLang } }));
  }

  // Hook into applyTranslations to dispatch
  const originalApply = applyTranslations;
  applyTranslations = function() {
    originalApply();
    dispatchUpdate();
  };
})();
