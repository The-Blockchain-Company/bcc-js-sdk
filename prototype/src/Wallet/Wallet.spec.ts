import { expect } from 'chai'
import { Bcc } from '../Bcc'
import { ProviderType, BccProvider, WalletProvider } from '../Provider'
import { Wallet } from './Wallet'
import { InvalidWalletArguments } from './errors'

describe('Wallet', () => {
  it('throws if a publicParentKey is not provided when interfacing with a bcc provider', () => {
    const bcc = {} as Bcc
    const bccProvider = {
      type: ProviderType.bcc
    } as BccProvider

    const call = () => Wallet(bcc, bccProvider)({ walletId: 'x' })
    expect(call).to.throw(InvalidWalletArguments)
  })

  it('throws if a walletId is not provided when interfacing with a wallet provider', () => {
    const bcc = {} as Bcc
    const walletProvider = {
      type: ProviderType.wallet
    } as WalletProvider

    const call = () => Wallet(bcc, walletProvider)({ publicParentKey: 'x' })
    expect(call).to.throw(InvalidWalletArguments)
  })
})
