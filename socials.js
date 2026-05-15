const CACHE_DURATION = 30 * 60 * 1000;

const connectData = [
  { icon: 'fab fa-github', label: 'GitHub', desc: '— public repos', url: 'https://github.com/nayaksomkar', countFor: 'gh-repos-filtered' },
  { icon: 'fab fa-bluesky', label: 'Bluesky', desc: '— followers · — posts', url: 'https://bsky.app/profile/nayaksomkar.bsky.social', countFor: 'bsky-both-v2', popup: true },
  { img: 'https://cdn.simpleicons.org/huggingface', label: 'Hugging Face', desc: '— models · — datasets', url: 'https://huggingface.co/nayaksomkar', countFor: 'hf-both' },
  { icon: 'fas fa-envelope', label: 'Email', desc: 'nayaksomkar@outlook.in', url: 'mailto:nayaksomkar@outlook.in' },
];

function renderConnect() {
  const grid = document.getElementById('socials-grid');
  if (!grid) return;
  grid.innerHTML = connectData.map(item => {
    const isPopup = item.popup;
    const iconHtml = item.icon
      ? `<i class="${item.icon} connect-icon"></i>`
      : `<img src="${item.img}" width="28" height="28" alt="" class="connect-img" />`;
    if (isPopup) {
      return `<div class="connect-card connect-card--popup" data-count="${item.countFor || ''}">
        ${iconHtml}
        <span class="connect-label">${item.label}</span>
        <span class="connect-desc">${item.desc}</span>
      </div>`;
    }
    return `<a href="${item.url}" target="_blank" class="connect-card" data-count="${item.countFor || ''}">
      ${iconHtml}
      <span class="connect-label">${item.label}</span>
      <span class="connect-desc">${item.desc}</span>
    </a>`;
  }).join('');
  grid.querySelectorAll('.connect-card--popup').forEach(el => {
    el.onclick = openBSkyPopup;
  });
}

async function fetchCount(url, extractor, cacheKey) {
  try {
    var cached = localStorage.getItem(cacheKey);
    if (cached) {
      var parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION && parsed.value !== null && parsed.value !== undefined) return parsed.value;
    }
  } catch(e) {}
  try {
    var res = await fetch(url);
    var data = await res.json();
    var value = extractor(data);
    if (value !== null && value !== undefined) {
      try { localStorage.setItem(cacheKey, JSON.stringify({ value: value, timestamp: Date.now() })); } catch(e) {}
    }
    return value;
  } catch(e) {
    return null;
  }
}

