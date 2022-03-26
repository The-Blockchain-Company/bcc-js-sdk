import * as Ogmios from '@bcc-ogmios/schema';
import { util } from '../../util';

export {
  Address,
  Hash16,
  Hash64,
  Epoch,
  Tip,
  PoolMetadata,
  PoolId,
  Slot,
  ExUnits,
  AuxiliaryData
} from '@bcc-ogmios/schema';
export * from './StakePool';
export * from './ExtendedStakePoolMetadata';
export * from './Utxo';
export * from './Value';
export * from './DelegationsAndRewards';
export * from './Transaction';

export type ProtocolParametersAurum = util.OptionalUndefined<
  util.RecursivelyReplaceNullWithUndefined<Ogmios.ProtocolParametersAurum>
>;
export type ValidityInterval = util.OptionalUndefined<
  util.RecursivelyReplaceNullWithUndefined<Ogmios.ValidityInterval>
>;
