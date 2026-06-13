/**
 * certificates.js — Dynamic certificate loader + game‑style card stack
 *
 * Fetches certificate data from a public GitHub repository.  Each certificate
 * is displayed as a chunky "slab" card in a fanned‑out deck.  Navigate with
 * arrow buttons or keyboard ←/→.  Click "View" to open a macOS‑style popup.
 *
 * ── Data sources (repo: nayaksomkar/myCerificates) ──
 *   certificates.json   →  certificate metadata (title, paths, URL)
 *   CertificateJPG/      →  certificate images (JPG)
 *
 * ── How to add a new certificate ──
 *   1. Upload the JPG to CertificateJPG/ in myCerificates
 *   2. Add an entry to certificates.json (Title, pathJPG, pathPDF, udemyURL)
 *   3. Done — it appears in the deck automatically.
 *
 * ── How to hide a certificate ──
 *   Add its title to ignoreCertificates[] in portfolio-config.json
 */

/* Source repo: https://github.com/nayaksomkar/myCertificates */
/* JSON: https://raw.githubusercontent.com/nayaksomkar/myCertificates/main/certificates.json */
/* Images: https://raw.githubusercontent.com/nayaksomkar/myCertificates/main/CertificateJPG/{filename} */
const CERT_REPO = 'nayaksomkar/myCertificates';
const CERT_BRANCH = 'main';
const CERT_JSON_URL = `https://raw.githubusercontent.com/${CERT_REPO}/${CERT_BRANCH}/certificates.json`;
const IMG_BASE = `https://raw.githubusercontent.com/${CERT_REPO}/${CERT_BRANCH}/`;

let certs = [];
let currentIndex = 0;

/**
 * Build the raw GitHub URL for a certificate image from its pathJPG value.
 * @param {string} pathJpg — e.g. "CertificateJPG/certificate_01.jpg"
 * @returns {string} — fully qualified URL to the raw image
 */
function certImageUrl(pathJpg) {
  return IMG_BASE + pathJpg;
}

/**
 * Escape a string for safe embedding in an HTML attribute.
 */
