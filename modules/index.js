const resolvePath = require('path').resolve
const express = require('express')

const createServer = (config = []) => {
  const app = express()

  config.forEach(({ path, root, options = {} }) => {
    // Try to send a static file.
    app.use(path, express.static(root, options))

    // Fall back to the HTML file.
    app.use(path, (req, res) => {
      res.sendFile(resolvePath(root, options.index || 'index.html'))
    })
  })

  return app
}

module.exports = {
  createServer
}
