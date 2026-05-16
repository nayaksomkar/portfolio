/* ───────── GITHUB REPOS ───────── */
const GITHUB_USER = 'nayaksomkar';
const grid = document.getElementById('project-grid');

(async function initProjects() {
  await loadConfig();
  fetchRepos();
})();

async function fetchRepos() {
  grid.innerHTML = `<div class="loader"><div class="spinner"></div><p>Loading projects...</p></div>`;
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100&type=public`);
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    let repos = await res.json();
    repos = repos.filter(r => !r.fork);
    const ignored = (config.ignoreProjects || []).map(n => {
      let name = n.toLowerCase().trim();
      if (name.includes('github.com/')) name = name.split('/').pop();
      return name;
    });
    repos = repos.filter(r => !ignored.includes(r.name.toLowerCase().trim()));
    localStorage.setItem('projectsCount', repos.length);
    const descEl = document.getElementById('projects-desc');
    if (descEl) descEl.textContent = `${repos.length} Projects`;
    if (repos.length === 0) {
      grid.innerHTML = `<div class="error-msg"><i class="fas fa-folder-open"></i><p>No public repositories found.</p></div>`;
      return;
    }
    const { pinned, rest } = sortByPriority(repos, config.priorityProjects || []);
    renderRepos(pinned, rest);
} catch (err) {
     const is403 = err.message && err.message.includes('403');
     grid.innerHTML = `<div class="error-msg"><i class="fas fa-exclamation-triangle"></i><p>${is403 ? 'GitHub API rate limit reached. Please try again later or refresh the page.' : 'Failed to load repos. ' + err.message}</p></div>`;
   }
}

const LANG_COLORS = {
  JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572a5', HTML: '#e34c26',
  CSS: '#563d7c', Java: '#b07219', Go: '#00add8', Rust: '#dea584',
  Shell: '#89e051', Ruby: '#701516', C: '#555555', 'C++': '#f34b7d',
  'C#': '#178600', PHP: '#4f5d95', Swift: '#ffac45', Kotlin: '#a97bff',
  Dart: '#00b4ab', Lua: '#000080', Vue: '#41b883', Svelte: '#ff3e00',
};

function getLangColor(lang) {
  return LANG_COLORS[lang] || '#8b5cf6';
}

function timeSince(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const sec = Math.floor((now - d) / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days}d ago`;
  const mo = Math.floor(days / 30);
  return `${mo}mo ago`;
}

function sortByPriority(repos, priority) {
  const priorityLower = priority.map(n => n.toLowerCase().trim());
  const pinned = [];
  const rest = [];
  for (const r of repos) {
    const idx = priorityLower.indexOf(r.name.toLowerCase().trim());
    if (idx !== -1) {
      pinned[idx] = r;
    } else {
      rest.push(r);
    }
  }
  rest.sort((a, b) => b.stargazers_count - a.stargazers_count);
  return { pinned: pinned.filter(Boolean), rest };
}

function renderRepos(pinned, rest) {
  const renderCard = (repo, isPinned = false) => `
    <div class="project-card${isPinned ? ' pinned' : ''}" data-repo="${repo.name}">
      <h3><i class="fas fa-book"></i> ${repo.name}</h3>
      <p>${repo.description || 'No description provided.'}</p>
      <div class="project-meta">
        ${repo.language ? `<span><span class="lang-dot" style="background:${getLangColor(repo.language)}"></span> ${repo.language}</span>` : ''}
        <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
        <span><i class="fas fa-code-fork"></i> ${repo.forks_count}</span>
        <span><i class="fas fa-clock"></i> ${timeSince(repo.updated_at)}</span>
      </div>
    </div>
  `;
  const pinnedHtml = pinned.map(r => renderCard(r, true)).join('');
  const restHtml = rest.map(r => renderCard(r)).join('');
  grid.innerHTML = pinnedHtml + (pinned.length && rest.length ? '<div class="priority-divider"></div>' : '') + restHtml;

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', (e) => openProjectWindow(card.dataset.repo, e));
  });
}

