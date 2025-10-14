// frontend/src/setupProxy.js
// Create React App 代理配置
// 用于开发环境下解决跨域问题

const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // 代理所有 /api 请求到后端服务器
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5001",
      changeOrigin: true,
      secure: false,
      logLevel: "debug",
      onProxyReq: function (proxyReq, req, res) {
        console.log(
          `[Proxy] ${req.method} ${req.url} -> http://localhost:5001${req.url}`
        );
      },
      onError: function (err, req, res) {
        console.error("[Proxy Error]", err.message);
        res.status(500).json({
          error: "代理服务器错误",
          message: "请确保后端服务器正在运行在 http://localhost:5001",
        });
      },
    })
  );

  console.log("🔧 代理配置已加载: /api/* -> http://localhost:5001/api/*");
};
