import { seed } from './utils/seed'
import { expect } from 'chai'
import BccSDK from '..'
import { mockProvider, seedMockProvider } from './utils/mock_provider'

describe('Example: Determine the balance for a PublicAccount, in Entropic', () => {
  let bcc: ReturnType<typeof BccSDK>
  beforeEach(() => {
    bcc = BccSDK()
  })

  it('returns a positive number for an account with UTXOs', async () => {
    seedMockProvider(seed.utxos, seed.transactions)

    const mnemonic = seed.accountMnemonics.account1
    const keyManager = bcc.InMemoryKeyManager({ mnemonic, password: '' })
    const publicAccount = await keyManager.publicParentKey()

    const balance = await bcc.connect(mockProvider).wallet({ publicParentKey: publicAccount }).balance()
    expect(balance).to.eql(200000 * 6)
  })

  it('returns 0 for a new account', async () => {
    seedMockProvider(seed.utxos, seed.transactions)

    const mnemonic = seed.accountMnemonics.account2
    const keyManager = bcc.InMemoryKeyManager({ mnemonic, password: '' })
    const publicAccount = await keyManager.publicParentKey()

    const balance = await bcc.connect(mockProvider).wallet({ publicParentKey: publicAccount }).balance()
    expect(balance).to.eql(0)
  })
})
