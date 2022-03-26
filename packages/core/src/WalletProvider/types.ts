import { CSL, Bcc } from '..';

export type ProtocolParametersRequiredByWallet = Pick<
  Bcc.ProtocolParametersAurum,
  | 'coinsPerUtxoWord'
  | 'maxTxSize'
  | 'maxValueSize'
  | 'stakeKeyDeposit'
  | 'maxCollateralInputs'
  | 'minFeeCoefficient'
  | 'minFeeConstant'
  | 'minPoolCost'
  | 'poolDeposit'
  | 'protocolVersion'
>;

export type AssetSupply = {
  circulating: Bcc.Entropic;
  max: Bcc.Entropic;
  total: Bcc.Entropic;
};

export type StakeSummary = {
  active: Bcc.Entropic;
  live: Bcc.Entropic;
};

export type StakePoolStats = {
  qty: {
    active: number;
    retired: number;
    retiring: number;
  };
};

export type NetworkInfo = {
  currentEpoch: {
    number: Bcc.Epoch;
    start: {
      /** Local date */
      date: Date;
    };
    end: {
      /** Local date */
      date: Date;
    };
  };
  entropicSupply: AssetSupply;
  stake: StakeSummary;
};

export interface WalletProvider {
  ledgerTip: () => Promise<Bcc.Tip>;
  networkInfo: () => Promise<NetworkInfo>;
  // TODO: move stakePoolStats out to other provider type, since it's not required for wallet operation
  stakePoolStats?: () => Promise<StakePoolStats>;
  /** @param signedTransaction signed and serialized cbor */
  submitTx: (signedTransaction: CSL.Transaction) => Promise<void>;
  // TODO: split utxoDelegationAndRewards this into 2 or 3 functions
  utxoDelegationAndRewards: (
    addresses: Bcc.Address[],
    stakeKeyHash: Bcc.Hash16
  ) => Promise<{ utxo: Bcc.Utxo[]; delegationAndRewards: Bcc.DelegationsAndRewards }>;
  /**
   * TODO: add an optional 'since: Slot' argument for querying transactions and utxos.
   * When doing so we need to also consider how best we can use the volatile block range of the chain
   * to minimise over-fetching and assist the application in handling rollback scenarios.
   */
  queryTransactionsByAddresses: (addresses: Bcc.Address[]) => Promise<Bcc.TxAurum[]>;
  queryTransactionsByHashes: (hashes: Bcc.Hash16[]) => Promise<Bcc.TxAurum[]>;
  currentWalletProtocolParameters: () => Promise<ProtocolParametersRequiredByWallet>;
}
