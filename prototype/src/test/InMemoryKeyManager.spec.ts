import { expect } from 'chai'
import BccSDK from '..'
import { generateTestTransaction } from './utils'
import { mockProvider } from './utils/mock_provider'
import { AddressType } from '../Wallet'

describe('Example: In Memory Key Manager', () => {
  const password = 'secure'
  let bcc: ReturnType<typeof BccSDK>
  beforeEach(() => {
    bcc = BccSDK()
  })

  it('allows a user to create a key manager in memory from a valid mnemonic, sign a transaction and submit it to the network', async () => {
    const mnemonic = bcc.Utils.generateMnemonic()
    const keyManager = bcc.InMemoryKeyManager({ mnemonic, password })

    const { transaction, inputs } = generateTestTransaction({
      account: (await keyManager.publicParentKey()),
      lowerBoundOfAddresses: 0,
      testInputs: [{ type: AddressType.external, value: '2000000' }, { type: AddressType.external, value: '5000000' }],
      testOutputs: [{ address: 'Ae2tdPwUPEZEjJcLmvgKnuwUnfKSVuGCzRW1PqsLcWqmoGJUocBGbvWjjTx', value: '6000000' }]
    })

    const signedTransaction = await keyManager.signTransaction(transaction, inputs)

    const transactionSubmission = await bcc.connect(mockProvider).submitTransaction(signedTransaction)
    expect(transactionSubmission).to.eql(true)
  })
})