/* ───────── CUSTOM WINDOW ───────── */
const overlay = document.getElementById('window-overlay');
const win = document.getElementById('project-window');
const winBody = document.getElementById('window-body');
const winTitle = document.getElementById('window-title');
const winGhLink = document.getElementById('window-github-link');
const winClose = document.getElementById('win-close');
const winMin = document.getElementById('win-minimize');
const winMax = document.getElementById('win-maximize');

let currentRepo = '';

async function openProjectWindow(repoName, event) {
  currentRepo = repoName;
  winTitle.textContent = repoName + ' · README';
  winBody.innerHTML = `<div class="win-loader"><div class="spinner"></div><p>Fetching README...</p></div>`;
  winGhLink.href = `https://github.com/${GITHUB_USER}/${repoName}`;
  win.classList.remove('visible', 'closing', 'minimized', 'maximized');
  overlay.classList.add('open');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      win.classList.add('visible');
    });
  });

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${repoName}/readme`);
    if (!res.ok) {
      if (res.status === 404) {
        winBody.innerHTML = `<div class="error-msg"><i class="fas fa-file-alt"></i><p>No README found for this repository.</p></div>`;
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
      return;
    }
    const data = await res.json();
    const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, '')), c => c.charCodeAt(0));
    const md = new TextDecoder().decode(bytes);
    winBody.innerHTML = renderMarkdown(md);
  } catch (err) {
    winBody.innerHTML = `<div class="error-msg"><i class="fas fa-exclamation-triangle"></i><p>Failed to load README. ${err.message}</p></div>`;
  }
}

/* ───────── WINDOW CONTROLS ───────── */
function closeOverlay() {
  if (!overlay.classList.contains('open')) return;
  win.classList.remove('visible');
  win.classList.add('closing');
  overlay.classList.add('closing');
  setTimeout(() => {
    overlay.classList.remove('open', 'closing');
    win.classList.remove('visible', 'closing', 'minimized', 'maximized');
  }, 300);
}

winClose.addEventListener('click', closeOverlay);

winMin.addEventListener('click', () => {
  win.classList.remove('visible');
  win.classList.add('minimized');
  setTimeout(closeOverlay, 280);
});

winMax.addEventListener('click', () => {
  const maximized = win.classList.toggle('maximized');
  winMax.querySelector('i').className = maximized ? 'fas fa-compress' : 'fas fa-expand';
});

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeOverlay();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeOverlay();
});

/* ───────── MARKDOWN RENDERER (marked) ───────── */
function renderMarkdown(md) {
  if (typeof marked === 'undefined') {
    return `<div class="error-msg"><i class="fas fa-exclamation-triangle"></i><p>Markdown library failed to load. Please refresh.</p></div>`;
  }
  marked.setOptions({
    gfm: true,
    breaks: true,
    smartLists: true,
  });
  const renderer = new marked.Renderer();
  renderer.image = ({ href, title, text }) => {
    const url = resolveUrl(href);
    return `<img src="${url}" alt="${text || ''}" loading="lazy" onerror="this.style.display='none'"${title ? ` title="${title}"` : ''}>`;
  };
  renderer.link = ({ href, title, text }) => {
    const url = resolveUrl(href);
    return `<a href="${url}" target="_blank"${title ? ` title="${title}"` : ''}>${text}</a>`;
  };
  renderer.code = ({ text, lang }) => {
    const langClass = lang ? ` class="lang-${lang}"` : '';
    return `<pre><code${langClass}>${text}</code></pre>`;
  };
  marked.use({ renderer });
  return marked.parse(md);
}

function resolveUrl(url) {
  if (!url || url.startsWith('http://') || url.startsWith('https://') ||
      url.startsWith('data:') || url.startsWith('#') || url.startsWith('mailto:')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  url = url.replace(/^\.?\//, '');
  if (currentRepo) {
    return `https://raw.githubusercontent.com/${GITHUB_USER}/${currentRepo}/main/${url}`;
  }
  return url;
}
