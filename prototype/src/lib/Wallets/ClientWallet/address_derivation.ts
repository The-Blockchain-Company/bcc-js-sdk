import { AddressType } from '../../../Wallet'
import { BccProvider } from '../../../Provider'
import { getNextAddressByType } from './get_next_address'
import { SCAN_GAP } from './config'
import { addressDiscoveryWithinBounds } from '../../../Utils'
import { Bcc, ChainSettings } from '../../../Bcc'

export async function deriveAddressSet (bcc: Bcc, provider: BccProvider, account: string, chainSettings: ChainSettings) {
  const nextReceivingAddress = await getNextAddressByType(bcc, provider, account, AddressType.external)
  const nextChangeAddress = await getNextAddressByType(bcc, provider, account, AddressType.internal)

  const receiptAddresses = addressDiscoveryWithinBounds(bcc, {
    account,
    lowerBound: 0,
    upperBound: nextReceivingAddress.index + SCAN_GAP - 1,
    type: AddressType.external
  }, chainSettings)

  const changeAddresses = addressDiscoveryWithinBounds(bcc, {
    account,
    lowerBound: 0,
    upperBound: nextChangeAddress.index + SCAN_GAP - 1,
    type: AddressType.internal
  }, chainSettings)

  return receiptAddresses.concat(changeAddresses)
}
