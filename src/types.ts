import * as t from 'io-ts';
import {
  addressT,
  amountT,
  byteT,
  dataT,
  nodecoreKeypairT,
  outputT,
  signatureIndexT,
  signedTransactionT,
  transactionT,
} from './io';

export type Address = t.TypeOf<typeof addressT>;
export type Amount = t.TypeOf<typeof amountT>;
export type Data = t.TypeOf<typeof dataT>;
export type Byte = t.TypeOf<typeof byteT>;
export type SignatureIndex = t.TypeOf<typeof signatureIndexT>;
export type Output = t.TypeOf<typeof outputT>;
export type Transaction = t.TypeOf<typeof transactionT>;
export type SignedTransaction = t.TypeOf<typeof signedTransactionT>;
export type NodecoreKeypair = t.TypeOf<typeof nodecoreKeypairT>;
