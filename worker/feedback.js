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

      let apiUrl;
      if (type === 'commits') {
        const sha = url.searchParams.get('sha') || 'main';
        apiUrl = `https://api.github.com/repos/rawetrip/rawetrip.github.io/commits?sha=${sha}&per_page=${per_page}&page=${page}`;
      } else {
        const state = url.searchParams.get('state') || 'all';
        apiUrl = `https://api.github.com/repos/rawetrip/rawetrip.github.io/issues?labels=suggestion&state=${state}&per_page=${per_page}&page=${page}`;
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
