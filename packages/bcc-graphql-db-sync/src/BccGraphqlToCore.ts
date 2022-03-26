import { ProtocolParametersRequiredByWallet, Bcc, NotImplementedError } from '@bcc-sdk/core';
import { Block } from '@bcc-graphql/client-ts';

type GraphqlTransaction = {
  hash: Bcc.Hash16;
  inputs: { txHash: Bcc.Hash16; sourceTxIndex: number; address: Bcc.Address }[];
  outputs: {
    address: Bcc.Address;
    value: string;
    tokens: { asset: { assetId: string }; quantity: string }[];
  }[];
};

export type GraphqlCurrentWalletProtocolParameters = {
  coinsPerUtxoWord: number;
  maxValSize: string;
  keyDeposit: number;
  maxCollateralInputs: number;
  maxTxSize: number;
  minFeeA: number;
  minFeeB: number;
  minPoolCost: number;
  poolDeposit: number;
  protocolVersion: {
    major: number;
    minor: number;
  };
};

export type BccGraphQlTip = Pick<Block, 'hash' | 'number' | 'slotNo'>;

export type BccGraphqlTxIn = { txHash: Bcc.Hash16; sourceTxIndex: number; address: Bcc.Address };
export type TransactionsResponse = {
  transactions: {
    hash: Bcc.Hash16;
    inputs: BccGraphqlTxIn[];
    outputs: {
      address: Bcc.Address;
      value: string;
      tokens: { asset: { assetId: string }; quantity: string }[];
    }[];
  }[];
};

const txIn = ({ sourceTxIndex, txHash, address }: GraphqlTransaction['inputs'][0]): Bcc.TxIn => ({
  txId: txHash,
  index: sourceTxIndex,
  address
});

const txOut = ({ address, tokens, value }: GraphqlTransaction['outputs'][0]) => {
  const assets: Bcc.Value['assets'] = {};
  for (const token of tokens) assets[token.asset.assetId] = BigInt(token.quantity);
  return { address, value: { coins: BigInt(value), assets } };
};

export const BccGraphqlToCore = {
  txIn,
  txOut,

  graphqlTransactionsToBccTxs: (_transactions: TransactionsResponse): Bcc.TxAurum[] => {
    // transactions.map((tx) => ({
    //   inputs: tx.inputs.map(txIn),
    //   outputs: tx.outputs.map(txOut),
    //   hash: tx.hash
    // })),
    throw new NotImplementedError('Need to query more data to support this');
  },

  currentWalletProtocolParameters: (
    params: GraphqlCurrentWalletProtocolParameters
  ): ProtocolParametersRequiredByWallet => ({
    ...params,
    maxValueSize: Number(params.maxValSize),
    stakeKeyDeposit: params.keyDeposit,
    maxTxSize: params.maxTxSize,
    minFeeCoefficient: params.minFeeA,
    minFeeConstant: params.minFeeB
  }),

  tip: (tip: BccGraphQlTip): Bcc.Tip => ({
    blockNo: tip.number!,
    hash: tip.hash,
    slot: tip.slotNo!
  })
};
