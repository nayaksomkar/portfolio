const CACHE_DURATION = 30 * 60 * 1000;

const connectData = [
  { icon: 'fab fa-github', label: 'GitHub', desc: '— public repos', url: 'https://github.com/nayaksomkar', countFor: 'gh-repos-filtered' },
  { icon: 'fab fa-bluesky', label: 'Bluesky', desc: '— followers · — posts', url: 'https://bsky.app/profile/nayaksomkar.bsky.social', countFor: 'bsky-both-v2', popup: true },
  { img: 'https://cdn.simpleicons.org/huggingface', label: 'Hugging Face', desc: '— models · — datasets', url: 'https://huggingface.co/nayaksomkar', countFor: 'hf-both', popup: true },
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
    if (el.getAttribute('data-count') === 'bsky-both-v2') {
      el.onclick = openBSkyPopup;
    } else {
      el.onclick = openHFPopup;
    }
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
var bskyPosts = [];
var bskyCurrent = 0;

function openBSkyPopup() {
  if (document.querySelector('.bsky-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'window-overlay bsky-overlay';
  overlay.innerHTML =
    '<div class="bsky-stack-wrap" id="bsky-stack-wrap">' +
      '<div class="bsky-body" id="bsky-body">' +
        '<div style="text-align:center;color:var(--text-secondary);padding:2rem;"><i class="fas fa-spinner fa-spin"></i> Loading posts...</div>' +
      '</div>' +
      '<div class="bsky-hint-bar"><i class="fas fa-arrow-left"></i> swipe or arrows <i class="fas fa-arrow-right"></i></div>' +
    '</div>' +
    '<a href="https://bsky.app/profile/nayaksomkar.bsky.social" target="_blank" class="bsky-open-link"><i class="fab fa-bluesky"></i> Open Bluesky</a>' +
    '<div class="bsky-footer-note">Showing last 3 posts · <a href="https://bsky.app/profile/nayaksomkar.bsky.social" target="_blank">Visit profile</a> for more</div>';
  document.body.appendChild(overlay);

  bskyPosts = [];
  bskyCurrent = 0;

  const wrap = overlay.querySelector('.bsky-stack-wrap');
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      overlay.classList.add('open');
      wrap.classList.add('visible');
    });
  });

  overlay.onclick = function(e) {
    if (e.target === overlay) closeBSky();
  };

  var body = document.getElementById('bsky-body');

  fetch('https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=nayaksomkar.bsky.social&limit=3')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var posts = data.feed;
      if (!posts || !posts.length) {
        body.innerHTML = '<div class="bsky-post" style="padding:1rem;color:var(--text-secondary);">No posts</div>';
        return;
      }
      for (var i = 0; i < posts.length; i++) {
        try {
          var p = posts[i].post;
          if (!p || !p.record) continue;
          bskyPosts.push(p);
        } catch(e) {}
      }
      if (bskyPosts.length) {
        renderBSkyPost(0);

        var bodyEl = document.getElementById('bsky-body');
        var touchX = 0;
        if (bodyEl) {
          bodyEl.addEventListener('touchstart', function(e) { touchX = e.touches[0].clientX; }, { passive: true });
          bodyEl.addEventListener('touchend', function(e) {
            var dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 40) {
              if (dx > 0) bskyPrev();
              else bskyNext();
            }
          }, { passive: true });
        }
        document.addEventListener('keydown', bskyKeyNav);
      } else {
        body.innerHTML = '<div class="bsky-post" style="padding:1rem;color:var(--text-secondary);">No posts</div>';
      }
    })
    .catch(function() {});
}

