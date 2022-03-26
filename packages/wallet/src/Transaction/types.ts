import { CSL, Bcc } from '@bcc-sdk/core';
import { Withdrawal } from './withdrawal';

export type InitializeTxProps = {
  outputs: Set<Bcc.TxOut>;
  certificates?: CSL.Certificate[];
  withdrawals?: Withdrawal[];
  options?: {
    validityInterval?: Bcc.ValidityInterval;
  };
};
