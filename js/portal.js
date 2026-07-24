/* ═══════════════════════════════════════════
   Portal Homepage JS
   ═══════════════════════════════════════════ */

// ── Team Data ──
var teamData = [
  {name:"Anjiu Ovieo", role:"创始人 · 导演", bio:"喂鸡百科创始人，微电影导演，铸币聚集地创始人", img:"images/Mate0.jpg"},
  {name:"Makesade", role:"改车王 · 成员", bio:"以各种抽象行为而著名，铸币聚集地成员", img:"images/Mate1.jpg"},
  {name:"南瓜", role:"微电影导演", bio:"铸币聚集地第一唐人，视频创作者", img:"images/Mate2.jpg"},
  {name:"后藤", role:"成员", bio:"铸币聚集地成员，视频创作者", img:"images/Mate0.jpg"},
  {name:"韩堡戈", role:"成员", bio:"铸币聚集地成员，视频创作者", img:"images/Mate0.jpg"},
  {name:"AsakuraKaren", role:"成员", bio:"铸币聚集地成员", img:"images/Mate0.jpg"},
  {name:"Envision_", role:"成员", bio:"铸币聚集地成员", img:"images/Mate0.jpg"},
  {name:"R4nd0m", role:"技术 · 编辑", bio:"喂鸡百科技术维护与编辑", img:"images/Mate0.jpg"}
];

function renderTeam() {
  var g = document.getElementById('teamGrid');
  if (!g) return;
  var h = '';
  for (var i = 0; i < teamData.length; i++) {
    var d = teamData[i];
    h += '<div class="team-card" onclick="location.href=\'bio/' + d.name.toLowerCase().replace(/ /g,'-') + '.html\'">';
    h += '<div class="tc-avatar"><img src="' + d.img + '" alt="' + d.name + '" loading="lazy"></div>';
    h += '<div class="tc-name">' + d.name + '</div>';
    h += '<div class="tc-role">' + d.role + '</div>';
    h += '<div class="tc-desc">' + d.bio + '</div>';
    h += '</div>';
  }
  g.innerHTML = h;
}

// ── Sponsors ──
var sponsorList = [
  ["Los Pollos Hermanos","lpollos","webp",0,""],
  ["HHM","hhm","webp",0,"transform:scale(1.5)"],
  ["Vought International","vought","webp",0,""],
  ["Black Mesa","blackmesa","svg",1,""],
  ["Aperture Science","aperture","webp",0,""],
  ["Arasaka","arasaka","webp",0,""],
  ["Stark Industries","stark","webp",1,""],
  ["NERV","nerv","webp",1,""],
  ["Umbrella Corp","umbrella","webp",0,""]
];

function renderSponsors() {
  var g = document.getElementById('sponsorBar');
  if (!g) return;
  var isDark = document.documentElement.classList.contains('dark');
  var h = '';
  for (var i = 0; i < sponsorList.length; i++) {
    var s = sponsorList[i];
    var name = s[0], src = 'images/sponsors/' + s[1] + '.' + s[2], invert = s[3];
    var filt = invert ? 'brightness(0) invert(1)' : '';
    if (!isDark && invert) filt = 'brightness(1) invert(0)';
    h += '<div class="sp-item" title="' + name + '">';
    h += '<img src="' + src + '" alt="' + name + '" style="filter:' + filt + ';' + s[4] + '" loading="lazy">';
    h += '</div>';
  }
  g.innerHTML = h;
}

// ── Scroll To Element ──
function scrollToEl(id) {
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
}

// ── News Ticker ──
(function(){
  var items = Array.from(document.querySelectorAll('.ticker-item'));
  if (!items.length) return;
  // Shuffle for random order
  for (var i = items.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }
  var idx = 0;
  show(0);
  function show(i) {
    var el = items[i];
    el.style.transition = 'none';
    el.style.transform = 'translateY(100%)';
    el.style.opacity = '0';
    void el.offsetHeight;
    el.style.transition = 'transform 0.5s cubic-bezier(.22,.61,.36,1), opacity 0.5s ease';
    el.style.transform = 'translateY(0)';
    el.style.opacity = '1';
    clearTimeout(el._timer);
    el._timer = setTimeout(function() {
      el.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
      el.style.transform = 'translateY(-100%)';
      el.style.opacity = '0';
      setTimeout(function() {
        idx = (idx + 1) % items.length;
        show(idx);
      }, 500);
    }, 5000);
  }
})();

