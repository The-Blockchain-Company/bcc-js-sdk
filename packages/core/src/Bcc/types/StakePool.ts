import { PoolParameters } from '@bcc-ogmios/schema';
import { Hash16, Entropic, PoolMetadata } from '.';
import { ExtendedStakePoolMetadata } from './ExtendedStakePoolMetadata';

/**
 * Within range [0; 1]
 */
export type Percent = number;

export type TransactionId = Hash16;

/**
 * https://github.com/the-blockchain-company/CIPs/blob/master/CIP-0006/CIP-0006.md#on-chain-referenced-main-metadata-file
 */
export interface Cip6MetadataFields {
  /**
   * A URL for extended metadata
   * 128 Characters Maximum, must be a valid URL
   */
  extDataUrl?: string;
  /**
   * A URL with the extended metadata signature
   * 128 Characters Maximum, must be a valid URL
   */
  extSigUrl?: string;
  /**
   * the public Key for verification
   * optional, 68 Characters
   */
  extVkey?: Hash16; // TODO: figure out if this is the correct type alias
}

export interface StakePoolMetadataFields {
  /**
   * Pool ticker. uppercase
   * 5 Characters Maximum, Uppercase letters and numbers
   */
  ticker: string;
  /**
   * A name for the pool
   * 50 Characters Maximum
   */
  name: string;
  /**
   * Text that describes the pool
   * 50 Characters Maximum
   */
  description: string;
  /**
   * A website URL for the pool
   * 64 Characters Maximum, must be a valid URL
   */
  homepage: string;
}

export type StakePoolMetadata = StakePoolMetadataFields &
  Cip6MetadataFields & {
    /**
     * Extended metadata defined by CIP-6
     */
    ext?: ExtendedStakePoolMetadata;
  };

export interface StakePoolMetricsStake {
  live: Entropic;
  active: Entropic;
}

export interface StakePoolMetricsSize {
  live: Percent;
  active: Percent;
}
export interface StakePoolMetrics {
  /**
   * Total blocks created by the pool
   */
  blocksCreated: number;
  livePledge: Entropic;
  /**
   * Stake quantity
   */
  stake: StakePoolMetricsStake;
  /**
   * Percentage of total stake
   */
  size: StakePoolMetricsSize;
  saturation: Percent;
  delegators: number;
}

export interface StakePoolTransactions {
  registration: TransactionId[];
  retirement: TransactionId[];
}

export interface ByAddress {
  ipv4?: string;
  ipv6?: string;
  port?: number;
}
export interface ByName {
  hostname: string;
  port?: number;
}

export type Relay = ByAddress | ByName;

// TODO: don't omit pledge and cost when Entropic becomes bigint
export interface StakePool extends Omit<PoolParameters, 'pledge' | 'cost' | 'margin' | 'metadata' | 'relays'> {
  /**
   * Stake pool ID as a hex string
   */
  hexId: Hash16;
  /**
   * Declared pledge quantity.
   */
  pledge: Entropic;
  /**
   * Fixed stake pool running cost
   */
  cost: Entropic;
  /**
   * Stake pool margin percentage
   */
  margin: Percent;
  /**
   * Stake pool metrics
   */
  metrics: StakePoolMetrics;
  /**
   * Stake pool relays
   */
  relays: Relay[];
  /**
   * Transactions provisioning the stake pool
   */
  transactions: StakePoolTransactions;
  metadataJson?: PoolMetadata;
  metadata?: StakePoolMetadata;
}
