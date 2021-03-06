import { BccProvider } from '../../../Provider'
import { AddressType, Address } from '../../../Wallet'
import { SCAN_GAP } from './config'
import { addressDiscoveryWithinBounds } from '../../../Utils'
import { Bcc, ChainSettings } from '../../../Bcc'

export function getNextAddressByType (bcc: Bcc, provider: BccProvider, account: string, type: AddressType) {
  return scanBip44AccountForAddressWithoutTransactions({
    bcc,
    account,
    provider,
    lowerBound: 0,
    upperBound: SCAN_GAP - 1,
    type
  })
}

interface ScanRangeParameters {
  bcc: Bcc
  provider: BccProvider
  account: string
  lowerBound: number
  upperBound: number
  type: AddressType
}

async function scanBip44AccountForAddressWithoutTransactions ({ bcc, provider, account, lowerBound, upperBound, type }: ScanRangeParameters): Promise<Address> {
  const addresses = addressDiscoveryWithinBounds(bcc, {
    account,
    lowerBound,
    upperBound,
    type
  }, ChainSettings.mainnet)

  const transactions = await provider.queryTransactionsByAddress(addresses.map(a => a.address))

  if (transactions.length === 0) {
    return addresses[0]
  }

  // Group transactions by address, if they have outputs for that address, it means they have had a UTXO in the past.
  // The transactions are now guaranteed to be in address order, as they are grouped against the
  // address range
  const sortedAddressesWithTransactions: [Address, typeof transactions][] = addresses.map(address => {
    const transactionsByAddress = transactions.filter(transaction => {
      const transactionOutputAddresses = transaction.outputs.map(output => output.address)
      return transactionOutputAddresses.includes(address.address)
    })

    return [address, transactionsByAddress]
  })

  const reversedTransactions = sortedAddressesWithTransactions.reverse()
  const lastAddressWithTransactionsIndex = reversedTransactions.findIndex(([_address, transactions]) => {
    if (transactions.length > 0) {
      return true
    }
  })

  // If the first element in the scanned array (which is the reverse of the address range)
  // has transactions associated with it, then this range has been consumed
  if (lastAddressWithTransactionsIndex === 0) {
    return scanBip44AccountForAddressWithoutTransactions({
      bcc,
      provider,
      account,
      lowerBound: lowerBound + SCAN_GAP,
      upperBound: upperBound + SCAN_GAP,
      type
    })
  }

  return reversedTransactions[lastAddressWithTransactionsIndex - 1][0]
}