// ── Panel Navigation ──
function openPanel(id) {
  var panel = document.getElementById(id);
  var content = document.getElementById('pageContent');
  if (!panel || !content) return;
  // Close all panels first
  document.querySelectorAll('.slide-panel').forEach(function(p){ p.classList.remove('open'); });
  // Slide content left, open panel
  content.classList.add('slide-left');
  panel.classList.add('open');
  // Update nav
  document.querySelectorAll('#mainNav a').forEach(function(a){ a.classList.remove('active'); });
  var navLink = document.querySelector('#mainNav a[data-section="' + id.replace('Panel','').toLowerCase() + '"]');
  if (navLink) navLink.classList.add('active');
}
// ── Tab Navigation ──
(function(){
  var tabStage = document.getElementById('tabStage');
  if (tabStage) tabStage.classList.add('tab-ready');
  
  function switchTab(section) {
    var tabIds = {home:'tabHome', team:'tabTeam', works:'tabWorks', events:'tabEvents', sponsors:'tabSponsors', contact:'tabContact'};
    var id = tabIds[section];
    if (!id) return;
    var el = document.getElementById(id);
    if (!el || !tabStage) return;
    var idx = Array.prototype.indexOf.call(tabStage.children, el);
    if (idx < 0) return;
    tabStage.style.transform = 'translateX(-' + (idx * 100) + '%)';
    // Update nav active
    var links = document.querySelectorAll('#mainNav a[data-section]');
    for (var i = 0; i < links.length; i++) {
      links[i].classList.remove('active');
      if (links[i].getAttribute('data-section') === section) {
        links[i].classList.add('active');
      }
    }
  }

  document.getElementById('mainNav').addEventListener('click', function(e) {
    var link = e.target.closest('a[data-section]');
    if (!link) return;
    e.preventDefault();
    var section = link.getAttribute('data-section');
    switchTab(section);
    if (section === 'home') window.scrollTo({top:0, behavior:'smooth'});
  });
})();

// ── Init ──
(function(){
  renderTeam();
  renderSponsors();
  // Banner fade on scroll - video fades faster than text
  var banner = document.querySelector('.portal-banner');
  var bannerVideo = document.querySelector('.banner-bg-video');
  var bannerText = document.querySelector('.banner-main');
  var ticking = false;
  function easeOut(t) { return t * (2 - t); }
  function updateBannerFade() {
    if (!banner) return;
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    // Video fades fast (over 400px)
    var vProgress = Math.max(0, Math.min(1, scrollY / 350));
    if (bannerVideo) bannerVideo.style.opacity = 1 - easeOut(vProgress);
    // Text fades slower (over 700px), gone before nav reaches
    var tProgress = Math.max(0, Math.min(1, scrollY / 650));
    if (bannerText) bannerText.style.opacity = 1 - easeOut(tProgress);
    ticking = false;
  }
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateBannerFade);
      ticking = true;
    }
  });
  // Smooth wheel scroll
  document.addEventListener('wheel', function(e) {
    var delta = e.deltaY;
    var start = window.scrollY;
    var target = start + delta * 1.2;
    var duration = 250;
    var startTime = null;
    function ease(t) { return t * (2 - t); }
    function animate(time) {
      if (!startTime) startTime = time;
      var elapsed = time - startTime;
      var progress = Math.min(1, elapsed / duration);
      window.scrollTo(0, start + (target - start) * ease(progress));
      if (progress < 1) requestAnimationFrame(animate);
    }
    e.preventDefault();
    requestAnimationFrame(animate);
  }, {passive: false});
  // Double font size for all content text (excluding hero banner and footer)
  // Skip non-text elements
  var skipTags = {'IMG':1,'VIDEO':1,'SVG':1,'INPUT':1,'TEXTAREA':1,'BUTTON':1,'BR':1,'HR':1,'SOURCE':1};
  var tabContent = document.querySelector('.tab-stage');
  if (tabContent) {
    var all = tabContent.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      if (skipTags[all[i].tagName]) continue;
      // Skip elements inside footer
      if (all[i].closest('[style*="border-top"]')) continue;
      var fs = parseFloat(getComputedStyle(all[i]).fontSize);
      if (fs > 0 && !isNaN(fs)) {
        all[i].style.fontSize = (fs * 1.3) + 'px';
      }
    }
  }
  var origToggle = window.toggleTheme;
  if (origToggle) {
    var _origToggle = toggleTheme;
    toggleTheme = function() {
      _origToggle();
      setTimeout(renderSponsors, 50);
    };
  }
})();
