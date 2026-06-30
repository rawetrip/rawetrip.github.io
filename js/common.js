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
  v.style.display = 'none';
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

// ═══════════════════ Search Engine ═══════════════════
var _searchIndex = [
  // ── 人物 ──
  {t:"Anjiu Ovieo", u:"anjiu-ovieo.html", c:"人物", p:"anjiu ovieo", k:"安九 蔡洪浩 鸡 爱丽丝 微电影导演 铸币聚集地"},
  {t:"Makesade", u:"Makesade.html", c:"人物", p:"makesade", k:"马可赛德 马克萨德 改车王 御坂美琴 学生 福建"},

  // ── 事件 ──
  {t:"标记炸弹安放点 B", u:"events.html#e1", c:"事件 · Anjiu", p:"biaojizhadananfangdian b", k:"CS2炸弹B点标记 战术"},
  {t:"手机砸蛋 → 赛博春晚", u:"events.html#e2", c:"事件 · Anjiu", p:"shoujizadan saibochunwan", k:"三角洲行动 砸蛋 赛博春晚"},
  {t:"人机反诈", u:"events.html#e3", c:"事件 · Anjiu", p:"renjifanzha", k:"反诈骗 电话 录音 反诈中心"},
  {t:"「来！」", u:"events.html#e4", c:"事件 · Anjiu", p:"lai", k:"来 语音 经典"},
  {t:"谁给我麦闭了", u:"events.html#e5", c:"事件 · Anjiu", p:"shuigeiwomaibile", k:"麦闭 谁给老子麦闭了 OW Overwatch"},
  {t:"穿点乌龙", u:"events.html#e6", c:"事件 · Anjiu", p:"chuandianwulong", k:"CS2 Inferno 穿点 惨叫 卡我干嘛"},
  {t:"一生的好兄弟", u:"events.html#e7", c:"事件 · Anjiu", p:"yishengdehaoxiongdi", k:"韩堡戈 好兄弟 CS2"},
  {t:"英国轮辊", u:"events.html#e8", c:"事件 · Anjiu", p:"yingguolungun", k:"英国伦敦 口误 轮辊"},
  {t:"油盛 186 广告词", u:"events.html#e9", c:"事件 · Makesade", p:"yousheng guanggaoci", k:"油盛186 广告 改车"},
  {t:"张浪麻辣浪", u:"events.html#e10", c:"事件 · Makesade", p:"zhanglangmalalang", k:"张亮麻辣烫 口误 点餐"},
  {t:"185 与 085", u:"events.html#e11", c:"事件 · Makesade", p:"185 yu 085", k:"GTA5 数字混淆 185 085"},
  {t:"摸来摸去", u:"events.html#e12", c:"事件 · Makesade", p:"molaimoqu", k:"GTA5 即时回放 摸"},
  {t:"美丽的神话", u:"events.html#e13", c:"事件 · Makesade", p:"meilideshenhua", k:"唱歌 演唱 神话 音乐"},
  {t:"漏尿事件", u:"events.html#e14", c:"事件 · Makesade", p:"louniaoshijian", k:"L4D2 求生之路 漏尿"},
  {t:"寻找「她」", u:"events.html#e15", c:"事件 · Makesade", p:"xunzhaota", k:"寻找 社交 帖子"},
  {t:"法老偶像", u:"events.html#e16", c:"事件 · Makesade", p:"falaoouxiang", k:"说唱 法老 rapper 闽南"},

  // ── 页面 ──
  {t:"事件专栏", u:"events.html", c:"页面", p:"shijianzhuanlan", k:"事件 大事 记录"},
  {t:"媒体库", u:"media.html", c:"页面", p:"meitiku", k:"媒体 视频 音频 图片 资源"},
  {t:"赞助商", u:"index.html#sponsors", c:"页面", p:"zanzhushang", k:"sponsors 合作 伙伴"},
  {t:"联系我们", u:"index.html#contact", c:"页面", p:"lianxiwomen", k:"contact 联系 邮件 表单"},

  // ── 赞助商品牌 ──
  {t:"Los Pollos Hermanos", u:"index.html#sponsors", c:"赞助商", p:"", k:"赞助商"},
  {t:"Vought International", u:"index.html#sponsors", c:"赞助商", p:"", k:"赞助商 沃特"},
  {t:"Arasaka Corporation", u:"index.html#sponsors", c:"赞助商", p:"", k:"赞助商 荒坂"},
  {t:"Stark Industries", u:"index.html#sponsors", c:"赞助商", p:"", k:"赞助商 斯塔克"},
  {t:"Black Mesa", u:"index.html#sponsors", c:"赞助商", p:"", k:"赞助商 黑山"},
  {t:"Aperture Science", u:"index.html#sponsors", c:"赞助商", p:"", k:"赞助商 光圈"},
  {t:"Umbrella Corp", u:"index.html#sponsors", c:"赞助商", p:"", k:"赞助商 保护伞"}
];

