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
let config = { ignoreProjects: [], ignoreCertificates: [] };

async function loadConfig() {
  try {
    const res = await fetch('portfolio-config.json');
    if (res.ok) config = await res.json();
  } catch {}
}

/* ───────── BACKGROUND TEXT WAVE ───────── */
const BG_TEXT = '\u0928\u093E\u092F\u0915 Omkar';
const bgContainer = document.getElementById('bg-text');

let textEls = [];
let waveTime = 0;
let numCols, numRows;

function buildBgText() {
  bgContainer.innerHTML = '';
  textEls = [];
  numCols = 3;
  numRows = Math.ceil(window.innerHeight / 120) + 4;
  if (window.innerWidth < 768) numCols = 2;
  if (window.innerWidth < 480) numCols = 1;
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const span = document.createElement('span');
      span.className = 'bg-text-item';
      span.textContent = BG_TEXT;
      span.dataset.row = r;
      span.dataset.col = c;
      bgContainer.appendChild(span);
      textEls.push(span);
    }
  }
}
buildBgText();

let rebuildTimer;
window.addEventListener('resize', () => {
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(buildBgText, 400);
});

function animateWave(time) {
  waveTime = time * 0.0004;
  const waveFreq = 0.003;
  const waveAmp = 350;
  const waveBand = 260;

  for (const el of textEls) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const wx = cx * waveFreq + waveTime;
    const waveY = window.innerHeight / 2 + waveAmp * Math.sin(wx);
    const dist = Math.abs(cy - waveY);

    if (dist < waveBand) {
      el.classList.add('wave-glow');
    } else {
      el.classList.remove('wave-glow');
    }
  }

  requestAnimationFrame(animateWave);
}

requestAnimationFrame(animateWave);
