<p align="center">
  <big><strong>Bcc JS SDK</strong></big>
</p>

<p align="center">
  <img width="200" src=".github/images/bcc-logo.png"/>
</p>

[![CI][img_src_ci]][workflow_ci]

<hr/>

## Overview

A suite of TypeScript packages suitable for both Node.js and browser-based development.

- [@bcc-sdk/core](./packages/core)
- [@bcc-sdk/cip2](./packages/cip2)
- [@bcc-sdk/cip30](./packages/cip30)
- [@bcc-sdk/wallet](./packages/wallet)
- [@bcc-sdk/util-dev](./packages/util-dev)

### Bcc Provider Implementations

- [@bcc-sdk/bcc-graphql-db-sync](packages/bcc-graphql-db-sync)
- [@bcc-sdk/bcc-graphql](packages/bcc-graphql)
- [@bcc-sdk/blockfrost](packages/blockfrost)

:information_source: Looking to use a Bcc service not listed here? [Let us know!]

### Webpack

You may use the following config when bundling this SDK with Webpack:

```js
const { IgnorePlugin, ProvidePlugin } = require('webpack');
{
  plugins: [
    // see https://www.npmjs.com/package/bip39 README
    new IgnorePlugin(/^\.\/wordlists\/(?!english)/, /bip39\/src$/),
  ],
  experiments: {
    // Requires code splitting to work.
    // Must dynamically `import()` a chunk that imports '@bcc-sdk/*'.
    syncWebAssembly: true
  }
}
```

Additionally, for browser builds:

```js
const { NormalModuleReplacementPlugin } = require('webpack');
{
  resolve: {
    fallback: {
      // Node.js polyfills. May want to install as explicit dependencies.
      stream: require.resolve('readable-stream'),
      buffer: require.resolve('buffer'),
    }
  },
  plugins: [
    new NormalModuleReplacementPlugin(
      /@emurgo\/bcc-serialization-lib-nodejs/,
      '@emurgo/bcc-serialization-lib-browser'
    )
  ]
}

```

### Testing

- [@bcc-sdk/golden-test-generator](./packages/golden-test-generator)

## Development

A Yarn Workspace maintaining a single version across all packages.

#### System Requirements

- Docker `17.12.0`+
- Docker Compose

#### Install and Build

```console
yarn install && \
yarn build
```

#### Run Tests

```console
yarn testnet:up
```

_In another terminal_

```console
yarn test
```

or

```console
yarn test:debug
```

### Lint

```console
yarn lint
```

### Cleanup

```
yarn cleanup
```

## Distribute

### Pack

```console
./scripts/pack.sh
```

### Publish to npm.org

```console
./scripts/publish.sh
```

### Generate Docs

```console
yarn docs
```

## Maintenance

### Bump Version

```console
yarn bump-version
```

Then update the sibling dependencies manually.

### New package checklist

1. Extend packageMap in [.versionrc.js](./.versionrc.js)
2. Extend [pack.sh](./scripts/pack.sh)
3. Extend [publish.sh](./scripts/publish.sh)

<p align="center">
  <a href="https://The-Blockchain-Company.github.io/bcc-js-sdk">:book: Documentation</a>
</p>

[img_src_ci]: https://github.com/The-Blockchain-Company/bcc-js-sdk/actions/workflows/continuous-integration.yaml/badge.svg
[workflow_ci]: https://github.com/The-Blockchain-Company/bcc-js-sdk/actions/workflows/continuous-integration.yaml
[let us know!]: https://github.com/The-Blockchain-Company/bcc-graphql/discussions/new