// Pinyin initial mapping for CJK characters (common subset)
var _pyMap = {};
(function(){
  var map = "阿a 八b 擦c 大d 额e 发f 嘎g 哈h 一i 加j 卡k 拉l 吗m 那n 哦o 趴p 七q 然r 萨s 他t 乌u 瓦v 哇w 西x 压y 匝z";
  map.split(" ").forEach(function(p){ _pyMap[p[0]]=p[1]; });
})();

function _pyInitial(c){
  if (_pyMap[c]) return _pyMap[c];
  var code = c.charCodeAt(0);
  if (code >= 0x4e00 && code <= 0x9fff) { /* CJK without mapping → try to match */ return ""; }
  if (code >= 65 && code <= 90) return c.toLowerCase();
  if (code >= 97 && code <= 122) return c;
  if (code >= 48 && code <= 57) return c;
  return "";
}

function _normalize(s){ return (s||"").toLowerCase().replace(/\s+/g," ").trim(); }

function _score(item, q){
  var score = 0;
  // Exact title match
  if (_normalize(item.t) === q) return 100;
  // Title starts with query
  if (_normalize(item.t).indexOf(q) === 0) score += 50;
  // Title contains query
  else if (_normalize(item.t).indexOf(q) > 0) score += 35;
  // Pinyin contains query
  if (item.p && _normalize(item.p).indexOf(q) >= 0) score += 30;
  // Keywords contain query
  if (item.k && _normalize(item.k).indexOf(q) >= 0) score += 20;
  // Pinyin initials matching (e.g. "aj" matches "anjiu")
  if (item.p && !item.p.match(/[a-z]/i)) { /* no pinyin */ } else if (item.p) {
    var initials = item.p.split(" ").map(function(w){ return w[0]||""; }).join("");
    if (initials.indexOf(q) >= 0) score += 25;
  }
  // Category match
  if (_normalize(item.c).indexOf(q) >= 0) score += 10;
  // Fuzzy: character-by-character partial match in title
  if (q.length >= 2) {
    var matchCount = 0;
    for (var i = 0; i < q.length; i++) {
      if (_normalize(item.t).indexOf(q[i]) >= 0) matchCount++;
    }
    if (matchCount >= q.length * 0.7) score += matchCount * 2;
  }
  return score;
}

// ── Build dropdown ──
(function(){
  var dd = document.createElement("div");
  dd.className = "search-dropdown";
  dd.id = "searchDropdown";
  var sb = document.querySelector(".search-box");
  if (sb) sb.appendChild(dd);
})();

var _searchActiveIdx = -1;

function doSearch(){
  var q = document.getElementById("searchInput").value.trim();
  if (!q) return;
  var qn = _normalize(q);
  var results = [];
  for (var i = 0; i < _searchIndex.length; i++) {
    var s = _score(_searchIndex[i], qn);
    if (s > 0) results.push({item:_searchIndex[i], score:s});
  }
  results.sort(function(a,b){ return b.score - a.score; });
  if (results.length > 0) {
    location.href = results[0].item.u;
  }
}

function _showSuggestions(){
  var q = document.getElementById("searchInput").value.trim();
  var dd = document.getElementById("searchDropdown");
  if (!dd) return;
  if (!q || q.length < 1) { dd.classList.remove("active"); _searchActiveIdx = -1; return; }
  var qn = _normalize(q);
  var results = [];
  for (var i = 0; i < _searchIndex.length; i++) {
    var s = _score(_searchIndex[i], qn);
    if (s > 0) results.push({item:_searchIndex[i], score:s});
  }
  results.sort(function(a,b){ return b.score - a.score; });
  results = results.slice(0, 10);

  if (results.length === 0) {
    dd.innerHTML = '<div class="sd-empty">未找到匹配结果</div>';
  } else {
    var h = "";
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      // Highlight matching text in title
      var title = r.item.t;
      var idx = _normalize(title).indexOf(qn);
      if (idx >= 0) {
        title = title.substring(0, idx) + "<mark>" + title.substring(idx, idx + q.length) + "</mark>" + title.substring(idx + q.length);
      }
      h += '<div class="sd-item" data-url="' + r.item.u + '" data-idx="' + i + '">';
      h += '<div class="sd-icon">' + (r.item.c.indexOf("人物")>=0 ? "👤" : r.item.c.indexOf("事件")>=0 ? "📌" : r.item.c.indexOf("赞助")>=0 ? "🏢" : "📄") + '</div>';
      h += '<div class="sd-info"><div class="sd-title">' + title + '</div><div class="sd-sub">' + r.item.c + '</div></div>';
      h += '</div>';
    }
    dd.innerHTML = h;
  }
  dd.classList.add("active");
  _searchActiveIdx = -1;

  // Bind click events
  dd.querySelectorAll(".sd-item").forEach(function(el){
    el.addEventListener("click", function(){
      location.href = this.getAttribute("data-url");
    });
  });
}

