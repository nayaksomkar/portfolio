/* ───────── THEME TOGGLE ───────── */
const toggle = document.getElementById('theme-toggle');

if (localStorage.getItem('theme') === 'light') {
  toggle.checked = true;
  document.body.classList.add('light-mode');
  document.body.classList.remove('night-mode');
}

toggle.addEventListener('change', () => {
  document.body.classList.toggle('light-mode', toggle.checked);
  document.body.classList.toggle('night-mode', !toggle.checked);
  localStorage.setItem('theme', toggle.checked ? 'light' : 'dark');
});

/* ───────── CONFIG (shared) ───────── */
let config = { ignoreProjects: [], priorityProjects: [], ignoreCertificates: [], cocApiKey: '' };

async function loadConfig() {
  try {
    const res = await fetch('portfolio-config.json');
    if (res.ok) config = await res.json();
  } catch {}
}

/* ───────── PAGE TRANSITION ───────── */
const pageWrap = document.querySelector('.page-wrap');

if (pageWrap) {
  document.querySelectorAll('.nav-links .nav-link').forEach(link => {
    link.addEventListener('click', e => {
      if (link.getAttribute('href') && !link.getAttribute('target')) {
        e.preventDefault();
        const href = link.getAttribute('href');
        pageWrap.classList.add('page-fold');
        setTimeout(() => { window.location = href; }, 350);
      }
    });
  });
}

/* ───────── BACKGROUND TEXT ───────── */
const BG_TEXT = '\u0928\u093E\u092F\u0915 Omkar';
const bgContainer = document.getElementById('bg-text');

function buildBgText() {
  bgContainer.innerHTML = '';
  const numCols = window.innerWidth < 480 ? 1 : window.innerWidth < 768 ? 2 : 3;
  const numRows = Math.ceil(window.innerHeight / 120) + 4;
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const span = document.createElement('span');
      span.className = 'bg-text-item';
      span.textContent = BG_TEXT;
      bgContainer.appendChild(span);
    }
  }
}
buildBgText();

let rebuildTimer;
window.addEventListener('resize', () => {
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(buildBgText, 400);
});

/* ───────── ASCII ART MAGIC ───────── */
const asciiArt = document.getElementById('ascii-art');
let heartTapCount = 0;
let heartTapTimer;

function triggerErrorHearts() {
  if (document.querySelector('.hearts-overlay')) return;

  if (navigator.vibrate) navigator.vibrate([60, 40, 60, 40, 80, 50, 100, 60, 120]);

  const overlay = document.createElement('div');
  overlay.className = 'hearts-overlay';
  overlay.style.background = 'rgba(239,68,68,0.06)';
  document.body.appendChild(overlay);

  const emojis = ['❤️', '💖', '💗', '♥️', '❣️'];
  const isMobile = window.innerWidth < 640;
  const count = isMobile ? 22 : 28;

  for (let i = 0; i < count; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const delay = (Math.random() * 1.2).toFixed(2);

    const el = document.createElement('div');
    el.className = 'hearts-particle';
    el.textContent = emojis[i % emojis.length];
    el.style.left = x + '%';
    el.style.top = y + '%';
    el.style.fontSize = (isMobile ? 2.0 : 2.8) + (Math.random() * (isMobile ? 1.2 : 1.5)) + 'rem';
    el.style.setProperty('--delay', delay + 's');
    overlay.appendChild(el);

    const childCount = isMobile ? 2 : 3;
    const spread = isMobile ? 7 : 12;
    for (let c = 0; c < childCount; c++) {
      const child = document.createElement('div');
      child.className = 'hearts-particle child';
      child.textContent = emojis[(i + c + 1) % emojis.length];
      child.style.left = (x + (Math.random() - 0.5) * spread) + '%';
      child.style.top = (y + (Math.random() - 0.5) * spread) + '%';
      child.style.fontSize = (isMobile ? 0.8 : 0.6) + Math.random() * (isMobile ? 0.6 : 0.8) + 'rem';
      child.style.setProperty('--delay', (parseFloat(delay) + 0.25 + Math.random() * 0.3).toFixed(2) + 's');
      overlay.appendChild(child);
    }
  }

  setTimeout(() => {
    overlay.querySelectorAll('.hearts-particle').forEach(function(el) {
      el.textContent = Math.random() > 0.3 ? '💔' : '🖤';
    });
  }, 1200);

  setTimeout(function() {
    overlay.querySelectorAll('.hearts-particle').forEach(function(el) { el.classList.add('exit'); });
  }, 2800);

  setTimeout(function() { overlay.remove(); }, 3800);
}

