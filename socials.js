const CACHE_DURATION = 30 * 60 * 1000;

const connectData = [
  { icon: 'fab fa-github', label: 'GitHub', desc: '— public repos', url: 'https://github.com/nayaksomkar', countFor: 'gh-repos-filtered' },
  { icon: 'fab fa-bluesky', label: 'Bluesky', desc: '— followers · — posts', url: 'https://bsky.app/profile/nayaksomkar.bsky.social', countFor: 'bsky-both-v2' },
  { icon: 'fab fa-x-twitter', label: 'X / Twitter', desc: '@nayaksomkar', url: 'https://x.com/nayaksomkar', handle: true },
  { icon: 'fab fa-instagram', label: 'Instagram', desc: '@nayaksomkar', url: 'https://instagram.com/nayaksomkar', handle: true },
  { icon: 'fab fa-threads', label: 'Threads', desc: '@nayaksomkar', url: 'https://threads.net/@nayaksomkar', handle: true },
  { icon: 'fab fa-youtube', label: 'YouTube', desc: '@nayaksomkar', url: 'https://youtube.com/@nayaksomkar', handle: true },
  { img: 'https://cdn.simpleicons.org/huggingface', label: 'Hugging Face', desc: '— models · — datasets', url: 'https://huggingface.co/nayaksomkar', countFor: 'hf-both' },
  { icon: 'fas fa-envelope', label: 'Email', desc: 'nayaksomkar@outlook.in', url: 'mailto:nayaksomkar@outlook.in' },
  { img: 'https://cdn.simpleicons.org/onlyfans', label: 'OnlyFans', desc: '@nayaksomkar', url: 'https://onlyfans.com/nayaksomkar', handle: true, prank: true },
];

function renderConnect() {
  const grid = document.getElementById('socials-grid');
  if (!grid) return;
  grid.innerHTML = connectData.map(item => {
    const iconHtml = item.icon
      ? `<i class="${item.icon} connect-icon"></i>`
      : `<img src="${item.img}" width="28" height="28" alt="" class="connect-img" />`;
    if (item.prank) {
      return `<a href="${item.url}" class="connect-card of-prank" data-count="${item.countFor || ''}">
        ${iconHtml}
        <span class="connect-label">${item.label}</span>
        <span class="connect-desc connect-desc--handle">${item.desc}</span>
      </a>`;
    }
    return `<a href="${item.url}" target="_blank" class="connect-card${item.handle ? ' connect-card--handle' : ''}" data-count="${item.countFor || ''}">
      ${iconHtml}
      <span class="connect-label">${item.label}</span>
      <span class="connect-desc${item.handle ? ' connect-desc--handle' : ''}">${item.desc}</span>
    </a>`;
  }).join('');
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

renderConnect();
loadCounts();
