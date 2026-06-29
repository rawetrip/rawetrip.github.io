/**
 * common.js — Wei Ji Encyclopedia cross-page shared logic
 * Theme toggle / Music / Video modal / Search / Hover preview / Rick Roll
 */

var musicOn = false, _fadeTimer = null;
var bgm = document.getElementById('bgm');

function toggleMusic() {
  if (!bgm) return;
  if (!musicOn) {
    bgm.play().catch(function () { });
    document.getElementById('musicBtn').textContent = '🎵';
    musicOn = true;
    document.getElementById('musicBtn').setAttribute('aria-checked', 'true');
  } else {
    bgm.pause();
    document.getElementById('musicBtn').textContent = '💿';
    musicOn = false;
    document.getElementById('musicBtn').setAttribute('aria-checked', 'false');
  }
}

function fadeOutMusic() {
  if (!musicOn || !bgm) return;
  if (_fadeTimer) { clearInterval(_fadeTimer); }
  var v = bgm.volume;
  _fadeTimer = setInterval(function () {
    v -= .05;
    if (v <= 0) { bgm.pause(); bgm.volume = 0; clearInterval(_fadeTimer); _fadeTimer = null; }
    else { bgm.volume = v; }
  }, 50);
}

function fadeInMusic() {
  if (!musicOn || !bgm) return;
  if (_fadeTimer) { clearInterval(_fadeTimer); }
  bgm.currentTime = bgm.currentTime || 0;
  bgm.volume = 0;
  bgm.play().catch(function () { });
  var v = 0;
  _fadeTimer = setInterval(function () {
    v += .05;
    if (v >= 1) { bgm.volume = 1; clearInterval(_fadeTimer); _fadeTimer = null; }
    else { bgm.volume = v; }
  }, 50);
}

function openVideo(src) {
  var ov = document.getElementById('videoOverlay');
  var v = document.getElementById('modalVideo');
  var sp = document.getElementById('videoSpinner');
  if (!ov || !v || !sp) return;
  sp.style.display = 'block';
  v.style.opacity = '0';
  v.style.display = 'block';
  v.src = src;
  ov.classList.add('active');
  fadeOutMusic();
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeVideo();
});

function closeVideo() {
  var ov = document.getElementById('videoOverlay');
  var v = document.getElementById('modalVideo');
  if (!ov || !v) return;
  ov.classList.remove('active');
  v.pause();
  v.src = '';
  fadeInMusic();
}

function toggleTheme() {
  var h = document.documentElement;
  h.classList.toggle('dark');
  var isDark = h.classList.contains('dark');
  document.getElementById('themeToggle').textContent = isDark ? '☀ 浅色' : '🌙 深色';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  if (typeof renderSponsors === 'function') renderSponsors();
}

(function () {
  var s = localStorage.getItem('theme');
  if (s === 'dark') {
    document.getElementById('themeToggle').textContent = '☀ 浅色';
  }
})();

function doSearch() {
  var q = document.getElementById('searchInput').value.trim().toLowerCase();
  var ak = ['安九','安九奥维奥','安九ovo','鸡','臭鸡','筹集','牢九','老九','爱丽丝','哈基丝','蔡洪浩','anjiu','anjiuovo','anjiu·ovieo','胡桃','无辜的胡桃','彩虹好','安霍鸡尾酒','安奥鸡尾酒'];
  for (var i = 0; i < ak.length; i++) {
    if (q === ak[i].toLowerCase()) { location.href = 'anjiu-ovieo.html'; return; }
  }
  var mk = ['马可赛德','makesade','马克萨德','吗的谁卡','制作悲伤','马德赛可','御坂','俊人13'];
  for (var i = 0; i < mk.length; i++) {
    if (q === mk[i].toLowerCase()) { location.href = 'Makesade.html'; return; }
  }
}

var _previewPages = window._previewPages || {};

(function () {
  var popup = document.createElement('div');
  popup.className = 'mwe-popups';
  popup.innerHTML = '<div class="mwe-popups-container"></div>';
  document.body.appendChild(popup);
  var timer = null;

  function showPopup(e, href) {
    var p = _previewPages[href];
    if (!p) return;
    var c = popup.querySelector('.mwe-popups-container');
    c.innerHTML = (p.img ? '<a href="' + href + '"><img src="' + p.img + '"></a>' : '') +
      '<div class="popups-text"><a class="popups-title" href="' + href + '">' + p.title + '</a><div class="popups-desc">' + p.desc + '</div></div>';
    popup.classList.add('show');
    var x = e.clientX + 15, y = e.clientY + 10;
    if (x + 340 > window.innerWidth) x = e.clientX - 355;
    if (y + 200 > window.innerHeight) y = e.clientY - 210;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
  }

  function hidePopup() { popup.classList.remove('show'); }

  document.querySelectorAll('a[href$=".html"]').forEach(function (a) {
    a.addEventListener('mouseenter', function (e) {
      clearTimeout(timer);
      timer = setTimeout(function () { showPopup(e, a.getAttribute('href')); }, 250);
    });
    a.addEventListener('mouseleave', function () { clearTimeout(timer); hidePopup(); });
  });
})();

document.querySelectorAll('.edit-link a').forEach(function (el) {
  el.addEventListener('click', function (e) {
    e.preventDefault();
    location.href = 'https://www.bilibili.com/video/BV1GJ411x7h7';
  });
});
