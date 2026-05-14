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
    repos = repos.filter(r => !r.fork).sort((a, b) => b.stargazers_count - a.stargazers_count);
    const ignored = (config.ignoreProjects || []).map(n => {
      let name = n.toLowerCase().trim();
      if (name.includes('github.com/')) name = name.split('/').pop();
      return name;
    });
    repos = repos.filter(r => !ignored.includes(r.name.toLowerCase().trim()));
    if (repos.length === 0) {
      grid.innerHTML = `<div class="error-msg"><i class="fas fa-folder-open"></i><p>No public repositories found.</p></div>`;
      return;
    }
    renderRepos(repos);
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

function renderRepos(repos) {
  grid.innerHTML = repos.map(repo => `
    <div class="project-card" data-repo="${repo.name}">
      <h3><i class="fas fa-book"></i> ${repo.name}</h3>
      <p>${repo.description || 'No description provided.'}</p>
      <div class="project-meta">
        ${repo.language ? `<span><span class="lang-dot" style="background:${getLangColor(repo.language)}"></span> ${repo.language}</span>` : ''}
        <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
        <span><i class="fas fa-code-fork"></i> ${repo.forks_count}</span>
        <span><i class="fas fa-clock"></i> ${timeSince(repo.updated_at)}</span>
      </div>
    </div>
  `).join('');

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
  const card = document.querySelector(`[data-repo="${repoName}"]`);
  if (card) {
    const rect = card.getBoundingClientRect();
    overlay.style.setProperty('--ox', (rect.left + rect.width / 2) + 'px');
    overlay.style.setProperty('--oy', (rect.top + rect.height / 2) + 'px');
  } else {
    overlay.style.setProperty('--ox', '50%');
    overlay.style.setProperty('--oy', '50%');
  }
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
    const md = atob(data.content.replace(/\n/g, ''));
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
    overlay.style.removeProperty('--ox');
    overlay.style.removeProperty('--oy');
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

/* ───────── MARKDOWN RENDERER ───────── */
function renderMarkdown(md) {
  let html = md.replace(/<!--[\s\S]*?-->/g, '');

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `INJECTED_PRE_START__${escapeHtml(code.trim())}__INJECTED_PRE_END`;
  });

  html = html.replace(/<br\s*\/?>/gi, '');
  html = html.replace(/<\/?p>/gi, '');

  const inlines = (text) => {
    let t = text;
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
      const resolved = resolveUrl(src);
      return `<img src="${resolved}" alt="${alt}" loading="lazy" onerror="this.style.display='none'">`;
    });
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
      return `<a href="${resolveUrl(href)}" target="_blank">${text}</a>`;
    });
    return t;
  };

  const lines = html.split('\n');
  const out = [];
  let inTable = false, tableBuf = [];
  let listType = null;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (line.startsWith('|') && line.endsWith('|') && line.replace(/[|\-:\s]/g, '').length === 0) continue;
    if (line.startsWith('|') && line.match(/^\|.*\|$/)) {
      tableBuf.push(line);
      inTable = true;
      continue;
    }
    if (inTable) {
      flushTable();
      inTable = false;
    }

    if (line.startsWith('INJECTED_PRE_START__')) {
      closeList();
      out.push('<pre><code>' + line.replace(/^INJECTED_PRE_START__/, '').replace(/__INJECTED_PRE_END$/, '') + '</code></pre>');
      continue;
    }

    if (!line.trim()) { closeList(); out.push(''); continue; }

    if (line.match(/^#{1,6}\s/)) {
      closeList();
      const level = line.match(/^(#+)/)[1].length;
      const content = inlines(line.replace(/^#+\s+/, ''));
      out.push(`<h${level}>${content}</h${level}>`);
      continue;
    }

    if (line.match(/^>\s/)) {
      closeList();
      out.push('<blockquote>' + inlines(line.replace(/^>\s*/, '')) + '</blockquote>');
      continue;
    }

    if (line.match(/^-{3,}\s*$/)) {
      closeList();
      out.push('<hr>');
      continue;
    }

    if (line.match(/^- \[x\] /i)) {
      if (listType !== 'task') { closeList(); openList('task'); }
      listType = 'task';
      out.push('<li class="task done"><input type="checkbox" checked disabled>' + inlines(line.replace(/^- \[x\]\s*/i, '')) + '</li>');
      continue;
    }
    if (line.match(/^- \[ \] /)) {
      if (listType !== 'task') { closeList(); openList('task'); }
      listType = 'task';
      out.push('<li class="task"><input type="checkbox" disabled>' + inlines(line.replace(/^- \[ \]\s*/, '')) + '</li>');
      continue;
    }

    if (line.match(/^[\-*]\s+/)) {
      if (listType !== 'ul') { closeList(); openList('ul'); }
      listType = 'ul';
      out.push('<li>' + inlines(line.replace(/^[\-*]\s+/, '')) + '</li>');
      continue;
    }

    if (line.match(/^\d+\.\s+/)) {
      if (listType !== 'ol') { closeList(); openList('ol'); }
      listType = 'ol';
      out.push('<li>' + inlines(line.replace(/^\d+\.\s+/, '')) + '</li>');
      continue;
    }

    if (line.match(/^\|.*\|$/)) {
      closeList();
      tableBuf.push(line);
      inTable = true;
      continue;
    }

    closeList();
    out.push('<p>' + inlines(line) + '</p>');
  }

  closeList();
  if (inTable) flushTable();

  function closeList() {
    if (listType === 'ul') out.push('</ul>');
    else if (listType === 'ol') out.push('</ol>');
    else if (listType === 'task') out.push('</ul>');
    listType = null;
  }

  function openList(type) {
    if (type === 'ul') out.push('<ul>');
    else if (type === 'ol') out.push('<ol>');
    else if (type === 'task') out.push('<ul class="task-list">');
  }

  function flushTable() {
    if (tableBuf.length < 2) { tableBuf.forEach(l => out.push('<p>' + inlines(l) + '</p>')); tableBuf = []; return; }
    const rows = tableBuf.filter(r => r.trim());
    const sepRow = rows.findIndex(r => r.match(/^[\| :\-]+\|?$/));
    const dataStart = sepRow >= 0 ? sepRow + 1 : 1;
    const headerRow = rows[0];
    const headers = headerRow.split('|').filter(c => c.trim()).map(c => '<th>' + inlines(c.trim()) + '</th>').join('');
    let tbl = '<table><thead><tr>' + headers + '</tr></thead><tbody>';
    for (let j = dataStart; j < rows.length; j++) {
      const cells = rows[j].split('|').filter(c => c.trim()).map(c => '<td>' + inlines(c.trim()) + '</td>').join('');
      tbl += '<tr>' + cells + '</tr>';
    }
    tbl += '</tbody></table>';
    out.push(tbl);
    tableBuf = [];
  }

  html = out.join('\n');

  html = html.replace(/<\/ul>\s*<ul>/g, '');
  html = html.replace(/<\/ol>\s*<ol>/g, '');
  html = html.replace(/<\/ul>\s*<ul class="task-list">/g, '');
  html = html.replace(/<ul class="task-list">\s*<\/ul>/g, '');
  html = html.replace(/<ul>\s*<\/ul>/g, '');
  html = html.replace(/<ol>\s*<\/ol>/g, '');

  return html;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
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
