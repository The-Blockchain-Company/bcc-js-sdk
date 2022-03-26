// This import is required due to the unfortunate way
// the Ledger hw-transport libraries are compiled
// https://github.com/LedgerHQ/ledgerjs/issues/266
import 'babel-polyfill'

import * as bccNodeBindings from 'bcc-wallet'
import ledgerNodeTransport from '@ledgerhq/hw-transport-node-hid'
import ledgerU2fTransport from '@ledgerhq/hw-transport-u2f'

function isNode (): boolean {
  try {
    return !!process
  } catch (e) {
    return false
  }
}

export function getBindingsForEnvironment () {
  return isNode()
    ? bccNodeBindings
    : require('bcc-wallet-browser') as typeof bccNodeBindings
}

export function getLedgerTransportForEnvironment () {
  return isNode()
    ? ledgerNodeTransport
    : ledgerU2fTransport
}
