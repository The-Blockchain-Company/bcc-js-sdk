import { Hash16, Address } from '.';
import { TxIn as OgmiosTxIn } from '@bcc-ogmios/schema';
import { Value } from './Value';

export interface TxIn extends OgmiosTxIn {
  address: Address;
}

export interface TxOut {
  address: Address;
  value: Value;
  datum?: Hash16;
}

export type Utxo = [TxIn, TxOut];
