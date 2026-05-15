/* ───────── THEME TOGGLE ───────── */
const toggle = document.getElementById('theme-toggle');

if (localStorage.getItem('theme') === 'light') {
  toggle.checked = true;
  document.body.classList.add('light-mode');
  document.body.classList.remove('night-mode');
}

toggle.addEventListener('change', () => {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9998;background:var(--bg-body);transition:opacity 0.3s;opacity:1;pointer-events:none';
  document.body.appendChild(overlay);
  requestAnimationFrame(() => { overlay.style.opacity = '0'; });
  setTimeout(() => overlay.remove(), 350);

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
  const count = isMobile ? 10 : 28;

  for (let i = 0; i < count; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const delay = (Math.random() * 1.2).toFixed(2);

    const el = document.createElement('div');
    el.className = 'hearts-particle';
    el.textContent = emojis[i % emojis.length];
    el.style.left = x + '%';
    el.style.top = y + '%';
    el.style.fontSize = (isMobile ? 1.4 : 2) + (Math.random() * (isMobile ? 1 : 1.5)) + 'rem';
    el.style.setProperty('--delay', delay + 's');
    overlay.appendChild(el);

    if (!isMobile) {
      for (let c = 0; c < 3; c++) {
        const child = document.createElement('div');
        child.className = 'hearts-particle child';
        child.textContent = emojis[(i + c + 1) % emojis.length];
        child.style.left = (x + (Math.random() - 0.5) * 12) + '%';
        child.style.top = (y + (Math.random() - 0.5) * 12) + '%';
        child.style.fontSize = (0.6 + Math.random() * 0.8) + 'rem';
        child.style.setProperty('--delay', (parseFloat(delay) + 0.25 + Math.random() * 0.3).toFixed(2) + 's');
        overlay.appendChild(child);
      }
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
      card.classList.add('shake');
      card.style.borderColor = '#ef4444';
      if (navigator.vibrate) navigator.vibrate([40, 30, 40, 30, 60]);
      setTimeout(() => {
        card.classList.remove('shake');
        card.style.borderColor = '';
        popup.remove();
      }, 600);
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



