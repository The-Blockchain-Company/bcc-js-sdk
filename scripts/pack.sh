#!/usr/bin/env bash

set -euo pipefail

npm pack --cwd ./packages/blockfrost && \
npm pack --cwd ./packages/bcc-graphql && \
npm pack --cwd ./packages/bcc-graphql-db-sync && \
npm pack --cwd ./packages/cip2 && \
npm pack --cwd ./packages/cip30 && \
npm pack --cwd ./packages/core && \
npm pack --cwd ./packages/golden-test-generator && \
npm pack --cwd ./packages/util-dev && \
npm pack --cwd ./packages/wallet
