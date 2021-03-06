import { AddressType } from '../Wallet'
import { Bcc, ChainSettings } from '../Bcc'

export interface AddressDiscoveryArgs {
  type: AddressType
  account: string
  lowerBound: number
  upperBound: number
  accountIndex?: number
}

/** BIP44 specifies that discovery should occur for an address type in batches of 20, until no balances exist */
export function addressDiscoveryWithinBounds (
  bcc: Bcc,
  { type, account, lowerBound, upperBound, accountIndex }: AddressDiscoveryArgs,
  chainSettings: ChainSettings
) {
  if (!accountIndex) {
    accountIndex = 0
  }

  const addressIndices = Array(upperBound - lowerBound + 1)
    .fill(0)
    .map((_, idx) => lowerBound + idx)

  return addressIndices.map(index => bcc.address({ publicParentKey: account, index, type, accountIndex }, chainSettings))
}
