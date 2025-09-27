// 目标URL和域名
const TARGET_URL = "https://xmm123-cc.hf.space/";
const TARGET_DOMAIN = new URL(TARGET_URL).hostname;
// 你的自定义域名（请替换为实际使用的域名）
const MY_DOMAIN = "tv.xmma.xyz";

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // 第一层防护：检查是否已经是目标域名
  if (url.hostname === TARGET_DOMAIN) {
    return new Response("已在目标服务器", { status: 200 });
  }
  
  // 第二层防护：检查是否已经是自己的域名（避免自循环）
  if (url.hostname === MY_DOMAIN && 
      (url.pathname === "/" || url.pathname === "/url302")) {
    // 只重定向一次，添加标识避免循环
    const hasRedirected = request.headers.get('X-Redirected');
    
    if (hasRedirected) {
      // 已经重定向过，不再继续
      return new Response("重定向完成", { status: 200 });
    }
    
    // 添加自定义头标识已重定向
    const response = Response.redirect(TARGET_URL, 302);
    response.headers.set('X-Redirected', 'true');
    return response;
  }
  
  // 处理URL代理
  if (url.pathname === "/url") {
    try {
      const proxyRequest = new Request(TARGET_URL, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'manual' // 手动处理重定向，避免自动重定向导致循环
      });
      
      // 移除可能导致问题的头
      proxyRequest.headers.delete('Host');
      
      const response = await fetch(proxyRequest);
      
      // 如果目标返回重定向，直接返回给客户端处理
      if (response.redirected) {
        return response;
      }
      
      const modifiedResponse = new Response(response.body, response);
      modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
      return modifiedResponse;
    } catch (error) {
      return new Response(`代理错误: ${error.message}`, { status: 502 });
    }
  }
  
  // 其他路径返回404
  return new Response("未找到页面", { status: 404 });
}
