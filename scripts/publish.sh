#!/usr/bin/env bash

set -euo pipefail

npm publish --cwd ./packages/blockfrost && \
npm publish --cwd ./packages/bcc-graphql && \
npm publish --cwd ./packages/bcc-graphql-db-sync && \
npm publish --cwd ./packages/cip2 && \
npm publish --cwd ./packages/cip30 && \
npm publish --cwd ./packages/core && \
npm publish --cwd ./packages/golden-test-generator && \
npm publish --cwd ./packages/util-dev && \
npm publish --cwd ./packages/wallet