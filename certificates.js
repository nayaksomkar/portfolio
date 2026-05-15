/* ───────── CERTIFICATES ───────── */
const certData = [
  {
    icon: 'fas fa-server',
    title: 'System Design (Udemy)',
    desc: 'End-to-end ML deployment on Azure with DevOps automation',
    badge: 'Udemy',
    image: ''
  },
  {
    icon: 'fas fa-robot',
    title: 'n8n & AI Automation (Udemy)',
    desc: 'Deploy any ML model from Jupyter Notebook as production-ready microservices',
    badge: 'Udemy',
    image: ''
  }
];

(async function initCerts() {
  await loadConfig();
  const ignored = (config.ignoreCertificates || []).map(s => s.toLowerCase().trim());
  const filtered = certData.filter(c => !ignored.includes(c.title.toLowerCase().trim()));
  localStorage.setItem('certsCount', filtered.length);
  const descEl = document.getElementById('certs-desc');
  if (descEl) descEl.textContent = `${filtered.length} Certifications`;
  renderCerts(filtered);
})();

function renderCerts(filtered) {
  const grid = document.getElementById('cert-grid');
  grid.innerHTML = filtered.map(c => {
    const imgHtml = c.image ? `<img src="${c.image}" alt="${c.title}" class="cert-img" loading="lazy">` : '';
    return `
    <div class="cert-card${c.image ? ' has-img' : ''}">
      ${imgHtml || `<div class="cert-icon"><i class="${c.icon}"></i></div>`}
      <div class="cert-info">
        <h3>${c.title}</h3>
        <p>${c.desc}</p>
        <span class="cert-badge">${c.badge}</span>
      </div>
    </div>`;
  }).join('');
}