async function loadCounts() {
  try {
    if (typeof loadConfig === 'function') await loadConfig();
  } catch(e) {}
  var ignored = [];
  try {
    ignored = (config.ignoreProjects || []).map(function(n) {
      var name = n.toLowerCase().trim();
      if (name.indexOf('github.com/') !== -1) name = name.split('/').pop();
      return name;
    });
  } catch(e) {}

  var counts = await Promise.all([
    fetchCount('https://api.github.com/users/nayaksomkar/repos?per_page=100&type=public', function(d) { return d.filter(function(r) { return !r.fork && ignored.indexOf(r.name.toLowerCase().trim()) === -1; }).length; }, 'gh-repos-filtered'),
    fetchCount('https://huggingface.co/api/models?author=nayaksomkar&limit=100', function(d) { return d.length; }, 'hf-models'),
    fetchCount('https://huggingface.co/api/datasets?author=nayaksomkar&limit=100', function(d) { return d.length; }, 'hf-datasets'),
    fetchCount('https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=nayaksomkar.bsky.social', function(d) { return { followers: d.followersCount, posts: d.postsCount }; }, 'bsky-both-v2'),
  ]);
  var repos = counts[0], models = counts[1], datasets = counts[2], bskyData = counts[3];

  var cards = document.querySelectorAll('.connect-card');
  for (var i = 0; i < cards.length; i++) {
    var type = cards[i].getAttribute('data-count');
    var desc = cards[i].querySelector('.connect-desc');
    if (!desc || !type) continue;
    if (type === 'gh-repos-filtered' && repos !== null && repos !== undefined) desc.textContent = repos + ' public repos';
    if (type === 'bsky-both-v2' && bskyData) desc.textContent = bskyData.followers + ' followers · ' + bskyData.posts + ' posts';
    if (type === 'hf-both' && models !== null && datasets !== null) desc.textContent = models + ' models · ' + datasets + ' datasets';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatBSkyText(text) {
  var result = escapeHtml(text);
  result = result.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" class="bsky-link" target="_blank">$1</a>');
  result = result.replace(/([\w.-]+\.[\w]{2,}(?:\/[^\s<]*)?)/g, '<a href="https://$1" class="bsky-link" target="_blank">$1</a>');
  result = result.replace(/#(\w+)/g, '<a href="https://bsky.app/hashtag/$1" class="bsky-tag" target="_blank">#$1</a>');
  result = result.replace(/\n/g, '<br>');
  return result;
}

function formatNum(n) {
  if (!n) return '0';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString();
}

renderConnect();
loadCounts();

/* ───────── BLUESKY POPUP ───────── */
function openBSkyPopup() {
  if (document.querySelector('.bsky-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'window-overlay bsky-overlay';
  overlay.innerHTML =
    '<div class="window bsky-window">' +
      '<div class="window-titlebar">' +
        '<span class="window-title"><i class="fab fa-bluesky"></i> nayaksomkar · Latest Posts</span>' +
        '<div class="window-controls">' +
          '<button class="win-btn minimize bsky-min"><i class="fas fa-minus"></i></button>' +
          '<button class="win-btn maximize bsky-max"><i class="fas fa-expand"></i></button>' +
          '<button class="win-btn close bsky-close"><i class="fas fa-times"></i></button>' +
        '</div>' +
      '</div>' +
      '<div class="window-body bsky-body" id="bsky-body">' +
        '<div class="bsky-post" style="text-align:center;color:var(--text-secondary);padding:2rem;"><i class="fas fa-spinner fa-spin"></i> Loading posts...</div>' +
      '</div>' +
      '<div class="bsky-footer-note">Showing last 3 posts · <a href="https://bsky.app/profile/nayaksomkar.bsky.social" target="_blank">Visit Bluesky profile</a> for more</div>' +
      '<div class="window-footer">' +
        '<a href="https://bsky.app/profile/nayaksomkar.bsky.social" target="_blank" class="btn-gh"><i class="fab fa-bluesky"></i> Open Bluesky</a>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  const win = overlay.querySelector('.bsky-window');
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      overlay.classList.add('open');
      win.classList.add('visible');
    });
  });

  overlay.querySelector('.bsky-close').onclick = closeBSky;
  overlay.querySelector('.bsky-min').onclick = function() {
    win.classList.remove('visible');
    win.classList.add('minimized');
    setTimeout(closeBSky, 280);
  };
  overlay.querySelector('.bsky-max').onclick = function() {
    win.classList.toggle('maximized');
    overlay.querySelector('.bsky-max i').className = win.classList.contains('maximized') ? 'fas fa-compress' : 'fas fa-expand';
  };
  overlay.onclick = function(e) {
    if (e.target === overlay) closeBSky();
  };
  document.addEventListener('keydown', closeBSkyOnEsc);

  fetch('https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=nayaksomkar.bsky.social&limit=3')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var body = document.getElementById('bsky-body');
      if (!body) return;
      var posts = data.feed;
      if (!posts || !posts.length) {
        body.innerHTML = '<div class="bsky-post" style="padding:1rem;color:var(--text-secondary);">No posts</div>';
        return;
      }
      var html = '';
      for (var i = 0; i < posts.length; i++) {
        try {
          var p = posts[i].post;
          if (!p || !p.record) continue;
          var handle = '@' + (p.author && p.author.handle ? p.author.handle : 'nayaksomkar.bsky.social');
          var displayName = p.author && p.author.displayName ? p.author.displayName : handle;
          var avatarHtml = p.author && p.author.avatar
            ? '<img src="' + p.author.avatar.replace(/"/g,'&quot;') + '" class="bsky-avatar">'
            : '<div class="bsky-avatar-placeholder"><i class="fas fa-user"></i></div>';
          var postDate = p.record.createdAt ? new Date(p.record.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
          html += '<div class="bsky-post">' +
            '<div class="bsky-post-header">' + avatarHtml +
              '<div>' +
                '<div class="bsky-post-name">' + escapeHtml(displayName) + '</div>' +
                '<div class="bsky-post-handle">' + escapeHtml(handle) + '</div>' +
                '<div class="bsky-post-date">' + postDate + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="bsky-post-text">' + formatBSkyText(p.record.text || '') + '</div>' +
            '<div class="bsky-post-stats">' +
              '<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg> ' + (p.likeCount || 0) + '</span>' +
              '<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> ' + (p.repostCount || 0) + '</span>' +
              '<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> ' + (p.replyCount || 0) + '</span>' +
            '</div>' +
          '</div>';
        } catch(e) {}
      }
      if (html) body.innerHTML = html;
    })
    .catch(function() {});
}

function closeBSky() {
  const overlay = document.querySelector('.bsky-overlay');
  if (!overlay) return;
  const win = overlay.querySelector('.bsky-window');
  win.classList.remove('visible');
  win.classList.add('closing');
  overlay.classList.remove('open');
  overlay.classList.add('closing');
  document.removeEventListener('keydown', closeBSkyOnEsc);
  setTimeout(() => overlay.remove(), 300);
}

function closeBSkyOnEsc(e) {
  if (e.key === 'Escape') closeBSky();
}
