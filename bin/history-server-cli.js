#!/usr/bin/env node
;(function () {
  const path = require('path')
  const { createServer } = require('../modules/index')

  const argv = process.argv

  const hasFlag = (flag) =>
    argv.indexOf(flag) !== -1

  const getArg = (flag, defaultValue) => {
    const index = argv.indexOf(flag)
    return index === -1 ? defaultValue : argv[index + 1]
  }

  const showUsage = () => {
console.log(`
  ## Usage

    history-server -c config.js
    history-server root

  ## Flags

    -c, --config    The path to a module that exports the server config
    -h, --help      Show this help message

  ## Configuration

  The history-server configuration should be an array of
  { path, root, options } objects where:

    - path is the URL pattern, i.e. /the/base/url*
    - root is the root directory of the app on disk
    - options are any options to express.static

  Otherwise just point history-server at a root directory that
  will be served at the / URL.
`)
  }

  const startServer = (config) => {
    const server = createServer(config)
    const port = getArg('-p') || getArg('--port') || 8080

    server.listen(port, () => {
      console.log('history server listening on port %s; Ctrl+C to stop', port)
    })
  }

  if (hasFlag('-h') || hasFlag('--help')) {
    showUsage()
    process.exit(0)
  }

  const configFile = getArg('-c') || getArg('--config')

  if (configFile) {
    console.log('history server using config in %s', configFile)

    let config
    try {
      config = require(path.resolve(configFile))
    } catch (error) {
      console.error('Invalid config file: %s', configFile)
      process.exit(1)
    }

    startServer(config)
  } else {
    const root = argv[2]

    if (root) {
      startServer([ { path: '/', root } ])
    } else {
      showUsage()
      process.exit(1)
    }
  }
})()
