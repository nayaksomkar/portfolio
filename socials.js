const CACHE_DURATION = 30 * 60 * 1000;

const connectData = [
  { icon: 'fab fa-github', label: 'GitHub', desc: '— public repos', url: 'https://github.com/nayaksomkar', countFor: 'gh-repos' },
  { icon: 'fab fa-linkedin-in', label: 'LinkedIn', desc: 'Professional profile', url: 'https://linkedin.com/in/nayaksomkar' },
  { icon: 'fab fa-bluesky', label: 'Bluesky', desc: '— followers · — posts', url: 'https://bsky.app/profile/nayaksomkar.bsky.social', countFor: 'bsky-both' },
  { icon: 'fab fa-x-twitter', label: 'X / Twitter', desc: '@nayaksomkar', url: 'https://x.com/nayaksomkar' },
  { icon: 'fab fa-instagram', label: 'Instagram', desc: '@nayaksomkar', url: 'https://instagram.com/nayaksomkar' },
  { icon: 'fab fa-youtube', label: 'YouTube', desc: '@nayaksomkar', url: 'https://youtube.com/@nayaksomkar' },
  { img: 'https://cdn.simpleicons.org/huggingface', label: 'Hugging Face', desc: '— models · — datasets', url: 'https://huggingface.co/nayaksomkar', countFor: 'hf-both' },
  { icon: 'fas fa-envelope', label: 'Email', desc: 'nayaksomkar@outlook.in', url: 'mailto:nayaksomkar@outlook.in' },
];

function renderConnect() {
  const grid = document.getElementById('socials-grid');
  if (!grid) return;
  grid.innerHTML = connectData.map(item => {
    const iconHtml = item.icon
      ? `<i class="${item.icon} connect-icon"></i>`
      : `<img src="${item.img}" width="28" height="28" alt="" class="connect-img" />`;
    return `<a href="${item.url}" target="_blank" class="connect-card" data-count="${item.countFor || ''}">
      ${iconHtml}
      <span class="connect-label">${item.label}</span>
      <span class="connect-desc">${item.desc}</span>
    </a>`;
  }).join('');
}

async function fetchCount(url, extractor, cacheKey) {
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { value, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) return value;
  }
  try {
    const res = await fetch(url);
    const data = await res.json();
    const value = extractor(data);
    localStorage.setItem(cacheKey, JSON.stringify({ value, timestamp: Date.now() }));
    return value;
  } catch {
    return null;
  }
}

async function loadCounts() {
  const [repos, models, datasets, bskyData] = await Promise.all([
    fetchCount('https://api.github.com/users/nayaksomkar', d => d.public_repos, 'gh-repos'),
    fetchCount('https://huggingface.co/api/models?author=nayaksomkar&limit=100', d => d.length, 'hf-models'),
    fetchCount('https://huggingface.co/api/datasets?author=nayaksomkar&limit=100', d => d.length, 'hf-datasets'),
    fetchCount('https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=nayaksomkar.bsky.social', d => ({ followers: d.followersCount, posts: d.postsCount }), 'bsky-both'),
  ]);

  document.querySelectorAll('.connect-card').forEach(card => {
    const type = card.dataset.count;
    const desc = card.querySelector('.connect-desc');
    if (!desc) return;
    if (type === 'gh-repos' && repos !== null) desc.textContent = `${repos} public repos`;
    if (type === 'bsky-both' && bskyData) desc.textContent = `${bskyData.followers} followers · ${bskyData.posts} posts`;
    if (type === 'hf-both' && models !== null && datasets !== null) desc.textContent = `${models} models · ${datasets} datasets`;
  });
}

renderConnect();
loadCounts();
