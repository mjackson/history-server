const path = require('path')
const glob = require('glob')
const express = require('express')
const httpProxy = require('http-proxy')

const createServer = (config = []) => {
  const app = express()
  const pxy = httpProxy.createProxyServer()

  config.forEach(({ path: pattern, root, proxy, options = {} }) => {
    if (proxy) {
      const options = typeof proxy === 'string' ? { target: proxy } : proxy

      // Proxy the request to a different host.
      app.use(pattern, (req, res) => {
        pxy.web(req, res, options)
      })
    } else {
      // Try to send a static file.
      app.use(pattern, express.static(root, options))

      // Fall back to the HTML file.
      app.use(pattern, (req, res) => {
        res.sendFile(path.resolve(root, options.index || 'index.html'))
      })
    }
  })

  return app
}

const byLengthDescending = (a, b) =>
  b.length - a.length

const createAppsConfig = (appsDir) => {
  const files = glob.sync(path.join(appsDir, '**', 'index.html'))
  const paths = files.map(file => path.dirname(file.replace(appsDir, '')))

  paths.sort(byLengthDescending)

  return paths.map(pattern => ({
    path: pattern,
    root: path.join(appsDir, pattern)
  }))
}

const createAppsServer = (appsDir) =>
  createServer(createAppsConfig(appsDir))

module.exports = {
  createServer,
  createAppsConfig,
  createAppsServer
}
