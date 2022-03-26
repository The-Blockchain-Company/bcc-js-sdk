import * as Bcc from '.';
import { BlockAurum, BlockBodyAurum } from '@bcc-ogmios/schema';

type OgmiosHeader = NonNullable<BlockAurum['header']>;
export type PartialBlockHeader = Pick<OgmiosHeader, 'blockHeight' | 'slot' | 'blockHash'>;

export interface Withdrawal {
  address: Bcc.Address;
  quantity: Bcc.Entropic;
}

export enum CertificateType {
  StakeRegistration = 'StakeRegistration',
  StakeDeregistration = 'StakeDeregistration',
  PoolRegistration = 'PoolRegistration',
  PoolRetirement = 'PoolRetirement',
  StakeDelegation = 'StakeDelegation',
  MIR = 'MoveInstantaneousRewards',
  GenesisKeyDelegation = 'GenesisKeyDelegation'
}

export interface StakeAddressCertificate {
  type: CertificateType.StakeRegistration | CertificateType.StakeDeregistration;
  certIndex: number;
  address: Bcc.Address;
}

export interface PoolCertificate {
  type: CertificateType.PoolRegistration | CertificateType.PoolRetirement;
  certIndex: number;
  poolId: Bcc.PoolId;
  epoch: Bcc.Epoch;
}

export interface StakeDelegationCertificate {
  type: CertificateType.StakeDelegation;
  certIndex: number;
  delegationIndex: number;
  address: Bcc.Address;
  poolId: Bcc.PoolId;
  epoch: Bcc.Epoch;
}

export interface MirCertificate {
  type: CertificateType.MIR;
  certIndex: number;
  address: Bcc.Address;
  quantity: Bcc.Entropic;
  pot: 'reserve' | 'treasury';
}

export interface GenesisKeyDelegationCertificate {
  type: CertificateType.GenesisKeyDelegation;
  certIndex: number;
  genesisHash: Bcc.Hash16;
  genesisDelegateHash: Bcc.Hash16;
  vrfKeyHash: Bcc.Hash16;
}

export type Certificate =
  | StakeAddressCertificate
  | PoolCertificate
  | StakeDelegationCertificate
  | MirCertificate
  | GenesisKeyDelegationCertificate;

export interface TxBodyAurum {
  index: number;
  inputs: Bcc.TxIn[];
  collaterals?: Bcc.TxIn[];
  outputs: Bcc.TxOut[];
  fee: Bcc.Entropic;
  validityInterval: Bcc.ValidityInterval;
  withdrawals?: Withdrawal[];
  certificates?: Certificate[];
  mint?: Bcc.TokenMap;
  scriptIntegrityHash?: Bcc.Hash16;
  requiredExtraSignatures?: Bcc.Hash16[];
}

/**
 * Implicit coin quantities used in the transaction
 */
export interface ImplicitCoin {
  /**
   * Reward withdrawals + deposit reclaims
   */
  input?: Bcc.Entropic;
  /**
   * Delegation registration deposit
   */
  deposit?: Bcc.Entropic;
}

export interface Redeemer {
  index: number;
  purpose: 'spend' | 'mint' | 'certificate' | 'withdrawal';
  scriptHash: Bcc.Hash64;
  executionUnits: Bcc.ExUnits;
}

export type Witness = Omit<Partial<BlockBodyAurum['witness']>, 'redeemers'> & {
  redeemers?: Redeemer[];
};
export interface TxAurum {
  id: Bcc.Hash16;
  blockHeader: PartialBlockHeader;
  body: TxBodyAurum;
  implicitCoin: ImplicitCoin;
  txSize: number;
  witness: Witness;
  metadata?: Bcc.AuxiliaryData;
}

export enum TransactionStatus {
  Pending = 'pending',
  Confirmed = 'confirmed'
}

export interface SubmittedTransaction {
  tx: TxAurum;
  status: TransactionStatus;
}
