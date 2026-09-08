/* ───────── CLASH OF CLANS ───────── */

const COC_TAG = '#9PU28QLQQ';

const cocTrigger = document.getElementById('coc-trigger');
let cocClickCount = 0;
let cocClickTimer;
var cocCounterEl = null;

function parseWarhits(data, latestMember) {
  var items = data && data.items;
  if (!items || !items.length) return null;

  /* Find most common clan across recent wars (skip temp/CWL clans) */
  var clanCounts = {};
  items.forEach(function(item) {
    var c = item.war_data && item.war_data.clan;
    if (c && c.name) clanCounts[c.name] = (clanCounts[c.name] || 0) + 1;
  });
  var bestClan = '', bestCount = 0;
  for (var name in clanCounts) {
    if (clanCounts[name] > bestCount) { bestCount = clanCounts[name]; bestClan = name; }
  }
  var bestClanLevel = 0;
  for (var i = 0; i < items.length; i++) {
    var c = items[i].war_data && items[i].war_data.clan;
    if (c && c.name === bestClan) { bestClanLevel = c.clanLevel; break; }
  }

  var member = latestMember || items[0].member_data;
  if (!member) return null;

  var stats = {
    name: member.name,
    townHall: 'TH ' + member.townhallLevel,
    townHallLevel: member.townhallLevel,
  };
  if (bestClan) {
    stats.clanName = bestClan;
    stats.clanLevel = bestClanLevel;
  }
  return stats;
}

function renderCoC(body, data) {
  var html =
    '<div class="coc-body-inner">' +
      '<div class="coc-header">' +
        '<img src="https://upload.wikimedia.org/wikipedia/sco/5/59/Clash_of_Clans_Logo.png" alt="" class="coc-shield">' +
      '</div>' +
      '<div class="coc-stats">';
  if (data.name) html += '<div class="coc-stat-row"><span class="coc-stat-icon"><i class="fas fa-user"></i></span><span class="coc-stat-label">Name</span><span class="coc-stat-val">' + data.name + '</span></div>';
  if (data.clanName) html += '<div class="coc-stat-row"><span class="coc-stat-icon"><i class="fas fa-flag"></i></span><span class="coc-stat-label">Clan</span><span class="coc-stat-val"><span class="coc-clan">' + data.clanName + '</span><span class="coc-clan-lvl">lvl ' + data.clanLevel + '</span></span></div>';
  html += '<div class="coc-stat-row"><span class="coc-stat-icon"><i class="fas fa-hashtag"></i></span><span class="coc-stat-label">Tag</span><span class="coc-stat-val coc-tag">' + COC_TAG + '</span></div>';
  html +=
      '</div>' +
      '<a href="https://www.clashofstats.com/players/kalki-9PU28QLQQ/summary" target="_blank" class="coc-stats-link"><i class="fas fa-external-link-alt"></i> Full player stats</a>' +
    '</div>';
  body.innerHTML = html;
}

function renderCoCLinksFallback(body) {
  body.innerHTML = '<div class="coc-body-inner" style="text-align:center;padding:2rem 1rem;"><div style="font-size:2rem;margin-bottom:0.5rem;opacity:0.4;">⚔️</div><p style="color:var(--text-secondary);font-size:0.78rem;opacity:0.65;">Could not fetch player data.</p></div>';
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
        clanName: data.clan ? data.clan.name : '',
        clanLevel: data.clan ? data.clan.clanLevel : 0,
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
  fetch('https://api.clashk.ing/player/%239PU28QLQQ/warhits?limit=15')
    .then(function(r) { if (!r.ok) throw new Error('CK ' + r.status); return r.json(); })
    .then(function(data) {
      var member = (data.items && data.items[0] && data.items[0].member_data) || null;
      var stats = parseWarhits(data, member);
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
        '<p style="color:var(--text-secondary);font-size:0.82rem;margin:0 0 0.5rem;opacity:0.65;">build · battle</p>' +
        
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
      if (navigator.vibrate) navigator.vibrate([60, 40, 60, 40, 80, 50, 100]);
      overlay.remove();
      triggerErrorHearts();
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
  cocTrigger.appendChild(cocCounterEl);
}

if (cocTrigger) {
  cocTrigger.addEventListener('click', function(e) {
    cocClickCount++;
    clearTimeout(cocClickTimer);
    if (navigator.vibrate) navigator.vibrate(20);
    updateCounter(cocClickCount);

    cocTrigger.style.transition = 'transform 0.12s ease, color 0.12s';
    cocTrigger.style.transform = 'scale(1.04)';
    cocTrigger.style.color = 'var(--purple-accent)';
    setTimeout(function() {
      cocTrigger.style.transform = 'scale(1)';
      cocTrigger.style.color = '';
    }, 200);

    var flash = document.createElement('span');
    flash.className = 'tagline-flash';
    cocTrigger.appendChild(flash);
    setTimeout(function() { flash.remove(); }, 400);

    if (cocClickCount < 6) {
      cocClickTimer = setTimeout(function() { cocClickCount = 0; removeCounter(); }, 1200);
      return;
    }

    removeCounter();
    cocClickCount = 0;
    showGameQuestion();
  });
}
