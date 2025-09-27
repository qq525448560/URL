// 目标URL和域名
const TARGET_URL = "https://xmm123-cc.hf.space/";
const TARGET_DOMAIN = new URL(TARGET_URL).hostname;

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 检查是否已经在目标域名上，避免循环重定向
  if (url.hostname === TARGET_DOMAIN) {
    return new Response("Already at target domain", { status: 200 });
  }
  
  // 处理不同路径
  if (path === "/" || path === "/url302") {
    // 302重定向
    return Response.redirect(TARGET_URL, 302);
  } else if (path === "/url") {
    // URL转发（代理）
    const proxyRequest = new Request(TARGET_URL, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow'
    });
    
    const response = await fetch(proxyRequest);
    const modifiedResponse = new Response(response.body, response);
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    
    return modifiedResponse;
  }
  
  // 其他路径返回404
  return new Response("Not Found", { status: 404 });
}
    