function renderBSkyPost(idx) {
  if (idx < 0 || idx >= bskyPosts.length) return;
  bskyCurrent = idx;
  var body = document.getElementById('bsky-body');
  if (!body) return;

  // Build all cards if not yet rendered
  if (!body.querySelector('.bsky-stack')) {
    var html = '<div class="bsky-stack">';
    for (var i = 0; i < bskyPosts.length; i++) {
      var p = bskyPosts[i];
      var handle = '@' + (p.author && p.author.handle ? p.author.handle : 'nayaksomkar.bsky.social');
      var displayName = p.author && p.author.displayName ? p.author.displayName : handle;
      var avatarHtml = p.author && p.author.avatar
        ? '<img src="' + p.author.avatar.replace(/"/g,'&quot;') + '" class="bsky-avatar">'
        : '<div class="bsky-avatar-placeholder"><i class="fas fa-user"></i></div>';
      var postDate = p.record.createdAt ? new Date(p.record.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      html += '<div class="bsky-stack-card" data-idx="' + i + '">' +
        '<div class="bsky-card-dots"><span class="bsky-card-dot red"></span><span class="bsky-card-dot yellow"></span><span class="bsky-card-dot green"></span></div>' +
        '<div class="bsky-post">' +
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
        '</div>' +
      '</div>';
    }
    html += '</div>';
    body.innerHTML = html;
  }

  positionStackCards(idx);
}

function positionStackCards(idx) {
  var cards = document.querySelectorAll('.bsky-stack-card');
  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    card.classList.remove('active', 'prev', 'prev-2', 'next', 'next-2');
    if (i === idx) {
      card.classList.add('active');
    } else if (i < idx) {
      var dist = idx - i;
      card.classList.add(dist === 1 ? 'prev' : 'prev-2');
    } else {
      var dist = i - idx;
      card.classList.add(dist === 1 ? 'next' : 'next-2');
    }
  }
}

function bskyPrev() {
  var total = bskyPosts.length;
  if (total === 0) return;
  renderBSkyPost((bskyCurrent - 1 + total) % total);
}

function bskyNext() {
  var total = bskyPosts.length;
  if (total === 0) return;
  renderBSkyPost((bskyCurrent + 1) % total);
}

function bskyKeyNav(e) {
  if (!document.querySelector('.bsky-overlay')) {
    document.removeEventListener('keydown', bskyKeyNav);
    return;
  }
  if (e.key === 'Escape') { closeBSky(); return; }
  if (e.key === 'ArrowLeft') bskyPrev();
  if (e.key === 'ArrowRight') bskyNext();
}

function closeBSky() {
  const overlay = document.querySelector('.bsky-overlay');
  if (!overlay) return;
  document.removeEventListener('keydown', bskyKeyNav);
  setTimeout(() => overlay.remove(), 300);
}

/* ───────── HUGGING FACE POPUP ───────── */
function openHFPopup() {
  if (document.querySelector('.hf-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'window-overlay hf-overlay';
  overlay.innerHTML =
    '<div class="window hf-window">' +
      '<div class="window-titlebar">' +
        '<span class="window-title"><img src="https://cdn.simpleicons.org/huggingface" width="16" height="16" style="vertical-align:middle;margin-right:6px"> nayaksomkar · Hugging Face</span>' +
        '<div class="window-controls">' +
          '<button class="win-btn minimize hf-min"><i class="fas fa-minus"></i></button>' +
          '<button class="win-btn maximize hf-max"><i class="fas fa-expand"></i></button>' +
          '<button class="win-btn close hf-close"><i class="fas fa-times"></i></button>' +
        '</div>' +
      '</div>' +
      '<div class="window-body hf-body" id="hf-body">' +
        '<div style="text-align:center;color:var(--text-secondary);padding:2rem;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>' +
      '</div>' +
      '<div class="window-footer">' +
        '<a href="https://huggingface.co/nayaksomkar" target="_blank" class="btn-gh"><img src="https://cdn.simpleicons.org/huggingface" width="14" height="14" style="vertical-align:middle;margin-right:4px"> Open Hugging Face</a>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  const win = overlay.querySelector('.hf-window');
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      overlay.classList.add('open');
      win.classList.add('visible');
    });
  });

  overlay.querySelector('.hf-close').onclick = closeHF;
  overlay.querySelector('.hf-min').onclick = function() {
    win.classList.remove('visible');
    win.classList.add('minimized');
    setTimeout(closeHF, 280);
  };
  overlay.querySelector('.hf-max').onclick = function() {
    win.classList.toggle('maximized');
    overlay.querySelector('.hf-max i').className = win.classList.contains('maximized') ? 'fas fa-compress' : 'fas fa-expand';
  };
  overlay.onclick = function(e) {
    if (e.target === overlay) closeHF();
  };
  document.addEventListener('keydown', closeHFOnEsc);

  Promise.all([
    fetch('https://huggingface.co/api/models?author=nayaksomkar&limit=100').then(function(r) { return r.json(); }),
    fetch('https://huggingface.co/api/datasets?author=nayaksomkar&limit=100').then(function(r) { return r.json(); }),
  ])
    .then(function(results) {
      var models = results[0] || [];
      var datasets = results[1] || [];
      var body = document.getElementById('hf-body');
      if (!body) return;

      if (!models.length && !datasets.length) {
        body.innerHTML = '<div style="padding:1rem;color:var(--text-secondary);text-align:center;">No models or datasets found.</div>';
        return;
      }

      var html = '';
      var shownModels = models.slice(-2);
      var shownDatasets = datasets.slice(-2);

      if (shownModels.length) {
        html += '<div class="hf-section"><h3 class="hf-section-title"><img src="https://cdn.simpleicons.org/huggingface" width="14" height="14" style="vertical-align:middle;margin-right:4px"> Models</h3>';
        for (var i = 0; i < shownModels.length; i++) {
          var m = shownModels[i];
          html += '<div class="hf-item">' +
            '<a href="https://huggingface.co/' + m.id + '" target="_blank" class="hf-item-name">' + escapeHtml(m.id) + '</a>' +
            '<span class="hf-item-stat"><i class="fas fa-download"></i> ' + formatNum(m.downloads) + '</span>' +
            '</div>';
        }
        html += '</div>';
      }

      if (shownDatasets.length) {
        html += '<div class="hf-section"><h3 class="hf-section-title"><img src="https://cdn.simpleicons.org/huggingface" width="14" height="14" style="vertical-align:middle;margin-right:4px"> Datasets</h3>';
        for (var j = 0; j < shownDatasets.length; j++) {
          var d = shownDatasets[j];
          html += '<div class="hf-item">' +
            '<a href="https://huggingface.co/datasets/' + d.id + '" target="_blank" class="hf-item-name">' + escapeHtml(d.id) + '</a>' +
            '<span class="hf-item-stat"><i class="fas fa-download"></i> ' + formatNum(d.downloads) + '</span>' +
            '</div>';
        }
        html += '</div>';
      }

      body.innerHTML = html;

      var noteEl = document.querySelector('.hf-window .bsky-footer-note');
      if (!noteEl) {
        var note = document.createElement('div');
        note.className = 'bsky-footer-note';
        note.textContent = 'Showing last 2 models · last 2 datasets';
        document.querySelector('.hf-window .window-body').after(note);
      }
    })
    .catch(function() {});
}

function closeHF() {
  var overlay = document.querySelector('.hf-overlay');
  if (!overlay) return;
  var win = overlay.querySelector('.hf-window');
  win.classList.remove('visible');
  win.classList.add('closing');
  overlay.classList.remove('open');
  overlay.classList.add('closing');
  document.removeEventListener('keydown', closeHFOnEsc);
  setTimeout(function() { overlay.remove(); }, 300);
}

function closeHFOnEsc(e) {
  if (e.key === 'Escape') closeHF();
}
