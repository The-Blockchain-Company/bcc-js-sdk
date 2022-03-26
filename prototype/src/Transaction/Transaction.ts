import { TransactionInput, TransactionInputCodec } from './TransactionInput'
import { TransactionOutput, TransactionOutputCodec } from './TransactionOutput'
import { validateCodec } from '../lib/validator'
import { FeeAlgorithm, Bcc } from '../Bcc'

export function Transaction (bcc: Bcc, inputs: TransactionInput[], outputs: TransactionOutput[], feeAlgorithm = FeeAlgorithm.default) {
  validateCodec<typeof TransactionInputCodec>(TransactionInputCodec, inputs)
  validateCodec<typeof TransactionOutputCodec>(TransactionOutputCodec, outputs)
  return bcc.buildTransaction(inputs, outputs, feeAlgorithm)
}
