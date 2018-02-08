#!/usr/bin/env node
const path = require("path");
const { createServer, createAppsConfig } = require("./index");

const argv = process.argv;

function hasFlag(flag) {
  return argv.indexOf(flag) !== -1;
}

function getArg(flag, defaultValue) {
  const index = argv.indexOf(flag);
  return index === -1 ? defaultValue : argv[index + 1];
}

function printUsage() {
  console.log(`
  Usage:

    history-server app
    history-server -a apps
    history-server -c config.js

  You may use the following flags:

    -h, --help      Show this help message
    -a, --apps      The path to a directory that contains many apps
    -c, --config    The path to a module that exports the server config
    -p, --port      The port to bind to, defaults to 8080

  See https://github.com/mjackson/history-server#configuration for more
  information about configuration.
  `);
}

function printConfig(config) {
  const longestPath = config.reduce((memo, { path }) => {
    return memo.length > path.length ? memo : path;
  }, "");

  config.forEach(({ path: pattern, proxy, root }) => {
    const trailingSpaces = longestPath.length - pattern.length;
    const trailingSpace = new Array(trailingSpaces + 1).join(" ");

    console.log(
      "  %s%s => %s",
      pattern,
      trailingSpace,
      (proxy && proxy.target) || proxy || path.relative(process.cwd(), root)
    );
  });
}

if (hasFlag("-h") || hasFlag("--help")) {
  printUsage();
  process.exit(0);
}

function startServer(config) {
  const server = createServer(config);
  const port = getArg("-p") || getArg("--port") || 8080;

  server.listen(port, () => {
    console.log("history-server listening on port %s; Ctrl+C to stop", port);
  });
}

const appsDir = getArg("-a") || getArg("--apps");
const configFile = getArg("-c") || getArg("--config");

if (appsDir) {
  const appsConfig = createAppsConfig(appsDir);

  console.log("history-server serving all apps in %s", path.resolve(appsDir));

  printConfig(appsConfig);
  startServer(appsConfig);
} else if (configFile) {
  console.log("history-server using config in %s", configFile);

  let config;
  try {
    config = require(path.resolve(configFile));
  } catch (error) {
    console.error("Invalid config file: %s", configFile);
    process.exit(1);
  }

  printConfig(config);
  startServer(config);
} else {
  const root = argv[2];

  if (root) {
    startServer([{ path: "/", root }]);
  } else {
    printUsage();
    process.exit(1);
  }
}
