// 目标URL
const TARGET_URL = "https://xmm123-cc.hf.space/";

// 定义路由规则
// 可以根据需要修改这些路径规则
const ROUTES = {
  // 访问 / 或根路径时直接302重定向
  root: {
    path: "/",
    type: "redirect" // 302重定向
  },
  // 访问 /url 路径时进行URL转发
  url: {
    path: "/url",
    type: "proxy" // URL转发
  },
  // 访问 /url302 路径时进行302重定向
  url302: {
    path: "/url302",
    type: "redirect" // 302重定向
  }
};

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 检查路径并执行相应操作
  if (path === ROUTES.root.path) {
    return handleRedirect();
  } else if (path === ROUTES.url.path) {
    return handleProxy(request);
  } else if (path === ROUTES.url302.path) {
    return handleRedirect();
  }
  
  // 对于其他路径，返回404
  return new Response("Not Found", { status: 404 });
}

// 处理302重定向
function handleRedirect() {
  return Response.redirect(TARGET_URL, 302);
}

// 处理URL转发（代理）
async function handleProxy(originalRequest) {
  // 创建新的请求，转发到目标URL
  const proxyRequest = new Request(TARGET_URL, {
    method: originalRequest.method,
    headers: originalRequest.headers,
    body: originalRequest.body,
    redirect: 'follow'
  });
  
  // 发送代理请求并返回响应
  const response = await fetch(proxyRequest);
  
  // 复制响应并允许跨域
  const modifiedResponse = new Response(response.body, response);
  modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
  
  return modifiedResponse;
}

// 监听fetch事件
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});