function triggerHearts() {
  if (document.querySelector('.hearts-overlay')) return;

  if (navigator.vibrate) {
    navigator.vibrate([50, 30, 50, 30, 50, 50, 50, 50, 50, 60, 60, 60, 80, 80, 100, 80, 60]);
  }

  const overlay = document.createElement('div');
  overlay.className = 'hearts-overlay';
  document.body.appendChild(overlay);

  const emojis = ['🖤', '🤍', '💜', '🦢', '✨'];
  const isMobile = window.innerWidth < 640;
  const count = isMobile ? 22 : 28;

  for (let i = 0; i < count; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const delay = (Math.random() * 1.2).toFixed(2);

    const el = document.createElement('div');
    el.className = 'hearts-particle';
    el.textContent = emojis[i % emojis.length];
    el.style.left = x + '%';
    el.style.top = y + '%';
    el.style.fontSize = (isMobile ? 2.0 : 2.8) + (Math.random() * (isMobile ? 1.2 : 1.5)) + 'rem';
    el.style.setProperty('--delay', delay + 's');
    overlay.appendChild(el);

    const childCount = isMobile ? 2 : 3;
    const spread = isMobile ? 7 : 12;
    for (let c = 0; c < childCount; c++) {
      const child = document.createElement('div');
      child.className = 'hearts-particle child';
      child.textContent = emojis[(i + c + 1) % emojis.length];
      child.style.left = (x + (Math.random() - 0.5) * spread) + '%';
      child.style.top = (y + (Math.random() - 0.5) * spread) + '%';
      child.style.fontSize = (isMobile ? 0.8 : 0.6) + Math.random() * (isMobile ? 0.6 : 0.8) + 'rem';
      child.style.setProperty('--delay', (parseFloat(delay) + 0.25 + Math.random() * 0.3).toFixed(2) + 's');
      overlay.appendChild(child);
    }
  }

  setTimeout(() => {
    overlay.querySelectorAll('.hearts-particle').forEach(el => el.classList.add('exit'));
  }, 2200);

  setTimeout(() => {
    overlay.remove();
  }, 3500);
}

function showMagicPopup() {
  if (document.querySelector('.magic-popup')) return;

  if (navigator.vibrate) navigator.vibrate(60);

  const popup = document.createElement('div');
  popup.className = 'magic-popup';
  popup.innerHTML = `
    <div class="magic-card">
      <div class="magic-icon">🔮</div>
      <p class="magic-ask">enter the magic number</p>
      <div style="display:flex;gap:0.5rem;justify-content:center;margin:0.8rem 0;">
        <input class="magic-box" id="m0" maxlength="1" inputmode="numeric" autofocus>
        <input class="magic-box" id="m1" maxlength="1" inputmode="numeric">
        <input class="magic-box" id="m2" maxlength="1" inputmode="numeric">
      </div>
      <button class="magic-submit-two">✨ unlock</button>
    </div>
  `;
  document.body.appendChild(popup);

  const inputs = [popup.querySelector('#m0'), popup.querySelector('#m1'), popup.querySelector('#m2')];
  const card = popup.querySelector('.magic-card');
  const btn = popup.querySelector('.magic-submit-two');

  for (let i = 0; i < 3; i++) {
    inputs[i].addEventListener('input', function() {
      if (this.value && i < 2) inputs[i + 1].focus();
    });
    inputs[i].addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && !this.value && i > 0) inputs[i - 1].focus();
      if (e.key === 'Enter') checkAnswer();
    });
  }

  function checkAnswer() {
    const val = inputs.map(inp => inp.value).join('');
    if (val === '634') {
      popup.remove();
      triggerHearts();
    } else {
      if (navigator.vibrate) navigator.vibrate([60, 40, 60, 40, 80, 50, 100]);
      popup.remove();
      triggerErrorHearts();
    }
  }

  btn.addEventListener('click', checkAnswer);

  popup.addEventListener('click', e => {
    if (e.target === popup) popup.remove();
  });

  setTimeout(() => inputs[0].focus(), 100);
}

let magicCounterEl = null;

function removeMagicCounter() {
  if (magicCounterEl) { magicCounterEl.remove(); magicCounterEl = null; }
}

function updateMagicCounter(count) {
  removeMagicCounter();
  if (count >= 6) return;
  magicCounterEl = document.createElement('div');
  magicCounterEl.className = 'magic-counter';
  magicCounterEl.textContent = count + '/6';
  asciiArt.appendChild(magicCounterEl);
}

if (asciiArt) {
  asciiArt.addEventListener('click', () => {
    heartTapCount++;
    clearTimeout(heartTapTimer);
    updateMagicCounter(heartTapCount);

    if (navigator.vibrate) navigator.vibrate(30);

    document.querySelectorAll('.about-avatar, .ascii-art pre').forEach(el => {
      el.style.transition = 'transform 0.15s ease';
      el.style.transform = 'scale(1.1)';
      setTimeout(() => { el.style.transform = 'scale(1)'; }, 150);
    });

    if (heartTapCount < 6) {
      heartTapTimer = setTimeout(() => { heartTapCount = 0; removeMagicCounter(); }, 1200);
      return;
    }

    removeMagicCounter();
    heartTapCount = 0;
    showMagicPopup();
  });
}

