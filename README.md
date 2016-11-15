# history-server

[`history-server`](https://npmjs.com/package/history-server) is an HTTP server for single-page apps that use the HTML5 `history` API including `history.pushState`, `history.replaceState`, and the `popstate` event. The server is capable of serving multiple apps from the same domain and is built on top of [`express`](https://www.npmjs.com/package/express).


## Installation

    npm install --save history-server

## CLI Usage

To serve a single HTML5 app using the CLI, just point the server at the root directory:

    history-server apps/one

To serve more than one app, provide the path to a configuration file that exports an array of `{ path, root, options }` objects where:

- `path` is the URL path pattern (uses `path-to-regexp`)
- `root` is the root directory that contains the `index.html` file
- `options` are any options you want to pass to [`express.static`](http://expressjs.com/en/api.html#express.static)

## Usage in node

```js
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

- **use the correct `<base href>`** in your HTML document. `<base href>` specifies the base URL to use for all relative URLs in the document, and should be the `path` of your app with a trailing slash, i.e. `/one/` for an app with a path of `/one`
- **use relative paths** when you link to other resources such as scripts and images, i.e. use `<script src="index.js"></script>` instead of `<script src="/index.js"></script>`. Otherwise your request will go to the root URL instead of your app

That's it! Enjoy :)
