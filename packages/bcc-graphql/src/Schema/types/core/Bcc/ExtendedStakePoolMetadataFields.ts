import { Bcc } from '@bcc-sdk/core';
import { Directive, Field, ObjectType, registerEnumType } from 'type-graphql';

enum PoolStatus {
  active = 'active',
  retired = 'retired',
  offline = 'offline',
  experimental = 'experimental',
  private = 'private'
}

registerEnumType(PoolStatus, { name: 'PoolStatus' });

@ObjectType()
export class ITNVerification implements Bcc.ITNVerification {
  [k: string]: unknown;
  @Field()
  owner: string;
  @Field()
  witness: string;
}

@ObjectType()
export class PoolContactData implements Bcc.PoolContactData {
  [k: string]: unknown;
  @Field()
  primary: string;
  @Field({ nullable: true })
  email?: string;
  @Field({ nullable: true })
  facebook?: string;
  @Field({ nullable: true })
  github?: string;
  @Field({ nullable: true })
  feed?: string;
  @Field({ nullable: true })
  telegram?: string;
  @Field({ nullable: true })
  twitter?: string;
}

@ObjectType()
export class ThePoolsMediaAssets implements Bcc.ThePoolsMediaAssets {
  [k: string]: unknown;
  @Field()
  icon_png_64x64: string;
  @Field({ nullable: true })
  logo_png?: string;
  @Field({ nullable: true })
  logo_svg?: string;
  @Field({ nullable: true })
  color_fg?: string;
  @Field({ nullable: true })
  color_bg?: string;
}

@ObjectType()
export class ExtendedStakePoolMetadataFields implements Bcc.ExtendedStakePoolMetadataFields {
  [k: string]: unknown;
  @Directive('@id')
  @Field()
  id: string;
  @Field({ nullable: true })
  country?: string;
  @Field(() => PoolStatus, {
    nullable: true,
    description: 'active | retired | offline | experimental | private'
  })
  status?: Bcc.PoolStatus;
  @Field(() => PoolContactData, { nullable: true })
  contact?: Bcc.PoolContactData;
  @Field(() => ThePoolsMediaAssets, { nullable: true })
  media_assets?: Bcc.ThePoolsMediaAssets;
  @Field(() => ITNVerification, { nullable: true })
  itn?: Bcc.ITNVerification;
}
