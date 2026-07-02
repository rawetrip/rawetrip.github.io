export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;
    const EDIT_PASS = env.EDIT_PASS || '';

    // ── edit.jbbfilm.xyz: 在线编辑器 ──
    if (host.startsWith('edit.')) {
      // Auth check via cookie
      const cookie = request.headers.get('Cookie') || '';
      const authed = cookie.includes('edit_auth=1');

      // Login endpoint
      if (url.pathname === '/auth') {
        if (request.method === 'POST') {
          const body = await request.json();
          if (body.pass === EDIT_PASS) {
            return new Response('ok', {
              status: 200,
              headers: { 'Set-Cookie': 'edit_auth=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400' }
            });
          }
          return new Response('wrong password', { status: 403 });
        }
        // GET login page
        return new Response(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>编辑验证</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#101418;color:#d8d9da}input{padding:10px 16px;border:1px solid #54595d;border-radius:4px;background:#1b1d21;color:#fff;font-size:16px;width:260px}button{padding:10px 20px;border:none;border-radius:4px;background:#6da3f5;color:#fff;font-size:16px;cursor:pointer;margin-left:8px}.err{color:#c62828;font-size:13px;margin-top:8px}</style></head><body><div><h2>🔒 编辑模式</h2><form onsubmit="login(event)"><input id="pw" type="password" placeholder="输入密码" autofocus><button type="submit">验证</button><div class="err" id="err"></div></form></div><script>function login(e){e.preventDefault();fetch('/auth',{method:'POST',body:JSON.stringify({pass:document.getElementById('pw').value})}).then(r=>{if(r.ok)location.href=location.search.split('goto=')[1]||'/';else document.getElementById('err').textContent='密码错误'})}</script></body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }

      // Not authed → redirect to login
      if (!authed) {
        const goto = encodeURIComponent(url.pathname + url.search);
        return Response.redirect(`https://edit.jbbfilm.xyz/auth?goto=${goto}`, 302);
      }

      // ── /api routes inside edit. domain ──
      if (url.pathname === '/api') {
        // CORS preflight for edit domain
        if (request.method === 'OPTIONS') {
          return new Response(null, {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Max-Age': '86400'
            }
          });
        }

        // GET: preview (突破CORS抓取页面元数据)
        if (request.method === 'GET') {
          const type = url.searchParams.get('type') || 'issues';
          if (type === 'preview') {
            const target = url.searchParams.get('url');
            if (!target) return new Response('Missing url', { status: 400 });
            try {
              const html = await fetch(target, {
                headers: { 'User-Agent': 'jbbfilm-preview/1.0' },
                redirect: 'follow'
              });
              const text = await html.text();
              const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
              const title = titleMatch ? titleMatch[1].trim() : '';
              const descMatch = text.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i) ||
                               text.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
              const desc = descMatch ? descMatch[1] : '';
              const imgMatch = text.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
              const img = imgMatch ? imgMatch[1] : '';
              return new Response(JSON.stringify({ title, desc: desc.substring(0, 300), img }), {
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=1296000' }
              });
            } catch (e) {
              return new Response(JSON.stringify({ error: 'fetch failed' }), {
                status: 502, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
              });
            }
          }
          // Other GET types (issues, commits) not used on edit domain
          return new Response(JSON.stringify({ error: 'unknown type' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        // POST: 保存编辑 (edit domain core feature)
        if (request.method === 'POST' && url.searchParams.get('type') === 'save') {
          const body = await request.json();
          const { path, content } = body;
          if (!path || !content) return new Response('Missing path/content', { status: 400 });
          // Get current file SHA
          const shaRes = await fetch(`https://api.github.com/repos/rawetrip/rawetrip.github.io/contents${path}`, {
            headers: { 'Authorization': `Bearer ${env.GH_TOKEN}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'jbbfilm-edit' }
          });
          const shaData = await shaRes.json();
          const sha = shaData.sha;
          // Commit file
          const b64 = btoa(unescape(encodeURIComponent(content)));
          const res = await fetch(`https://api.github.com/repos/rawetrip/rawetrip.github.io/contents${path}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${env.GH_TOKEN}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'jbbfilm-edit' },
            body: JSON.stringify({ message: `edit: ${path}`, content: b64, sha })
          });
          const data = await res.json();
          return new Response(JSON.stringify(data), {
            status: res.status,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        return new Response('Method not allowed', { status: 405 });
      }

      // Authed — show file browser (仅人物页)
      if (url.pathname === '/' || url.pathname === '/bio/' || url.pathname === '' || url.pathname === '/bio') {
        const files = [
          { path: '/bio/anjiu-ovieo.html', name: 'Anjiu Ovieo' },
          { path: '/bio/Makesade.html', name: 'Makesade' },
          { path: '/bio/nangua.html', name: '南瓜' },
          { path: '/bio/goto.html', name: '后藤 (goto/AsakuraKaren)' },
          { path: '/bio/hanburger.html', name: '韩堡戈' },
        ];
        let list = files.map(f => `<a href="${f.path}" class="file-link"><span>👤 ${f.name}</span><span class="file-path">${f.path}</span></a>`).join('');
        return new Response(`<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><script>(function(){var s=localStorage.getItem("theme");if(s=="dark")document.documentElement.className="dark"})()</script><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>人物编辑 — 喂鸡百科</title><link href="/fonts/MiSans-Medium.min.css" rel="stylesheet"><link href="/fonts/MiSans-Bold.min.css" rel="stylesheet"><link href="/fonts/MiSans-Heavy.min.css" rel="stylesheet"><link rel="stylesheet" href="/css/common.css"><style>.edit-home{max-width:600px;margin:40px auto;padding:0 16px}.edit-home h1{font-size:22px;margin-bottom:8px}.file-link{display:flex;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border-light);color:var(--link);text-decoration:none;transition:background .2s;font-size:14px}.file-link:hover{background:var(--infobox-header);text-decoration:none}.file-path{flex:1;text-align:right;font-size:11px;color:var(--text2)}</style></head><body><div id="topbar"><div class="logo-area"><svg class="wiki-logo" viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#ddd"/><text x="20" y="26" text-anchor="middle" font-size="20">🐔</text></svg><span class="site-name">喂鸡百科</span><span class="site-tag">编辑模式</span></div><div class="top-actions"><a href="#" onclick="document.documentElement.classList.toggle('dark');localStorage.setItem('theme',document.documentElement.classList.contains('dark')?'dark':'light')">🔆</a><a href="/">🐔 首页</a></div></div><div class="edit-home"><h1>📝 选择人物编辑</h1><p class="article-sub">点击人物名进入可视化编辑器</p><div style="border:1px solid var(--border-light);border-radius:4px;background:var(--paper);overflow:hidden;margin-top:12px">${list}</div><div style="margin-top:24px;padding:12px;background:var(--infobox-header);border-radius:4px;font-size:12px;color:var(--text2)">💡 也可以直接访问 <code>edit.jbbfilm.xyz/bio/xxx.html</code> 编辑指定页面</div></div></body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }

      // Authed → proxy page from GitHub Pages and inject editor
      const targetUrl = 'https://rawetrip.github.io' + url.pathname + url.search;
      const res = await fetch(targetUrl);
      let html = await res.text();

      // Inject editor toolbar
      const injectJS = `<script>
(function(){
  if(document.getElementById('editBar'))return;
  var bar=document.createElement('div');
  bar.id='editBar';
  bar.innerHTML='<div style="position:fixed;bottom:0;left:0;right:0;z-index:99999;background:var(--paper);border-top:2px solid var(--link);padding:8px 16px;display:flex;gap:12px;align-items:center;font-size:13px;color:var(--text)"><span>✏️ 编辑模式:</span><b style="color:var(--link)">'+location.pathname+'</b><div style="flex:1"></div><button onclick="toggleEdit()" style="padding:6px 16px;border:1px solid var(--border);border-radius:4px;background:var(--btn-bg);color:var(--text);cursor:pointer">切换编辑</button><button onclick="saveEdit()" style="padding:6px 16px;border:none;border-radius:4px;background:#1a6e2a;color:#fff;cursor:pointer;display:none" id="saveBtn">💾 保存</button><span id="saveStatus" style="font-size:11px;color:var(--text2)"></span></div>';
  document.body.appendChild(bar);
  var editing=false;
  window.toggleEdit=function(){
    editing=!editing;
    var el=document.querySelector('#content')||document.querySelector('#main')||document.body;
    el.contentEditable=editing?'true':'false';
    document.getElementById('saveBtn').style.display=editing?'inline-block':'none';
    bar.querySelector('button:first-of-type').textContent=editing?'退出编辑':'切换编辑';
  };
  window.saveEdit=function(){
    var el=document.querySelector('#content')||document.querySelector('#main')||document.body;
    var html='<!DOCTYPE html>\\n'+document.documentElement.outerHTML;
    var s=document.getElementById('saveStatus');
    s.textContent='保存中...';
    fetch('/api?type=save',{method:'POST',body:JSON.stringify({path:location.pathname,content:html})})
    .then(function(r){return r.json()})
    .then(function(d){s.textContent='✅ 已保存';setTimeout(function(){s.textContent=''},3000)})
    .catch(function(){s.textContent='❌ 失败'});
  };
})();
<\/script>`;
      html = html.replace('</body>', injectJS + '</body>');
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // GET: 获取 issues 或 commits
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const type = url.searchParams.get('type') || 'issues';
      const per_page = url.searchParams.get('per_page') || '30';
      const page = url.searchParams.get('page') || '1';

      // type=preview: 抓取任意页面元数据 (突破CORS)
      if (type === 'preview') {
        const target = url.searchParams.get('url');
        if (!target) return new Response('Missing url', { status: 400 });
        try {
          const html = await fetch(target, {
            headers: { 'User-Agent': 'jbbfilm-preview/1.0' },
            redirect: 'follow'
          });
          const text = await html.text();
          // 提取 <title>
          const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
          const title = titleMatch ? titleMatch[1].trim() : '';
          // 提取 og:description
          const descMatch = text.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i) ||
                           text.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
          const desc = descMatch ? descMatch[1] : '';
          // 提取 og:image
          const imgMatch = text.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
          const img = imgMatch ? imgMatch[1] : '';
          return new Response(JSON.stringify({ title, desc: desc.substring(0, 300), img }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=1296000' }
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: 'fetch failed' }), {
            status: 502, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
      }

      if (type === 'commits') {
        const sha = url.searchParams.get('sha') || 'main';
        apiUrl = `https://api.github.com/repos/rawetrip/rawetrip.github.io/commits?sha=${sha}&per_page=${per_page}&page=${page}`;
      } else {
        const state = url.searchParams.get('state') || 'all';
        apiUrl = `https://api.github.com/repos/rawetrip/rawetrip.github.io/issues?state=${state}&per_page=${per_page}&page=${page}`;
      }

      const res = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${env.GH_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'jbbfilm-feedback'
        }
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60'
        }
      });
    }

    // POST: 保存编辑
    const saveType = url.searchParams.get('type');
    if (request.method === 'POST' && saveType === 'save') {
      const body = await request.json();
      const { path, content } = body;
      if (!path || !content) return new Response('Missing path/content', { status: 400 });
      // Get current file SHA
      const shaRes = await fetch(`https://api.github.com/repos/rawetrip/rawetrip.github.io/contents${path}`, {
        headers: { 'Authorization': `Bearer ${env.GH_TOKEN}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'jbbfilm-edit' }
      });
      const shaData = await shaRes.json();
      const sha = shaData.sha;
      // Commit file
      const b64 = btoa(unescape(encodeURIComponent(content)));
      const res = await fetch(`https://api.github.com/repos/rawetrip/rawetrip.github.io/contents${path}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${env.GH_TOKEN}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'jbbfilm-edit' },
        body: JSON.stringify({ message: `edit: ${path}`, content: b64, sha })
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // POST: 创建新 issue (用于 index.html 反馈表单)
    if (request.method === 'POST') {
      const body = await request.json();
      const res = await fetch('https://api.github.com/repos/rawetrip/rawetrip.github.io/issues', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GH_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'jbbfilm-feedback'
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new Response('Method not allowed', { status: 405 });
  }
};