function _moveSelection(dir){
  var dd = document.getElementById("searchDropdown");
  if (!dd || !dd.classList.contains("active")) return;
  var items = dd.querySelectorAll(".sd-item");
  if (items.length === 0) return;
  // Remove old active
  items.forEach(function(el){ el.classList.remove("active"); });
  _searchActiveIdx += dir;
  if (_searchActiveIdx < 0) _searchActiveIdx = items.length - 1;
  if (_searchActiveIdx >= items.length) _searchActiveIdx = 0;
  items[_searchActiveIdx].classList.add("active");
  items[_searchActiveIdx].scrollIntoView({block:"nearest"});
}

function _selectActive(){
  var dd = document.getElementById("searchDropdown");
  if (!dd) return;
  var active = dd.querySelector(".sd-item.active");
  if (active) {
    location.href = active.getAttribute("data-url");
  } else {
    doSearch();
  }
}

// ── Bind search input events ──
(function(){
  var input = document.getElementById("searchInput");
  if (!input) return;
  var timer = null;
  input.addEventListener("input", function(){
    clearTimeout(timer);
    timer = setTimeout(_showSuggestions, 150);
  });
  input.addEventListener("keydown", function(e){
    var dd = document.getElementById("searchDropdown");
    if (e.key === "Escape") {
      if (dd) dd.classList.remove("active");
      _searchActiveIdx = -1;
      input.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!dd || !dd.classList.contains("active")) _showSuggestions();
      _moveSelection(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      _moveSelection(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      _selectActive();
    }
  });
  // Close dropdown on outside click
  document.addEventListener("click", function(e){
    var dd = document.getElementById("searchDropdown");
    if (dd && !e.target.closest(".search-box")) {
      dd.classList.remove("active");
      _searchActiveIdx = -1;
    }
  });
  // Also bind the old onkeydown attr if present
  input.setAttribute("onkeydown", "");
})();

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

// ── 回到顶部 ──
(function () {
  var btn = document.createElement('button');
  btn.id = 'backTop';
  btn.innerHTML = '⬆';
  btn.title = '回到顶部';
  btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.body.appendChild(btn);
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        btn.classList.toggle('visible', window.scrollY > 400);
        ticking = false;
      });
      ticking = true;
    }
  });
})();

// ── 预计阅读时间 ──
(function () {
  var el = document.querySelector('#content');
  if (!el) return;
  var text = el.textContent || el.innerText;
  var cnChars = (text.match(/[一-鿿]/g) || []).length;
  // 中文 ~400字/分钟，英文 ~200词/分钟
  var enWords = (text.match(/[a-zA-Z]+/g) || []).length;
  var minutes = Math.max(1, Math.round(cnChars / 400 + enWords / 200));
  var badge = document.createElement('span');
  badge.className = 'reading-time';
  badge.textContent = '⏱ 预计阅读 ' + minutes + ' 分钟';
  var sub = document.querySelector('.article-sub');
  if (sub) sub.appendChild(badge);
})();

// ── 图片懒加载模糊占位 ──
(function () {
  // Find all lazy images and add blur-up behavior
  var imgs = document.querySelectorAll('img[loading="lazy"], img.lazy-blur');
  var shimmerTargets = document.querySelectorAll('.film-card img, .mp-card-img, .infobox-image img');

  // Add shimmer placeholder to card images
  shimmerTargets.forEach(function (img) {
    var parent = img.parentElement;
    if (parent && !parent.classList.contains('lazy-placeholder')) {
      parent.classList.add('lazy-placeholder');
    }
  });

  function onImgLoaded(img) {
    img.classList.add('loaded');
    // Remove shimmer from parent
    var parent = img.parentElement;
    if (parent) parent.classList.remove('lazy-placeholder');
  }

  imgs.forEach(function (img) {
    // Already loaded (cached)
    if (img.complete && img.naturalWidth > 0) {
      onImgLoaded(img);
      return;
    }
    // Add blur class if not already present
    if (!img.classList.contains('lazy-blur') && !img.classList.contains('no-blur')) {
      img.classList.add('lazy-blur');
    }
    img.addEventListener('load', function () { onImgLoaded(this); });
    img.addEventListener('error', function () {
      // On error, still remove blur but keep a fallback
      this.classList.add('loaded');
      var p = this.parentElement;
      if (p) p.classList.remove('lazy-placeholder');
    });
  });

  // Observe dynamically added images (for SPA-like behavior)
  if (window.MutationObserver) {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeName === 'IMG') {
            if (node.loading === 'lazy' || node.classList.contains('lazy-blur')) {
              node.classList.add('lazy-blur');
              node.addEventListener('load', function () { onImgLoaded(this); });
            }
          }
          if (node.querySelectorAll) {
            var nested = node.querySelectorAll('img[loading="lazy"], img.lazy-blur');
            nested.forEach(function (n) {
              n.classList.add('lazy-blur');
              n.addEventListener('load', function () { onImgLoaded(this); });
            });
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
