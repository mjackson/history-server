# history-server [![Travis][build-badge]][build] [![npm package][npm-badge]][npm]

[build-badge]: https://img.shields.io/travis/mjackson/history-server/master.svg?style=flat-square
[build]: https://travis-ci.org/mjackson/history-server
[npm-badge]: https://img.shields.io/npm/v/history-server.svg?style=flat-square
[npm]: https://www.npmjs.org/package/history-server

[`history-server`](https://npmjs.com/package/history-server) is an HTTP server for websites that are composed of many single-page apps (i.e. apps that use the HTML5 `history` API including `history.pushState`, `history.replaceState`, and the `popstate` event). The server is capable of serving many apps from various directories and even different hosts, all from the same domain.

## Installation

    npm install -g history-server

## Usage

The easiest way to use `history-server` is to point the binary at an `app` directory that contains your `index.html` file.

    $ history-server app

Alternatively, you may serve many apps from the same domain using a directory that contains many apps or a config file (see [Configuration](#configuration) below).

    $ history-server -a apps
    $ history-server -c config.js

You may use the following flags:

    -h, --help      Show this help message
    -a, --apps      The path to a directory that contains many apps
    -c, --config    The path to a module that exports the server config
    -p, --port      The port to bind to, defaults to 8080

## Configuration

`history-server` accepts an array of "apps" as configuration. Each app is an object of `{ path, root, options, proxy }` where:

* `path` is the URL pattern, i.e. /the/url (required)
* `root` is the root directory of the app on disk (optional, only for same host)
* `options` are [`express.static`](http://expressjs.com/en/api.html#express.static) options (optional, only used with `root`)
* `proxy` is the target URL on another host (e.g. `http://www.example.com/path`) or [an options object](https://github.com/nodejitsu/node-http-proxy#options) to `http-proxy` (optional, for different hosts)

Save your configuration in a module called `config.js`, then start a server with `history-server -c config.js`.

## Simple Configuration on a Single Host

To serve a single app, just point history-server at a root directory that contains an index.html file to serve at the / URL, using e.g. `history-server app`.

To serve many apps on the same host, you'll need a way to tell history-server which apps should be served at which URLs. An easy way to do this is to just use the file system to layout your apps like you want your URLs to look.

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

You can use `history-server -a apps` serve all 3 of these apps at the following URLs, in matching order:

    /two/three => apps/two/three
    /one       => apps/one
    /two       => apps/two

Care is taken to match the apps with the longest URLs first, because they are the most specific.

## Usage in node

```js
const path = require("path");
const { createServer } = require("history-server");

const server = createServer([
  // Any request that begins with "/one" will use apps/one/index.html
  {
    path: "/one",
    root: path.resolve(__dirname, "apps/one")
  },

  // Any request that begins with "/two/three" will serve apps/two/index.html
  {
    path: "/two/three",
    root: path.resolve(__dirname, "apps/two")
  },

  // Any request that begins with "/two" will serve apps/two/index.html
  {
    path: "/two",
    root: path.resolve(__dirname, "apps/two")
  },

  // Proxies all requests to "/proxy" through to another host
  {
    path: "/proxy",
    proxy: "http://www.example.com/path"
  }
]);
```

## Tips

When mounting multiple HTML5 apps on the same domain, you should be sure to:

* **use relative URLs** when you link to resources such as scripts and images, i.e. use `<script src="index.js"></script>` instead of `<script src="/index.js"></script>`. Otherwise your request will go to the root URL instead of your app
* **use [`<base href>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base)** to specify the base URL to use for all those relative URLs. This should be the `path` of your app with a trailing slash, e.g. `/one/` for an app with a `path` of `/one`

That's it! Enjoy :)
