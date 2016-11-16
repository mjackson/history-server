#!/usr/bin/env node
const path = require('path')
const { createServer, createAppsConfig } = require('../modules')

const argv = process.argv

const hasFlag = (flag) =>
  argv.indexOf(flag) !== -1

const getArg = (flag, defaultValue) => {
  const index = argv.indexOf(flag)
  return index === -1 ? defaultValue : argv[index + 1]
}

const printUsage = () => {
  console.log(`
  ## Usage

    The easiest way to use history-server is to point the binary at an "app"
    directory that contains your index.html file.

      $ history-server app

    Alternatively, you may serve many apps from the same domain using a
    directory that contains many apps or a config file (see Configuration below).

      $ history-server -a apps
      $ history-server -c config.js

    You can use the following flags:

      -h, --help      Show this help message
      -a, --apps      The path to a directory that contains many apps
      -c, --config    The path to a module that exports the server config
      -p, --port      The port to bind to, defaults to 5000

  ## Configuration

  To serve a single app, just point history-server at a root directory
  that contains an index.html file to serve at the / URL, using e.g.
  "history-server app".

  To serve many apps, you'll need a way to tell history-server which apps
  should be served at which URLs. The simplest way to do this is to just
  use the file system to layout your apps like you want your URLs to look.

  For example, consider the following directory tree:

    apps/
    ├── one
    │   ├── index.html
    │   └── index.js
    └── two
        ├── index.html
        ├── index.js
        └── three
            ├── index.html
            └── index.js

  You can use "history-server -a apps" serve all 3 of these apps at the
  following URLs, in matching order:

    /two/three => apps/two/three
    /one       => apps/one
    /two       => apps/two

  Care is taken to match the apps with the longest URLs first, because
  they are the most specific.

  If you need more fine-grained control over the server's configuration,
  you can use a JavaScript module that exports an array of { path, root, options }
  objects where:

    - path is the URL pattern, i.e. /the/url*
    - root is the root directory of the app on disk
    - options are express.static options

  Then use that file with "history-server -c config.js".
  `)
}

const printConfig = (config) => {
  const longestPath = config.reduce((memo, { path }) => {
    return memo.length > path.length ? memo : path
  }, '')

  config.forEach(({ path: pattern, root }) => {
    const trailingSpaces = longestPath.length - pattern.length
    const trailingSpace = new Array(trailingSpaces + 1).join(' ')
    console.log('  %s%s => %s', pattern, trailingSpace, path.relative(process.cwd(), root))
  })
}

if (hasFlag('-h') || hasFlag('--help')) {
  printUsage()
  process.exit(0)
}

const startServer = (config) => {
  const server = createServer(config)
  const port = getArg('-p') || getArg('--port') || 5000

  server.listen(port, () => {
    console.log('history-server listening on port %s; Ctrl+C to stop', port)
  })
}

const appsDir = getArg('-a') || getArg('--apps')
const configFile = getArg('-c') || getArg('--config')

if (appsDir) {
  const appsConfig = createAppsConfig(appsDir)

  console.log('history-server serving all apps in %s', path.resolve(appsDir))

  printConfig(appsConfig)
  startServer(appsConfig)
} else if (configFile) {
  console.log('history-server using config in %s', configFile)

  let config
  try {
    config = require(path.resolve(configFile))
  } catch (error) {
    console.error('Invalid config file: %s', configFile)
    process.exit(1)
  }

  printConfig(config)
  startServer(config)
} else {
  const root = argv[2]

  if (root) {
    startServer([ { path: '/', root } ])
  } else {
    printUsage()
    process.exit(1)
  }
}
