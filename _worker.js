addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // 判断请求路径（你可以自定义这部分逻辑）
  if (url.pathname === '/your-path') {
    // 将 URL 转发到 https://xmm123-cc.hf.space/
    return Response.redirect('https://xmm123-cc.hf.space/', 301) // 或者 302
  }

  // 默认的 302 重定向逻辑
  return Response.redirect('https://xmm123-cc.hf.space/', 302)
}
