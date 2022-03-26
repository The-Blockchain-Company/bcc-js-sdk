import { Bcc, CSL } from '@bcc-sdk/core';
import { KeyManager } from '../KeyManagement';

export type Withdrawal = {
  address: CSL.RewardAddress;
  quantity: CSL.BigNum;
};

export const withdrawal = (
  keyManager: KeyManager,
  quantity: Bcc.Entropic,
  network: number = Bcc.NetworkId.mainnet
): Withdrawal => ({
  address: CSL.RewardAddress.new(network, CSL.StakeCredential.from_keyhash(keyManager.stakeKey.hash())),
  quantity: CSL.BigNum.from_str(quantity.toString())
});
