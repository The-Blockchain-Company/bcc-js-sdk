import { Bcc, FeeAlgorithm, ChainSettings } from '../../../Bcc'
import { BccProvider } from '../../../Provider'
import { getNextAddressByType } from './get_next_address'
import { deriveAddressSet } from './address_derivation'
import { AddressType, UtxoWithAddressing, WalletInstance, UnsupportedWalletOperation } from '../../../Wallet'
import { TransactionOutput } from '../../../Transaction'

export function ClientWallet (bcc: Bcc, bccProvider: BccProvider, account: string, chainSettings: ChainSettings): WalletInstance {
  return {
    getNextReceivingAddress: () => getNextAddressByType(bcc, bccProvider, account, AddressType.external),
    getNextChangeAddress: () => getNextAddressByType(bcc, bccProvider, account, AddressType.internal),
    balance: async () => {
      const addresses = await deriveAddressSet(bcc, bccProvider, account, chainSettings)
      const utxos = await bccProvider.queryUtxosByAddress(addresses.map(({ address }) => address))
      return utxos.reduce((accumulatedBalance, utxo) => accumulatedBalance + Number(utxo.value), 0)
    },
    transactions: async () => {
      const addresses = await deriveAddressSet(bcc, bccProvider, account, chainSettings)
      return bccProvider.queryTransactionsByAddress(addresses.map(({ address }) => address))
    },
    selectInputsForTransaction: async (paymentOutputs: TransactionOutput[], feeAlgorithm = FeeAlgorithm.default) => {
      const addresses = await deriveAddressSet(bcc, bccProvider, account, chainSettings)
      const utxos = await bccProvider.queryUtxosByAddress(addresses.map(({ address }) => address))
      const utxosMappedWithAddresses: UtxoWithAddressing[] = utxos.map(utxo => {
        const { index, type, accountIndex } = addresses.find(({ address }) => address === utxo.address)
        return {
          addressing: {
            index,
            change: type === AddressType.internal ? 1 : 0,
            accountIndex
          },
          ...utxo
        }
      })

      const nextChangeAddress = await getNextAddressByType(bcc, bccProvider, account, AddressType.internal)
      return bcc.inputSelection(paymentOutputs, utxosMappedWithAddresses, nextChangeAddress.address, feeAlgorithm)
    },
    createAndSignTransaction: () => {
      throw new UnsupportedWalletOperation(
        'client',
        'createAndSignTransaction',
        'Instead use the Transaction interface to build the transaction, and KeyManager to sign it.'
      )
    }
  }
}
