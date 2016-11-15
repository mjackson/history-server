# history-server

[`history-server`](https://npmjs.com/package/history-server) is an HTTP server for single-page apps that use the HTML5 `history` API including `history.pushState`, `history.replaceState`, and the `popstate` event. The server is capable of serving multiple apps from the same domain and is built on top of [`express`](https://www.npmjs.com/package/express).

## Installation

    npm install -g history-server

## Usage

    history-server -a apps
    history-server -c config.js
    history-server root

## Flags

    -a, --apps      The path to a directory that contains many apps
    -c, --config    The path to a module that exports the server config
    -h, --help      Show this help message

## Configuration

To serve a single app, just point history-server at a root directory that contains an index.html file to serve at the / URL, using e.g. `history-server app`.

To serve many apps, you'll need a way to tell history-server which apps should be served at which URLs. The simplest way to do this is to just use the file system to layout your apps like you want your URLs to look.

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

If you need more fine-grained control over the server's configuration, you can use a JavaScript module that exports an array of `{ path, root, options }` objects where:

- `path` is the URL pattern, i.e. /the/url
- `root` is the root directory of the app on disk
- `options` are [`express.static`](http://expressjs.com/en/api.html#express.static) options

Then use that file with `history-server -c config.js`.

## Usage in node

```js
const path = require('path')
const { createServer } = require('history-server')

const server = createServer([
  // Any request that begins with "/one" will use apps/one/index.html
  { path: '/one',
    root: path.resolve(__dirname, 'apps/one')
  },

  // Any request that begins with "/two/three" will serve apps/two/index.html
  { path: '/two/three',
    root: path.resolve(__dirname, 'apps/two')
  },

  // Any request that begins with "/two" will serve apps/two/index.html
  { path: '/two',
    root: path.resolve(__dirname, 'apps/two')
  }
])
```

## Tips

When mounting multiple HTML5 apps on the same domain, you should be sure to:

- **use relative URLs** when you link to resources such as scripts and images, i.e. use `<script src="index.js"></script>` instead of `<script src="/index.js"></script>`. Otherwise your request will go to the root URL instead of your app
- **use [`<base href>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base)** to specify the base URL to use for all those relative URLs. This should be the `path` of your app with a trailing slash, e.g. `/one/` for an app with a `path` of `/one`

That's it! Enjoy :)
