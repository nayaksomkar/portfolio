/* ───────── CLASH OF CLANS ───────── */

const COC_TAG = '#9PU28QLQQ';

const cocTrigger = document.getElementById('coc-trigger');
let cocClickCount = 0;
let cocClickTimer;
var cocCounterEl = null;

function cocStatRow(label, value) {
  return '<div class="coc-row"><span class="coc-label">' + label + '</span><span class="coc-value">' + value + '</span></div>';
}

function renderCoC(body, data) {
  var html = '<div class="coc-th-wrap"><img src="https://upload.wikimedia.org/wikipedia/sco/5/59/Clash_of_Clans_Logo.png" alt="Clash of Clans" class="coc-th-img"></div>';
  html += '<div style="display:grid;gap:0.6rem;">';
  if (data.name) html += cocStatRow('Name', data.name);
  if (data.townHall) html += cocStatRow('Town Hall', '<span style="font-size:1.3rem;">🏛️</span> ' + data.townHall);
  if (data.clan) html += cocStatRow('Clan', data.clan);
  html += cocStatRow('Player Tag', '<strong style="color:var(--purple-accent);letter-spacing:0.5px;">' + COC_TAG + '</strong>');
  html += '</div>';
  html += '<div style="text-align:center;margin-top:0.8rem;padding-top:0.6rem;border-top:1px solid var(--purple-border);">';
  html += '<a href="https://www.clashofstats.com/players/kalki-9PU28QLQQ/summary" target="_blank" class="coc-link">Full player stats <i class="fas fa-external-link-alt"></i></a>';
  html += '</div>';
  body.innerHTML = html;
}

function renderCoCLinksFallback(body) {
  body.innerHTML = '<div style="text-align:center;padding:0.5rem 0;color:var(--text-secondary);font-size:0.75rem;">Could not fetch player data.</div>';
}

function parseWarhits(data) {
  var items = data && data.items;
  if (!items || !items.length) return null;
  var latest = items[0];
  var member = latest.member_data;
  if (!member) return null;
  var stats = {
    name: member.name,
    townHall: 'TH ' + member.townhallLevel,
    townHallLevel: member.townhallLevel,
  };
  var clan = latest.war_data && latest.war_data.clan;
  if (clan) stats.clan = clan.name + ' (lvl ' + clan.clanLevel + ')';
  return stats;
}

function tryOfficialAPI(body) {
  var apiKey = typeof config !== 'undefined' && config.cocApiKey ? config.cocApiKey : '';
  if (!apiKey) return false;
  fetch('https://api.clashofclans.com/v1/players/' + COC_TAG.replace('#', '%23'), {
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Accept': 'application/json' }
  })
    .then(function(r) { if (!r.ok) throw new Error(); return r.json(); })
    .then(function(data) {
      renderCoC(body, {
        name: data.name,
        townHall: 'TH ' + data.townHallLevel,
        townHallLevel: data.townHallLevel,
        clan: data.clan ? data.clan.name + ' (lvl ' + data.clan.clanLevel + ')' : 'No clan',
      });
    })
    .catch(function() { renderCoCLinksFallback(body); });
  return true;
}

function triggerCoCHearts() {
  if (document.querySelector('.hearts-overlay')) return;
  if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 50, 50, 50, 50, 50, 60, 60, 60, 80, 80, 100, 80, 60]);
  var overlay = document.createElement('div');
  overlay.className = 'hearts-overlay';
  document.body.appendChild(overlay);
  var emojis = ['🎮', '⚔️', '🏆', '👑', '🔥', '💎', '⚡', '🛡️'];
  var isMobile = window.innerWidth < 640;
  var count = isMobile ? 22 : 28;
  for (var i = 0; i < count; i++) {
    var x = Math.random() * 100;
    var y = Math.random() * 100;
    var delay = (Math.random() * 1.2).toFixed(2);
    var el = document.createElement('div');
    el.className = 'hearts-particle';
    el.textContent = emojis[i % emojis.length];
    el.style.left = x + '%';
    el.style.top = y + '%';
    el.style.fontSize = (isMobile ? 2.0 : 2.8) + (Math.random() * (isMobile ? 1.2 : 1.5)) + 'rem';
    el.style.setProperty('--delay', delay + 's');
    overlay.appendChild(el);
    var childCount = isMobile ? 2 : 3;
    var spread = isMobile ? 7 : 12;
    for (var c = 0; c < childCount; c++) {
      var child = document.createElement('div');
      child.className = 'hearts-particle child';
      child.textContent = emojis[(i + c + 1) % emojis.length];
      child.style.left = (x + (Math.random() - 0.5) * spread) + '%';
      child.style.top = (y + (Math.random() - 0.5) * spread) + '%';
      child.style.fontSize = (isMobile ? 0.8 : 0.6) + Math.random() * (isMobile ? 0.6 : 0.8) + 'rem';
      child.style.setProperty('--delay', (parseFloat(delay) + 0.25 + Math.random() * 0.3).toFixed(2) + 's');
      overlay.appendChild(child);
    }
  }
  setTimeout(function() {
    overlay.querySelectorAll('.hearts-particle').forEach(function(e) { e.classList.add('exit'); });
  }, 2200);
  setTimeout(function() { overlay.remove(); }, 3500);
}