function escapeAttr(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

/**
 * Determine the position CSS class for a card based on its index
 * relative to currentIndex, with wrap‑around.
 */
function getPositionClass(idx, currentIdx, total) {
  if (total === 0) return 'hidden';
  if (idx === currentIdx) return 'active';
  if (total === 2) {
    return idx === (currentIdx + 1) % total ? 'next' : 'prev';
  }
  if (idx === (currentIdx + 1) % total) return 'next';
  if (idx === (currentIdx + 2) % total) return 'next-2';
  if (idx === (currentIdx - 1 + total) % total) return 'prev';
  if (idx === (currentIdx - 2 + total) % total) return 'prev-2';
  return 'hidden';
}

/* ───────── INIT ───────── */
(async function initCerts() {
  await loadConfig();
  const ignored = (config.ignoreCertificates || []).map(s => s.toLowerCase().trim());

  try {
    const res = await fetch(CERT_JSON_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const entries = Array.isArray(data) ? data : Object.values(data);
    if (!Array.isArray(entries)) throw new Error('Invalid JSON format');

    certs = entries.map(entry => ({
      title: entry.Title || entry.title || 'Untitled Certificate',
      badge: 'Udemy',
      image: entry.pathJPG || entry.pathjpg || entry.image ? certImageUrl(entry.pathJPG || entry.pathjpg || entry.image) : '',
      url: entry.udemyURL || entry.udemyUrl || entry.url || '#'
    }));
  } catch (err) {
    console.error('Failed to load certificates:', err);
    showEmptyState('Could not load certificates.');
    return;
  }

  certs = certs.filter(c => c.title && !ignored.includes(c.title.toLowerCase().trim()));
  localStorage.setItem('certsCount', certs.length);

  const descEl = document.getElementById('certs-desc');
  if (descEl) descEl.textContent = `${certs.length} Certification${certs.length !== 1 ? 's' : ''}`;

  if (certs.length === 0) {
    showEmptyState('No certificates to show.');
    return;
  }

  buildStack();
  positionCards(false);
  wireNavigation();
  startHintSystem();
  wrapHintText();
})();

function showEmptyState(msg) {
  const stack = document.getElementById('cert-stack');
  if (stack) stack.innerHTML = `<div class="cert-empty">${msg}</div>`;
  const controls = document.getElementById('cert-controls');
  if (controls) controls.style.display = 'none';
}

/* ───────── BUILD DOM ONCE ───────── */
function buildStack() {
  const stack = document.getElementById('cert-stack');
  let html = '';
  for (let i = 0; i < certs.length; i++) {
    const c = certs[i];
    const imgHtml = c.image
      ? `<img src="${c.image}" alt="${escapeAttr(c.title)}" class="cert-stack-img" loading="lazy" onerror="this.onerror=null;this.outerHTML='<div class=\\'cert-stack-img-placeholder\\'><i class=\\'fas fa-certificate\\'></i></div>'">`
      : `<div class="cert-stack-img-placeholder"><i class="fas fa-certificate"></i></div>`;
    html += `
      <div class="cert-stack-card" data-idx="${i}">
        ${imgHtml}
        <div class="cert-stack-body">
          <h3 class="cert-stack-title">${c.title}</h3>
          <span class="cert-badge">${c.badge}</span>
          <button class="cert-view-btn" data-idx="${i}"><i class="fas fa-external-link-alt"></i> View Certificate</button>
        </div>
      </div>`;
  }
  stack.innerHTML = html;

  /* Click anywhere on a card to open certificate popup */
  stack.addEventListener('click', e => {
    const card = e.target.closest('.cert-stack-card');
    if (!card) return;
    const idx = parseInt(card.dataset.idx, 10);
    const c = certs[idx];
    if (c) openCertWindow(idx);
  });
}

/* ───────── POSITION CARDS ───────── */
function positionCards(animate) {
  const cards = document.querySelectorAll('.cert-stack-card');
  const total = certs.length;
  if (!animate) {
    document.getElementById('cert-stack').classList.add('no-transition');
  }
  cards.forEach((card, i) => {
    card.className = 'cert-stack-card ' + getPositionClass(i, currentIndex, total);
  });
  if (!animate) {
    void document.getElementById('cert-stack').offsetHeight;
    document.getElementById('cert-stack').classList.remove('no-transition');
  }
  updateCounter();
}

function updateCounter() {
  const el = document.getElementById('cert-counter');
  if (el) el.textContent = certs.length > 0 ? `${currentIndex + 1} / ${certs.length}` : '';
}

/* ───────── NAVIGATION ───────── */
function goToPrev() {
  if (certs.length < 2) return;
  currentIndex = (currentIndex - 1 + certs.length) % certs.length;
  positionCards(true);
}

function goToNext() {
  if (certs.length < 2) return;
  currentIndex = (currentIndex + 1) % certs.length;
  positionCards(true);
}

function wireNavigation() {
  const prevBtn = document.getElementById('cert-prev');
  const nextBtn = document.getElementById('cert-next');
  if (prevBtn) prevBtn.addEventListener('click', goToPrev);
  if (nextBtn) nextBtn.addEventListener('click', goToNext);

  /* Keyboard — skip when popup is open */
  document.addEventListener('keydown', function navKey(e) {
    if (document.querySelector('.cert-overlay')) return;
    if (!document.getElementById('cert-stack')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); goToPrev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goToNext(); }
  });

  /* Touch swipe on stack */
  const stack = document.getElementById('cert-stack');
  if (!stack) return;
  let touchX = 0;
  stack.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  stack.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) {
      if (dx > 0) goToPrev();
      else goToNext();
    }
  }, { passive: true });
}

/* ───────── POPUP WINDOW ───────── */
let popupIdx = 0; /* independent of currentIndex — background cards stay put */

