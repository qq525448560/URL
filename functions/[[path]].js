// 目标URL和域名
const TARGET_URL = "https://xmm123-cc.hf.space/";
const TARGET_DOMAIN = new URL(TARGET_URL).hostname;
// 你的自定义域名
const MY_DOMAIN = "tv.xmma.xyz";

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // 检查是否已经是目标域名，直接返回成功
  if (url.hostname === TARGET_DOMAIN) {
    return new Response("已在目标服务器", { status: 200 });
  }
  
  // 检查是否已经是自己的域名
  if (url.hostname === MY_DOMAIN) {
    // 检查是否有重定向标识，避免循环
    const hasRedirected = request.headers.get('X-Redirected');
    
    if (hasRedirected) {
      // 已经重定向过，显示目标内容
      return proxyToTarget(request);
    }
    
    // 对所有路径进行302重定向（不再限制特定路径）
    const response = Response.redirect(TARGET_URL, 302);
    response.headers.set('X-Redirected', 'true');
    return response;
  }
  
  // 对于其他情况，统一代理到目标URL
  return proxyToTarget(request);
}

// 代理到目标URL的函数
async function proxyToTarget(request) {
  try {
    const proxyRequest = new Request(TARGET_URL, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'manual'
    });
    
    // 移除可能导致冲突的头信息
    proxyRequest.headers.delete('Host');
    
    const response = await fetch(proxyRequest);
    
    const modifiedResponse = new Response(response.body, response);
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    return modifiedResponse;
  } catch (error) {
    return new Response(`服务暂时不可用: ${error.message}`, { status: 503 });
  }
}
