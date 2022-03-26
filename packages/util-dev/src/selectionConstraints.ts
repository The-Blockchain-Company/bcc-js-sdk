import { CSL } from '@bcc-sdk/core';
import { SelectionConstraints } from '@bcc-sdk/cip2';

export interface MockSelectionConstraints {
  minimumCoinQuantity: bigint;
  minimumCost: bigint;
  maxTokenBundleSize: number;
  selectionLimit: number;
}

export const MOCK_NO_CONSTRAINTS: MockSelectionConstraints = {
  minimumCoinQuantity: 0n,
  maxTokenBundleSize: Number.POSITIVE_INFINITY,
  minimumCost: 0n,
  selectionLimit: Number.POSITIVE_INFINITY
};

export const mockConstraintsToConstraints = (constraints: MockSelectionConstraints): SelectionConstraints => ({
  computeMinimumCoinQuantity: () => constraints.minimumCoinQuantity,
  computeMinimumCost: async () => constraints.minimumCost,
  computeSelectionLimit: async () => constraints.selectionLimit,
  tokenBundleSizeExceedsLimit: (multiasset?: CSL.MultiAsset) =>
    (multiasset?.len() || 0) > constraints.maxTokenBundleSize
});

export const NO_CONSTRAINTS = mockConstraintsToConstraints(MOCK_NO_CONSTRAINTS);
