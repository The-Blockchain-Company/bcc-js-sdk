import { MockUtxoRepository } from './mocks';
import { BalanceTracker, UtxoRepositoryEvent, UtxoRepositoryFields } from '../src';
import { Bcc } from '@bcc-sdk/core';

const numAssets = (tokenMap?: Bcc.TokenMap) => Object.keys(tokenMap || {}).length;

describe('BalanceTracker', () => {
  let balanceTracker: BalanceTracker;
  let utxoRepository: MockUtxoRepository;

  beforeEach(() => {
    utxoRepository = new MockUtxoRepository();
    balanceTracker = new BalanceTracker(utxoRepository);
  });

  it('constructor sets balances from utxo repository', () => {
    expect(balanceTracker.total.coins).toBeGreaterThan(0n);
    expect(balanceTracker.total.assets).toBeTruthy();
    expect(balanceTracker.total.rewards).toBeGreaterThan(0n);
  });

  it('updates balances on UtxoRepositoryEvent.Changed', async () => {
    const totalBefore = balanceTracker.total;

    const allRewards = utxoRepository.allRewards - 1n;
    const availableRewards = utxoRepository.allRewards - 2n;
    await utxoRepository.emit(UtxoRepositoryEvent.Changed, {
      allUtxos: utxoRepository.allUtxos.slice(1),
      availableUtxos: utxoRepository.allUtxos.slice(2),
      allRewards,
      availableRewards,
      delegation: null
    } as UtxoRepositoryFields);

    expect(balanceTracker.total.coins).toBeLessThan(totalBefore.coins);
    expect(balanceTracker.total.coins).toBeGreaterThan(balanceTracker.available.coins);

    expect(numAssets(balanceTracker.total.assets)).toBeLessThan(numAssets(totalBefore.assets));
    expect(numAssets(balanceTracker.total.assets)).toBeGreaterThan(numAssets(balanceTracker.available.assets));

    expect(balanceTracker.total.rewards).toBe(allRewards);
    expect(balanceTracker.available.rewards).toBe(availableRewards);
  });
});
