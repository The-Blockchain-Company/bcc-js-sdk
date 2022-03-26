/* eslint-disable no-use-before-define */
import { Bcc } from '@bcc-sdk/core';
import { createUnionType, Directive, Field, Float, Int, ObjectType } from 'type-graphql';
import { BigIntsAsStrings, coinDescription, percentageDescription } from '../../util';
import { ExtendedStakePoolMetadataFields } from './ExtendedStakePoolMetadataFields';

//  This is not in ./ExtendedStakePoolMetadata to avoid circular import
@ObjectType()
export class ExtendedStakePoolMetadata implements Bcc.ExtendedStakePoolMetadata {
  [k: string]: unknown;
  @Field(() => Int)
  serial: number;
  @Field(() => ExtendedStakePoolMetadataFields)
  pool: Bcc.ExtendedStakePoolMetadataFields;
  @Field(() => StakePoolMetadata)
  metadata: Bcc.StakePoolMetadata;
}

@ObjectType()
export class StakePoolMetricsStake implements BigIntsAsStrings<Bcc.StakePoolMetricsStake> {
  @Field({ description: coinDescription })
  live: string;
  @Field({ description: coinDescription })
  active: string;
}

@ObjectType()
export class StakePoolMetricsSize implements Bcc.StakePoolMetricsSize {
  @Field({ description: percentageDescription })
  live: number;
  @Field({ description: percentageDescription })
  // @Field()
  active: number;
}

@ObjectType()
export class StakePoolMetrics implements BigIntsAsStrings<Bcc.StakePoolMetrics> {
  @Field(() => Int)
  blocksCreated: number;
  @Field({ description: coinDescription })
  livePledge: string;
  @Field(() => StakePoolMetricsStake)
  stake: BigIntsAsStrings<Bcc.StakePoolMetricsStake>;
  @Field(() => StakePoolMetricsSize)
  size: Bcc.StakePoolMetricsSize;
  @Field(() => Float)
  saturation: number;
  @Field(() => Int)
  delegators: number;
}

@ObjectType()
export class StakePoolTransactions implements Bcc.StakePoolTransactions {
  @Field(() => [String])
  registration: string[];
  @Field(() => [String])
  retirement: string[];
}

@ObjectType()
export class StakePoolMetadataJson implements Bcc.PoolMetadata {
  @Field()
  hash: string;
  @Field()
  url: string;
}

@ObjectType()
export class RelayByName implements Bcc.ByName {
  @Field()
  hostname: string;
  @Field(() => Int, { nullable: true })
  port: number;
}

@ObjectType()
export class RelayByAddress implements Bcc.ByAddress {
  @Field(() => String, { nullable: true })
  ipv4?: string;
  @Field(() => String, { nullable: true })
  ipv6?: string;
  @Field(() => Int, { nullable: true })
  port?: number;
}

const Relay = createUnionType({
  name: 'SearchResult', // the name of the GraphQL union
  types: () => [RelayByName, RelayByAddress] as const, // function that returns tuple of object types classes,
  resolveType: (value) => ('hostname' in value ? RelayByName : RelayByAddress)
});

@ObjectType()
export class StakePoolMetadata implements Bcc.StakePoolMetadata {
  @Directive('@id')
  @Field()
  stakePoolId: string;
  // eslint-disable-next-line sonarjs/no-duplicate-string
  @Directive('@search(by: [fulltext])')
  @Field()
  ticker: string;
  @Directive('@search(by: [fulltext])')
  @Field()
  name: string;
  @Field()
  description: string;
  @Field()
  homepage: string;
  @Field({ nullable: true })
  extDataUrl?: string;
  @Field({ nullable: true })
  extSigUrl?: string;
  @Field({ nullable: true })
  extVkey?: string;
  @Field(() => ExtendedStakePoolMetadata, { nullable: true })
  @Directive('@hasInverse(field: metadata)')
  ext?: Bcc.ExtendedStakePoolMetadata;
  @Field(() => StakePool)
  stakePool: Bcc.StakePool;
}

@ObjectType()
export class StakePool implements BigIntsAsStrings<Bcc.StakePool> {
  @Directive('@search(by: [fulltext])')
  @Directive('@id')
  @Field()
  id: string;
  @Field()
  hexId: string;
  @Field({ description: coinDescription })
  pledge: string;
  @Field({ description: coinDescription })
  cost: string;
  @Field(() => Float)
  margin: number;
  @Field(() => StakePoolMetrics)
  metrics: BigIntsAsStrings<Bcc.StakePoolMetrics>;
  @Field(() => StakePoolTransactions)
  transactions: Bcc.StakePoolTransactions;
  @Field(() => StakePoolMetadataJson, { nullable: true })
  metadataJson?: Bcc.PoolMetadata;
  @Directive('@hasInverse(field: stakePool)')
  @Field(() => StakePoolMetadata, { nullable: true })
  metadata?: BigIntsAsStrings<Bcc.StakePoolMetadata>;
  @Field(() => [String])
  owners: string[];
  @Field()
  vrf: string;
  @Field(() => [Relay])
  relays: Bcc.Relay[];
  @Field()
  rewardAccount: string;
}
