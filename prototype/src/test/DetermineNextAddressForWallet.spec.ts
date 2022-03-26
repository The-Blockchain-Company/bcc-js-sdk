import { seed } from './utils/seed'
import { expect } from 'chai'
import BccSDK from '..'
import { mockProvider, seedMockProvider } from './utils/mock_provider'
import { AddressType } from '../Wallet'
import { addressDiscoveryWithinBounds } from '../Utils'
import { RustBcc } from '../lib'
import { ChainSettings } from '../Bcc'

describe('Example: Key Derivation', () => {
  let bcc: ReturnType<typeof BccSDK>
  beforeEach(() => {
    bcc = BccSDK()
  })

  it('allows a user to determine their next receipt address', async () => {
    seedMockProvider(seed.utxos, seed.transactions)

    const mnemonic = seed.accountMnemonics.account1
    const keyManager = bcc.InMemoryKeyManager({ mnemonic, password: '' })
    const publicAccount = await keyManager.publicParentKey()

    const { address } = await bcc.connect(mockProvider).wallet({ publicParentKey: publicAccount }).getNextReceivingAddress()
    const nextAddressBasedOnSeedContext = addressDiscoveryWithinBounds(RustBcc, {
      account: (await keyManager.publicParentKey()),
      lowerBound: 16,
      upperBound: 16,
      type: AddressType.external
    }, ChainSettings.mainnet)[0].address

    expect(nextAddressBasedOnSeedContext).to.eql(address)
  })

  it('allows a user to determine their next change address', async () => {
    seedMockProvider(seed.utxos, seed.transactions)

    const mnemonic = seed.accountMnemonics.account1
    const keyManager = bcc.InMemoryKeyManager({ mnemonic, password: '' })
    const publicAccount = await keyManager.publicParentKey()

    const { address } = await bcc.connect(mockProvider).wallet({ publicParentKey: publicAccount }).getNextChangeAddress()
    const nextAddressBasedOnSeedContext = addressDiscoveryWithinBounds(RustBcc, {
      account: publicAccount,
      lowerBound: 0,
      upperBound: 0,
      type: AddressType.internal
    }, ChainSettings.mainnet)[0].address

    expect(nextAddressBasedOnSeedContext).to.eql(address)
  })
})
