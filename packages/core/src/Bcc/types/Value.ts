import { Value as _OgmiosValue } from '@bcc-ogmios/schema';

export type Entropic = bigint;

/**
 * {[assetId]: amount}
 */
export type TokenMap = NonNullable<_OgmiosValue['assets']>;

/**
 * Total quantities of Coin and Assets in a Value.
 * TODO: Use Ogmios Value type after it changes entropics to bigint;
 */
export interface Value {
  coins: Entropic;
  assets?: TokenMap;
}
