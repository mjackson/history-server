const path = require("path");
const glob = require("glob");
const express = require("express");
const httpProxy = require("http-proxy");

function createServer(config = []) {
  const app = express();
  const pxy = httpProxy.createProxyServer();

  config.forEach(({ path: pattern, root, proxy, options = {} }) => {
    if (proxy) {
      const options = typeof proxy === "string" ? { target: proxy } : proxy;

      // Proxy the request to a different host.
      app.use(pattern, (req, res) => {
        pxy.web(req, res, options);
      });
    } else {
      // Try to send a static file.
      app.use(pattern, express.static(root, options));

      // Fall back to the HTML file.
      app.use(pattern, (req, res) => {
        res.sendFile(path.resolve(root, options.index || "index.html"));
      });
    }
  });

  return app;
}

function byLengthDescending(a, b) {
  return b.length - a.length;
}

function createAppsConfig(dir) {
  const files = glob.sync(path.join(dir, "**", "index.html"));
  const paths = files.map(file => path.dirname(file.replace(dir, "")));

  paths.sort(byLengthDescending);

  return paths.map(pattern => ({
    path: pattern,
    root: path.join(dir, pattern)
  }));
}

function createAppsServer(dir) {
  return createServer(createAppsConfig(dir));
}

module.exports = {
  createServer,
  createAppsConfig,
  createAppsServer
};
