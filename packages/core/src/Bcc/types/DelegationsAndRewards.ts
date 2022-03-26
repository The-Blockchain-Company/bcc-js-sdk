import { PoolId, Entropic } from '.';

/**
 * TODO: re-export Ogmios/DelegationsAndRewards type after it changes entropics to bigint;
 */
export interface DelegationsAndRewards {
  delegate?: PoolId;
  rewards?: Entropic;
}
