# Bcc JS SDK | Bcc GraphQL

This package implements StakePoolSearchProvider using GraphQL

## Server-side usage

This package:

1. Generates GraphQL SDL schema from TypeScript types (`yarn build:schema`, also part of `yarn build`) `=> dist/schema.graphql`
2. Generates Dgraph schema (`yarn build:schema:dgraph`; requires local dgraph server running at port 8080, see [docker-compose.yml](./docker-compose.yml)) `=> dist/dgraph.graphql`
3. Generates [dgraph client](./src/sdk.ts) from Dgraph schema and [operations](./src/operations), which can then be used to implement `*Provider` interfaces (`yarn generate`)

## Tests

See [code coverage report]

[code coverage report]: https://The-Blockchain-Company.github.io/bcc-js-sdk/coverage/bcc-graphql
