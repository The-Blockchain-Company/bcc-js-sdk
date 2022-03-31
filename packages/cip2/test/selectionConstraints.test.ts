/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable no-loop-func */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unicorn/consistent-function-scoping */
import { InvalidProtocolParametersError, CSL, coreToCsl } from '@bcc-sdk/core';
import { AssetId } from '@bcc-sdk/util-dev';
import { defaultSelectionConstraints, DefaultSelectionConstraintsProps } from '../src/selectionConstraints';
import { ProtocolParametersForInputSelection, SelectionSkeleton } from '../src/types';

jest.mock('@theblockchaincompanyio/bcc-serialization-lib-nodejs', () => {
  const actualCsl = jest.requireActual('@theblockchaincompanyio/bcc-serialization-lib-nodejs');
  return {
    ...actualCsl,
    min_fee: jest.fn(),
    Value: {
      new: jest.fn()
    }
  };
});
const cslActual = jest.requireActual('@theblockchaincompanyio/bcc-serialization-lib-nodejs');
const cslMock = jest.requireMock('@theblockchaincompanyio/bcc-serialization-lib-nodejs');

describe('defaultSelectionConstraints', () => {
  const protocolParameters = {
    minFeeCoefficient: 44,
    minFeeConstant: 155_381,
    coinsPerUtxoWord: 34_482,
    maxTxSize: 16_384,
    maxValueSize: 5000
  } as ProtocolParametersForInputSelection;

  it('Invalid parameters', () => {
    for (const param of ['minFeeCoefficient', 'minFeeConstant', 'coinsPerUtxoWord', 'maxTxSize', 'maxValueSize']) {
      expect(() =>
        defaultSelectionConstraints({
          protocolParameters: { ...protocolParameters, [param]: null }
        } as DefaultSelectionConstraintsProps)
      ).toThrowError(InvalidProtocolParametersError);
    }
  });

  it('computeMinimumCost', async () => {
    const fee = 200_000n;
    // Need this to not have to build Tx
    cslMock.min_fee.mockReturnValueOnce(cslMock.BigNum.from_str(fee.toString()));
    const buildTx = jest.fn();
    const selectionSkeleton = {} as SelectionSkeleton;
    const constraints = defaultSelectionConstraints({
      protocolParameters,
      buildTx
    });
    const result = await constraints.computeMinimumCost(selectionSkeleton);
    expect(result).toEqual(fee);
    expect(buildTx).toBeCalledTimes(1);
    expect(buildTx).toBeCalledWith(selectionSkeleton);
  });

  it('computeMinimumCoinQuantity', () => {
    cslMock.Value.new.mockImplementation(cslActual.Value.new);
    const withAssets = coreToCsl
      .value({
        coins: 10_000n,
        assets: {
          [AssetId.TSLA]: 5000n,
          [AssetId.PXL]: 3000n
        }
      })
      .multiasset();
    const constraints = defaultSelectionConstraints({
      protocolParameters
    } as DefaultSelectionConstraintsProps);
    const minCoinWithAssets = constraints.computeMinimumCoinQuantity(withAssets);
    const minCoinWithoutAssets = constraints.computeMinimumCoinQuantity();
    expect(typeof minCoinWithAssets).toBe('bigint');
    expect(typeof minCoinWithoutAssets).toBe('bigint');
    expect(minCoinWithAssets).toBeGreaterThan(minCoinWithoutAssets);
  });

  describe('computeSelectionLimit', () => {
    const buildTxOfLength = (length: number) => async () => ({ to_bytes: () => ({ length }) } as CSL.Transaction);

    it("doesn't exceed max tx size", async () => {
      const constraints = defaultSelectionConstraints({
        protocolParameters,
        buildTx: buildTxOfLength(protocolParameters.maxTxSize!)
      });
      expect(await constraints.computeSelectionLimit({ inputs: new Set([1, 2]) as any } as SelectionSkeleton)).toEqual(
        2
      );
    });

    it('exceeds max tx size', async () => {
      const constraints = defaultSelectionConstraints({
        protocolParameters,
        buildTx: buildTxOfLength(protocolParameters.maxTxSize! + 1)
      });
      expect(await constraints.computeSelectionLimit({ inputs: new Set([1, 2]) as any } as SelectionSkeleton)).toEqual(
        3
      );
    });
  });

  describe('tokenBundleSizeExceedsLimit', () => {
    const stubCslValueLength = (length: number) => {
      cslMock.Value.new.mockReturnValue({
        set_multiasset: jest.fn(),
        to_bytes: () => ({ length })
      });
    };

    it('empty bundle', () => {
      const constraints = defaultSelectionConstraints({
        protocolParameters,
        buildTx: jest.fn()
      });
      expect(constraints.tokenBundleSizeExceedsLimit()).toBe(false);
    });

    it("doesn't exceed max value size", () => {
      stubCslValueLength(protocolParameters.maxValueSize!);
      const constraints = defaultSelectionConstraints({
        protocolParameters
      } as DefaultSelectionConstraintsProps);
      expect(constraints.tokenBundleSizeExceedsLimit({} as any)).toBe(false);
    });

    it('exceeds max value size', () => {
      stubCslValueLength(protocolParameters.maxValueSize! + 1);
      const constraints = defaultSelectionConstraints({
        protocolParameters
      } as DefaultSelectionConstraintsProps);
      expect(constraints.tokenBundleSizeExceedsLimit({} as any)).toBe(true);
    });
  });
});