function openMainCoCPopup() {
  var popup = document.createElement('div');
  popup.className = 'window-overlay';
  popup.style.cssText = 'visibility:visible;opacity:1;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);';
  popup.innerHTML =
    '<div class="window coc-window">' +
      '<div class="window-titlebar">' +
        '<span class="window-title"><i class="fas fa-shield-halved"></i> Clash of Clans · ' + COC_TAG + '</span>' +
        '<div class="window-controls"><button class="win-btn close coc-close"><i class="fas fa-times"></i></button></div>' +
      '</div>' +
      '<div class="window-body" id="coc-body">' +
        '<div style="text-align:center;padding:2rem;color:var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Loading...</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(popup);
  popup.querySelector('.coc-window').classList.add('visible');
  popup.querySelector('.coc-close').onclick = function() { popup.remove(); };
  popup.onclick = function(e) { if (e.target === popup) popup.remove(); };
  document.addEventListener('keydown', function onEsc(e2) {
    if (e2.key === 'Escape') { popup.remove(); document.removeEventListener('keydown', onEsc); }
  });
  var body = document.getElementById('coc-body');
  fetch('https://api.clashk.ing/player/%239PU28QLQQ/warhits?limit=1')
    .then(function(r) { if (!r.ok) throw new Error('CK ' + r.status); return r.json(); })
    .then(function(data) {
      var stats = parseWarhits(data);
      if (stats) { renderCoC(body, stats); }
      else { throw new Error('no data'); }
    })
    .catch(function() {
      if (!tryOfficialAPI(body)) { renderCoCLinksFallback(body); }
    });
}

function showGameQuestion() {
  var overlay = document.createElement('div');
  overlay.className = 'window-overlay';
  overlay.style.cssText = 'visibility:visible;opacity:1;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);';
  overlay.innerHTML =
    '<div class="window coc-window" style="max-width:340px;text-align:center;">' +
      '<div class="window-body" style="padding:2rem 1.5rem;">' +
        '<div style="font-size:3rem;margin-bottom:0.5rem;">🎮</div>' +
        '<p style="color:var(--text-primary);font-size:1rem;margin:0 0 0.25rem;">what\'s my favorite game?</p>' +
        
        '<div style="display:flex;gap:0.6rem;justify-content:center;margin-bottom:1rem;">' +
          '<input class="coc-letter" id="coc-l0" maxlength="1" autofocus>' +
          '<input class="coc-letter" id="coc-l1" maxlength="1">' +
          '<input class="coc-letter" id="coc-l2" maxlength="1">' +
        '</div>' +
        '<button class="coc-submit" id="coc-submit">unlock</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);
  overlay.querySelector('.coc-window').classList.add('visible');

  var inputs = [overlay.querySelector('#coc-l0'), overlay.querySelector('#coc-l1'), overlay.querySelector('#coc-l2')];
  inputs[0].focus();
  var btn = overlay.querySelector('#coc-submit');

  function advance(i) {
    if (i < 2) inputs[i + 1].focus();
  }

  for (var i = 0; i < 3; i++) {
    (function(idx) {
      inputs[idx].addEventListener('input', function() {
        if (this.value) advance(idx);
      });
      inputs[idx].addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && !this.value && idx > 0) {
          inputs[idx - 1].focus();
        }
        if (e.key === 'Enter') checkAnswer();
      });
    })(i);
  }

  function checkAnswer() {
    var val = inputs.map(function(inp) { return inp.value.toLowerCase(); }).join('');
    if (val === 'coc') {
      overlay.remove();
      triggerCoCHearts();
      setTimeout(openMainCoCPopup, 800);
    } else {
      var card = overlay.querySelector('.window');
      card.classList.add('shake');
      if (navigator.vibrate) navigator.vibrate([60, 40, 60, 40, 80, 50, 100]);
      setTimeout(function() {
        overlay.remove();
        triggerErrorHearts();
      }, 600);
    }
  }

  btn.addEventListener('click', checkAnswer);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
}

function removeCounter() {
  if (cocCounterEl) { cocCounterEl.remove(); cocCounterEl = null; }
}

function updateCounter(count) {
  removeCounter();
  if (count >= 6) return;
  cocCounterEl = document.createElement('div');
  cocCounterEl.className = 'coc-counter';
  cocCounterEl.textContent = count + '/6';
  cocTrigger.parentNode.appendChild(cocCounterEl);
}

if (cocTrigger) {
  cocTrigger.addEventListener('click', function() {
    cocClickCount++;
    clearTimeout(cocClickTimer);
    if (navigator.vibrate) navigator.vibrate(20);
    updateCounter(cocClickCount);

    cocTrigger.style.transition = 'transform 0.12s ease, color 0.12s';
    cocTrigger.style.transform = 'scale(1.06)';
    cocTrigger.style.color = 'var(--purple-accent)';
    setTimeout(function() {
      cocTrigger.style.transform = 'scale(1)';
      cocTrigger.style.color = '';
    }, 200);

    if (cocClickCount < 6) {
      cocClickTimer = setTimeout(function() { cocClickCount = 0; removeCounter(); }, 1200);
      return;
    }

    removeCounter();
    cocClickCount = 0;
    showGameQuestion();
  });
}
