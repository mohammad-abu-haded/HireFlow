const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

console.log("Gateway starting...");

// AUTH
app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://localhost:5001",
    changeOrigin: true,
    pathRewrite: {
      "^/auth": "",
    },
  })
);

// JOBS
app.use(
  "/jobs",
  createProxyMiddleware({
    target: "http://localhost:5002",
    changeOrigin: true,
    logLevel: "debug",
    onProxyReq: (proxyReq, req) => {
      if (req.headers.authorization) {
        proxyReq.setHeader("authorization", req.headers.authorization);
      }
    },
  })
);

// APPLICATIONS
app.use(
  "/applications",
  createProxyMiddleware({
    target: "http://localhost:5003",
    changeOrigin: true,
    logLevel: "debug",
    onProxyReq: (proxyReq, req) => {
      if (req.headers.authorization) {
        proxyReq.setHeader("authorization", req.headers.authorization);
      }
    },
  })
);

app.listen(5000, () => {
  console.log("API Gateway running on 5000");
});