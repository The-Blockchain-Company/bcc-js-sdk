/* eslint-disable no-fallthrough */
import { roundRobinRandomImprove } from '@bcc-sdk/cip2';
import { Bcc } from '@bcc-sdk/core';
import {
  BalanceTrackerEvent,
  createSingleAddressWallet,
  InMemoryTransactionTracker,
  InMemoryUtxoRepository,
  KeyManagement,
  SingleAddressWallet,
  SingleAddressWalletProps,
  Transaction,
  TransactionError,
  TransactionFailure,
  TransactionTracker,
  UtxoRepository,
  UtxoRepositoryEvent
} from '@bcc-sdk/wallet';
// Not testing with a real provider
import { providerStub } from '../mocks';

const walletProps: SingleAddressWalletProps = { name: 'some-wallet' };
const networkId = Bcc.NetworkId.mainnet;
const mnemonicWords = KeyManagement.util.generateMnemonicWords();
const password = 'your_password';

describe('integration/withdrawal', () => {
  let keyManager: KeyManagement.KeyManager;
  let txTracker: TransactionTracker;
  let utxoRepository: UtxoRepository;
  let wallet: SingleAddressWallet;

  beforeAll(async () => {
    keyManager = KeyManagement.createInMemoryKeyManager({ mnemonicWords, password, networkId });
    const provider = providerStub();
    const inputSelector = roundRobinRandomImprove();
    txTracker = new InMemoryTransactionTracker({ provider, pollInterval: 1 });
    utxoRepository = new InMemoryUtxoRepository({ provider, txTracker, inputSelector, keyManager });
    wallet = await createSingleAddressWallet(walletProps, {
      keyManager,
      provider,
      utxoRepository,
      txTracker
    });

    // Call this to sync available balance
    await utxoRepository.sync();
  });

  it('has balance', () => {
    expect(wallet.balance.total).toBeTruthy();
    expect(wallet.balance.available).toBeTruthy();
  });

  it('has events', () => {
    wallet.balance.on(BalanceTrackerEvent.Changed, ({ total, available }) => {
      expect(total).toBeTruthy();
      expect(available).toBeTruthy();
      // This is emitted after transaction is submitted and balance is locked before confirmation
      // And after UtxoRepository.sync()
    });
    utxoRepository.on(UtxoRepositoryEvent.OutOfSync, () => {
      // This is emitted when bcc-js-sdk calls sync() internally and it fails.
      // User should attempt to resync using utxoRepository.sync()
    });
  });

  it('can submit transaction', async () => {
    const certFactory = new Transaction.CertificateFactory(keyManager);

    const { body, hash } = await wallet.initializeTx({
      certificates: [certFactory.stakeKeyDeregistration()],
      withdrawals: [Transaction.withdrawal(keyManager, utxoRepository.availableRewards || 0n)],
      outputs: new Set() // In a real transaction you would probably want to have some outputs
    });
    // Calculated fee is returned by invoking body.fee()
    const tx = await wallet.signTx(body, hash);

    const { submitted, confirmed } = wallet.submitTx(tx);
    try {
      // Transaction is submitting. UTxO is locked.
      await submitted;
      // Transaction is successfully submitted, but not confirmed yet
      await confirmed;
    } catch (error) {
      if (error instanceof TransactionError) {
        switch (error.reason) {
          case TransactionFailure.InvalidTransaction:
          // Invalid transaction, probably no validity interval set
          case TransactionFailure.Timeout:
          // Transaction has expired and will not be confirmed. Therefore it's safe to spend the UTxO again.
          case TransactionFailure.FailedToSubmit:
          // Probably attempt to resubmit
          case TransactionFailure.CannotTrack:
          // Failed when attempting to track transaction confirmation.
          // Probably just attempt to track it again by calling txTracker.track(tx)
          case TransactionFailure.Unknown:
          // Most likely a bug in bcc-js-sdk
        }
      } else {
        // Most likely a bug in bcc-js-sdk
      }
    }
  });
});