/* ───────── PROFILE README POPUP ───────── */
{
  const avatar = document.querySelector('.about-avatar');
  const avatarGlow = document.querySelector('.avatar-glow');
  if (avatar) {
    const overlay = document.getElementById('window-overlay');
    const win = document.getElementById('project-window');
    const winBody = document.getElementById('window-body');
    const winTitle = document.getElementById('window-title');
    const winGhLink = document.getElementById('window-github-link');
    let holdTimer = null;
    let holdStarted = false;

    function closePopup() {
      if (!overlay.classList.contains('open')) return;
      win.classList.remove('visible');
      win.classList.add('closing');
      overlay.classList.add('closing');
      setTimeout(() => {
        overlay.classList.remove('open', 'closing');
        win.classList.remove('visible', 'closing', 'minimized', 'maximized');
      }, 300);
    }

    document.getElementById('win-close').addEventListener('click', closePopup);
    document.getElementById('win-minimize').addEventListener('click', () => {
      win.classList.remove('visible');
      win.classList.add('minimized');
      setTimeout(closePopup, 280);
    });
    document.getElementById('win-maximize').addEventListener('click', () => {
      const maximized = win.classList.toggle('maximized');
      win.querySelector('.win-btn.maximize i').className = maximized ? 'fas fa-compress' : 'fas fa-expand';
    });
    overlay.addEventListener('click', e => { if (e.target === overlay) closePopup(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });

    function openProfileReadme() {
      winTitle.textContent = 'nayaksomkar · README';
      winBody.innerHTML = '<div class="win-loader"><div class="spinner"></div><p>Loading README...</p></div>';
      winGhLink.href = 'https://github.com/nayaksomkar/nayaksomkar';
      win.classList.remove('visible', 'closing', 'minimized', 'maximized');
      overlay.classList.add('open');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => win.classList.add('visible'));
      });

      (async () => {
        try {
          const res = await fetch('https://api.github.com/repos/nayaksomkar/nayaksomkar/readme');
          if (!res.ok) {
            winBody.innerHTML = res.status === 404
              ? '<div class="error-msg"><i class="fas fa-file-alt"></i><p>No profile README found.</p></div>'
              : `<div class="error-msg"><i class="fas fa-exclamation-triangle"></i><p>Failed to load README (HTTP ${res.status})</p></div>`;
            return;
          }
          const data = await res.json();
          const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, '')), c => c.charCodeAt(0));
          const md = new TextDecoder().decode(bytes);

          if (typeof marked === 'undefined') {
            winBody.innerHTML = '<div class="error-msg"><i class="fas fa-exclamation-triangle"></i><p>Markdown library unavailable.</p></div>';
            return;
          }

          marked.setOptions({ gfm: true, breaks: true, smartLists: true });
          const renderer = new marked.Renderer();
          renderer.image = ({ href, title, text }) => {
            const url = href.startsWith('http') || href.startsWith('data:') ? href
              : href.startsWith('./') ? `https://raw.githubusercontent.com/nayaksomkar/nayaksomkar/main/${href.slice(2)}`
              : `https://raw.githubusercontent.com/nayaksomkar/nayaksomkar/main/${href}`;
            return `<img src="${url}" alt="${text || ''}" loading="lazy" onerror="this.style.display='none'"${title ? ` title="${title}"` : ''}>`;
          };
          renderer.link = ({ href, title, text }) => `<a href="${href}" target="_blank"${title ? ` title="${title}"` : ''}>${text}</a>`;
          renderer.code = ({ text, lang }) => {
            const langClass = lang ? ` class="lang-${lang}"` : '';
            return `<pre><code${langClass}>${text}</code></pre>`;
          };
          marked.use({ renderer });
          winBody.innerHTML = marked.parse(md);
        } catch (err) {
          winBody.innerHTML = `<div class="error-msg"><i class="fas fa-exclamation-triangle"></i><p>Failed to load README. ${err.message}</p></div>`;
        }
      })();
    }

    function cancelHold() {
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
      holdStarted = false;
      avatar.classList.remove('avatar-pulsing');
      if (avatarGlow) avatarGlow.classList.remove('avatar-pulsing');
      if (navigator.vibrate) navigator.vibrate(0);
    }

    function startHold() {
      if (holdStarted) return;
      holdStarted = true;
      avatar.classList.add('avatar-pulsing');
      if (avatarGlow) avatarGlow.classList.add('avatar-pulsing');
      if (navigator.vibrate) navigator.vibrate(6000);
      holdTimer = setTimeout(() => {
        cancelHold();
        openProfileReadme();
      }, 6000);
    }

    const isTouch = 'ontouchstart' in window;
    if (isTouch) {
      avatar.addEventListener('touchstart', startHold, { passive: true });
      avatar.addEventListener('touchmove', cancelHold, { passive: true });
      avatar.addEventListener('touchend', cancelHold);
      avatar.addEventListener('touchcancel', cancelHold);
    } else {
      avatar.addEventListener('click', openProfileReadme);
    }
  }
}



