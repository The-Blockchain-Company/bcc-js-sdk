import { expect } from 'chai'
import BccSDK from '..'
import { AddressType } from '../Wallet'

describe('Example: Sign And Verify', () => {
  let bcc: ReturnType<typeof BccSDK>
  beforeEach(() => {
    bcc = BccSDK()
  })

  it('allows a user to sign a message that can be verified by others who have a reference to the public key', async () => {
    const mnemonic = bcc.Utils.generateMnemonic()
    const keyManager = bcc.InMemoryKeyManager({ mnemonic, password: '' })
    const message = 'hello world'
    const { signature, publicKey } = await keyManager.signMessage(AddressType.external, 0, message)

    expect(bcc.Utils.verifyMessage({
      publicKey,
      message,
      signature: signature
    })).to.eql(true)
  })
})
