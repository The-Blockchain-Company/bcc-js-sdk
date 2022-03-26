import { SelectionConstraints, SelectionResult } from '@bcc-sdk/cip2';
import { Bcc, CSL } from '@bcc-sdk/core';
import Emittery from 'emittery';

export enum UtxoRepositoryEvent {
  Changed = 'changed',
  OutOfSync = 'out-of-sync'
}

export interface UtxoRepositoryFields {
  allUtxos: Bcc.Utxo[];
  availableUtxos: Bcc.Utxo[];
  allRewards: Bcc.Entropic | null;
  availableRewards: Bcc.Entropic | null;
  delegation: Bcc.PoolId | null;
}

export type UtxoRepositoryEvents = {
  changed: UtxoRepositoryFields;
  'out-of-sync': void;
  'transaction-untracked': CSL.Transaction;
};
export type UtxoRepository = {
  sync: () => Promise<void>;
  selectInputs: (
    outputs: Set<CSL.TransactionOutput>,
    constraints: SelectionConstraints,
    implicitCoin?: Bcc.ImplicitCoin
  ) => Promise<SelectionResult>;
} & UtxoRepositoryFields &
  Emittery<UtxoRepositoryEvents>;

export interface OnTransactionArgs {
  transaction: CSL.Transaction;
  /**
   * Resolves when transaction is confirmed.
   * Rejects if transaction fails to submit or validate.
   */
  confirmed: Promise<void>;
}

export enum TransactionTrackerEvent {
  NewTransaction = 'new-transaction'
}

export type TransactionTrackerEvents = { 'new-transaction': OnTransactionArgs };
export interface TransactionTracker extends Emittery<TransactionTrackerEvents> {
  /**
   * Track a new transaction.
   *
   * @param {CSL.Transaction} transaction transaction to track.
   * @param {Promise<void>} submitted defer checking for transaction confirmation until this resolves.
   */
  track(transaction: CSL.Transaction, submitted?: Promise<void>): Promise<void>;
}
