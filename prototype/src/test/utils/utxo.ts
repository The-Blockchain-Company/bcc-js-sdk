import { AddressType } from '../../Wallet'
import { hexGenerator } from '.'
import { addressDiscoveryWithinBounds } from '../../Utils'
import { RustBcc } from '../../lib'
import { ChainSettings } from '../../Bcc'

export function generateTestUtxos ({ account, lowerBound, upperBound, type, value }: { account: string, lowerBound: number, upperBound: number, type: AddressType, value: string }) {
  const numberOfUtxos = upperBound - lowerBound
  return [...Array(numberOfUtxos)].map((_, index) => {
    const address = addressDiscoveryWithinBounds(RustBcc, {
      account,
      type,
      lowerBound: index + lowerBound,
      upperBound: index + lowerBound
    }, ChainSettings.mainnet)[0].address

    return { value, address, id: hexGenerator(64), index }
  })
}