function openCertWindow(idx) {
  if (!certs.length || document.querySelector('.cert-overlay')) return;
  popupIdx = idx;

  const overlay = document.createElement('div');
  overlay.className = 'window-overlay cert-overlay';
  overlay.innerHTML = `
    <div class="window cert-window">
      <div class="window-titlebar">
        <span class="window-title">${escapeAttr(certs[idx].title)}</span>
        <div class="window-controls">
          <button class="win-btn close cert-close"><i class="fas fa-times"></i></button>
          <button class="win-btn minimize cert-min"><i class="fas fa-minus"></i></button>
          <button class="win-btn maximize cert-max"><i class="fas fa-expand"></i></button>
        </div>
      </div>
      <div class="window-body cert-popup-body">
        <div class="popup-hint-left"><span class="hint-arrows"><span>&gt;</span><span>&gt;</span><span>&gt;</span></span></div>
        <img id="popup-img" src="${certs[idx].image}" alt="${escapeAttr(certs[idx].title)}"
             class="cert-popup-img">
        <div class="popup-hint-right"><span class="hint-arrows"><span>&gt;</span><span>&gt;</span><span>&gt;</span></span></div>
      </div>
      <div class="window-footer cert-popup-footer">
        <span class="cert-counter" id="popup-counter">${idx + 1} / ${certs.length}</span>
        <span class="cert-hint-text popup-nav-hint">use arrow keys or swipe to navigate</span>
        <a href="${certs[idx].url}" target="_blank" class="btn-gh popup-udemy-link"><i class="fas fa-external-link-alt"></i> View on Udemy</a>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  const win = overlay.querySelector('.cert-window');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('open');
      win.classList.add('visible');
    });
  });

  overlay.querySelector('.cert-close').onclick = closeCertWindow;
  overlay.querySelector('.cert-min').onclick = () => {
    win.classList.remove('visible');
    win.classList.add('minimized');
    setTimeout(closeCertWindow, 280);
  };
  overlay.querySelector('.cert-max').onclick = () => {
    win.classList.toggle('maximized');
    const icon = overlay.querySelector('.cert-max i');
    icon.className = win.classList.contains('maximized') ? 'fas fa-compress' : 'fas fa-expand';
  };

  overlay.onclick = e => { if (e.target === overlay) closeCertWindow(); };
  document.addEventListener('keydown', popupKeyHandler);
  wrapHintText();

  /* Touch swipe on popup image */
  const popupBody = overlay.querySelector('.cert-popup-body');
  let touchX = 0;
  popupBody.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  popupBody.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) {
      if (dx > 0) popupGoPrev();
      else popupGoNext();
    }
  }, { passive: true });
}

function popupGoPrev() {
  if (certs.length < 2) return;
  popupIdx = (popupIdx - 1 + certs.length) % certs.length;
  currentIndex = popupIdx;
  positionCards(true);
  updatePopupContent();
}

function popupGoNext() {
  if (certs.length < 2) return;
  popupIdx = (popupIdx + 1) % certs.length;
  currentIndex = popupIdx;
  positionCards(true);
  updatePopupContent();
}

function updatePopupContent() {
  const c = certs[popupIdx];
  const overlay = document.querySelector('.cert-overlay');
  if (!overlay) return;
  overlay.querySelector('.window-title').textContent = c.title;
  overlay.querySelector('#popup-counter').textContent = `${popupIdx + 1} / ${certs.length}`;
  overlay.querySelector('.popup-udemy-link').href = c.url;

  const img = overlay.querySelector('#popup-img');
  img.style.opacity = '0';

  const preloader = new Image();
  preloader.onload = () => {
    img.src = c.image;
    img.alt = c.title;
    img.style.opacity = '1';
  };
  preloader.onerror = () => {
    img.src = c.image;
    img.alt = c.title;
    img.style.opacity = '1';
  };
  preloader.src = c.image;
}

function popupKeyHandler(e) {
  if (e.key === 'Escape') closeCertWindow();
  if (e.key === 'ArrowLeft') { e.preventDefault(); popupGoPrev(); }
  if (e.key === 'ArrowRight') { e.preventDefault(); popupGoNext(); }
}

function closeCertWindow() {
  const overlay = document.querySelector('.cert-overlay');
  if (!overlay) return;
  const win = overlay.querySelector('.cert-window');
  win.classList.remove('visible');
  win.classList.add('closing');
  overlay.classList.remove('open');
  overlay.classList.add('closing');
  document.removeEventListener('keydown', popupKeyHandler);
  setTimeout(() => overlay.remove(), 300);
}

/* ───────── HINT SYSTEM ───────── */
let hintInterval = null;

function startHintSystem() {
  if (certs.length < 2) return;

  function pulseArrows() {
    document.querySelectorAll('.cert-hint-left, .cert-hint-right, .popup-hint-left, .popup-hint-right').forEach(el => {
      el.classList.remove('hint-pulse');
      void el.offsetWidth;
      el.classList.add('hint-pulse');
    });
  }

  function fireHint() {
    pulseArrows();
  }

  hintInterval = setInterval(fireHint, 6000);

  fireHint();
}

function stopHintSystem() {
  if (hintInterval) { clearInterval(hintInterval); hintInterval = null; }
}

/* ───────── WAVE ANIMATION FOR HINT TEXT ───────── */
function wrapHintText() {
  document.querySelectorAll('.cert-hint-text').forEach(el => {
    if (el.dataset.wrapped) return;
    const text = el.textContent.trim();
    el.innerHTML = '';
    el.dataset.wrapped = 'true';
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
      span.style.setProperty('--i', i);
      span.className = 'hint-char';
      el.appendChild(span);
    }
  });
}
