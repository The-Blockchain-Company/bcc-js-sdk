import { BigIntMath, Bcc, ProtocolParametersRequiredByWallet } from '@bcc-sdk/core';
import { InitializeTxProps } from './types';

/**
 * Implementation is the same as in CSL.get_implicit_input() and CSL.get_deposit().
 */
export const computeImplicitCoin = (
  { stakeKeyDeposit, poolDeposit }: ProtocolParametersRequiredByWallet,
  { certificates, withdrawals }: InitializeTxProps
): Bcc.ImplicitCoin => {
  const stakeKeyDepositBigint = stakeKeyDeposit && BigInt(stakeKeyDeposit);
  const poolDepositBigint = poolDeposit && BigInt(poolDeposit);
  const deposit = BigIntMath.sum(
    certificates?.map(
      (cert) =>
        (cert.as_stake_registration() && stakeKeyDepositBigint) ||
        (cert.as_pool_registration() && poolDepositBigint) ||
        0n
    ) || []
  );
  const withdrawalsTotal =
    (withdrawals && BigIntMath.sum(withdrawals.map(({ quantity }) => BigInt(quantity.to_str())))) || 0n;
  const reclaimTotal = BigIntMath.sum(
    certificates?.map(
      (cert) =>
        (cert.as_stake_deregistration() && stakeKeyDepositBigint) ||
        (cert.as_pool_retirement() && poolDepositBigint) ||
        0n
    ) || []
  );
  return {
    deposit,
    input: withdrawalsTotal + reclaimTotal
  };
};
