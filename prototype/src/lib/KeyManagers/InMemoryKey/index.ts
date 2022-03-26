import { validateMnemonic } from 'bip39'
import { KeyManager, InvalidMnemonic } from '../../../KeyManager'
import { ChainSettings, Bcc } from '../../../Bcc'

export function InMemoryKeyManager (
  bcc: Bcc,
  { password, accountIndex, mnemonic }: {
    password: string
    accountIndex?: number
    mnemonic: string
  }): KeyManager {
  if (!accountIndex) {
    accountIndex = 0
  }

  const validMnemonic = validateMnemonic(mnemonic)
  if (!validMnemonic) throw new InvalidMnemonic()

  const { privateParentKey, publicParentKey } = bcc.account(mnemonic, password, accountIndex)

  return {
    signTransaction: async (transaction, rawInputs, chainSettings = ChainSettings.mainnet) => {
      rawInputs.forEach(({ addressing }) => {
        transaction.addWitness({ privateParentKey: privateParentKey, addressing, chainSettings })
      })

      return transaction.finalize()
    },
    signMessage: async (addressType, signingIndex, message) => {
      return bcc.signMessage({ privateParentKey: privateParentKey, addressType, signingIndex, message })
    },
    publicParentKey: async () => publicParentKey
  }
}
