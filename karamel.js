const karamelData = [
  { icon: 'fab fa-instagram', label: 'Instagram', desc: '@KaramelKumar', url: 'https://instagram.com/KaramelKumar', handle: true },
  { icon: 'fab fa-threads', label: 'Threads', desc: '@KaramelKumar', url: 'https://threads.net/@KaramelKumar', handle: true },
  { icon: 'fab fa-youtube', label: 'YouTube', desc: '@KaramelKumar', url: 'https://youtube.com/@KaramelKumar', handle: true },
];

function renderKaramel() {
  const grid = document.getElementById('karamel-grid');
  if (!grid) return;
  grid.innerHTML = karamelData.map(item => {
    const iconHtml = `<i class="${item.icon} connect-icon"></i>`;
    return `<a href="${item.url}" target="_blank" class="connect-card connect-card--handle">
      ${iconHtml}
      <span class="connect-label">${item.label}</span>
      <span class="connect-desc connect-desc--handle">${item.desc}</span>
    </a>`;
  }).join('');
}

renderKaramel();
