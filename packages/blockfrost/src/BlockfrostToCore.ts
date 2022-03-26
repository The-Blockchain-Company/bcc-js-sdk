import { Responses } from '@blockfrost/blockfrost-js';
import { Bcc, ProtocolParametersRequiredByWallet } from '@bcc-sdk/core';

type Unpacked<T> = T extends (infer U)[] ? U : T;
type BlockfrostAddressUtxoContent = Responses['address_utxo_content'];
type BlockfrostInputs = Responses['tx_content_utxo']['inputs'];
type BlockfrostInput = Pick<Unpacked<BlockfrostInputs>, 'address' | 'amount' | 'output_index' | 'tx_hash'>;
type BlockfrostOutputs = Responses['tx_content_utxo']['outputs'];
type BlockfrostOutput = Unpacked<BlockfrostOutputs>;
type BlockfrostUtxo = Unpacked<BlockfrostAddressUtxoContent>;

export const BlockfrostToCore = {
  addressUtxoContent: (address: string, blockfrost: Responses['address_utxo_content']): Bcc.Utxo[] =>
    blockfrost.map((utxo) => [
      BlockfrostToCore.txIn(BlockfrostToCore.inputFromUtxo(address, utxo)),
      BlockfrostToCore.txOut(BlockfrostToCore.outputFromUtxo(address, utxo))
    ]) as Bcc.Utxo[],
  // without `as OgmiosSchema.Utxo` above TS thinks the return value is (OgmiosSchema.TxIn | OgmiosSchema.TxOut)[][]

  transactionUtxos: (utxoResponse: Responses['tx_content_utxo']) => ({
    inputs: utxoResponse.inputs.map((input) => ({
      ...BlockfrostToCore.txIn(input),
      address: input.address
    })),
    outputs: utxoResponse.outputs.map(BlockfrostToCore.txOut)
  }),
  blockToTip: (block: Responses['block_content']): Bcc.Tip => ({
    blockNo: block.height!,
    hash: block.hash,
    slot: block.slot!
  }),

  inputFromUtxo: (address: string, utxo: BlockfrostUtxo): BlockfrostInput => ({
    address,
    amount: utxo.amount,
    output_index: utxo.output_index,
    tx_hash: utxo.tx_hash
  }),

  inputs: (inputs: BlockfrostInputs): Bcc.TxIn[] => inputs.map((input) => BlockfrostToCore.txIn(input)),

  outputFromUtxo: (address: string, utxo: BlockfrostUtxo): BlockfrostOutput => ({
    address,
    amount: utxo.amount
  }),

  outputs: (outputs: BlockfrostOutputs): Bcc.TxOut[] => outputs.map((output) => BlockfrostToCore.txOut(output)),

  txContentUtxo: (blockfrost: Responses['tx_content_utxo']) => ({
    inputs: BlockfrostToCore.inputs(blockfrost.inputs),
    outputs: BlockfrostToCore.outputs(blockfrost.outputs),
    hash: blockfrost.hash
  }),

  txIn: (blockfrost: BlockfrostInput): Bcc.TxIn => ({
    txId: blockfrost.tx_hash,
    index: blockfrost.output_index,
    address: blockfrost.address
  }),

  txOut: (blockfrost: BlockfrostOutput): Bcc.TxOut => {
    const assets: Bcc.Value['assets'] = {};
    for (const amount of blockfrost.amount) {
      if (amount.unit === 'entropic') continue;
      assets[amount.unit] = BigInt(amount.quantity);
    }
    return {
      address: blockfrost.address,
      value: {
        coins: BigInt(blockfrost.amount.find(({ unit }) => unit === 'entropic')!.quantity),
        assets
      }
    };
  },

  currentWalletProtocolParameters: (
    blockfrost: Responses['epoch_param_content']
  ): ProtocolParametersRequiredByWallet => ({
    maxTxSize: Number(blockfrost.max_tx_size),
    minFeeCoefficient: blockfrost.min_fee_a,
    minFeeConstant: blockfrost.min_fee_b,
    stakeKeyDeposit: Number(blockfrost.key_deposit),
    poolDeposit: Number(blockfrost.pool_deposit),
    minPoolCost: Number(blockfrost.min_pool_cost),
    coinsPerUtxoWord: Number(blockfrost.coins_per_utxo_word),
    maxValueSize: Number(blockfrost.max_val_size),
    maxCollateralInputs: blockfrost.max_collateral_inputs || undefined,
    protocolVersion: { major: blockfrost.protocol_major_ver, minor: blockfrost.protocol_minor_ver }
  })
};
