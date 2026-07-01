export default {
  async fetch(request, env) {
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
