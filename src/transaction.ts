// VeriBlock Blockchain Project
// Copyright 2017-2018 VeriBlock, Inc
// Copyright 2018-2019 Xenios SEZC
// All rights reserved.
// https://www.veriblock.org
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
// tslint:disable:no-any
import { serializeTransactionEffects } from './util';
import { sha256 } from './hash';
import { KeyPair, SHA256withECDSA } from './crypto';
import * as t from 'io-ts';

import BigNumber from 'bignumber.js';
import {
  addressT,
  amountT,
  byteT,
  dataT,
  outputT,
  signatureIndexT,
  signedTransactionT,
  ThrowReporter,
  transactionT,
} from './io';
import { isValidStandardAddress } from './address';

// tslint:disable-next-line:variable-name
// const JSONbig = require('json-bigint')({ strict: true, storeAsString: false });

export enum AddressType {
  ZERO_UNUSED = 0,
  STANDARD = 1,
  PROOF_OF_PROOF = 2,
  MULTISIG = 3,
}

export type Address = t.TypeOf<typeof addressT>;
export type Amount = t.TypeOf<typeof amountT>;
export type Data = t.TypeOf<typeof dataT>;
export type Byte = t.TypeOf<typeof byteT>;
export type SignatureIndex = t.TypeOf<typeof signatureIndexT>;
export type Output = t.TypeOf<typeof outputT>;
export type Transaction = t.TypeOf<typeof transactionT>;
export type SignedTransaction = t.TypeOf<typeof signedTransactionT>;

export const getTransactionId = (
  tx: Transaction,
  signatureIndex: SignatureIndex
): Buffer => {
  const ser = serializeTransactionEffects(tx, signatureIndex);
  return sha256(ser);
};

export const signTransaction = (
  transaction: Transaction,
  keyPair: KeyPair,
  signatureIndex: SignatureIndex
): SignedTransaction => {
  // set txId
  const id: Buffer = getTransactionId(transaction, signatureIndex);
  transaction.txId = id.toString('hex');

  // set tx data
  if (transaction.data === undefined) {
    transaction.data = '';
  }

  // set type
  if (isValidStandardAddress(transaction.sourceAddress)) {
    transaction.type = AddressType.STANDARD;
  } else {
    throw new Error('unsupported address type');
  }

  // set tx fee
  const total: BigNumber = transaction.outputs.reduce(
    (r: BigNumber, o: Output) => r.plus(o.amount),
    new BigNumber(0)
  );
  if (total.gt(transaction.sourceAmount)) {
    throw new Error("you're trying to spend more than you have");
  }
  transaction.transactionFee = transaction.sourceAmount.minus(total);

  // sign
  const signature = SHA256withECDSA.sign(id, keyPair);
  return {
    signature,
    publicKey: keyPair.publicKey,
    signatureIndex,
    transaction,
  };
};

const tryDeserialize = (arg: any, schema: any): any => {
  const c = schema.decode(arg);
  ThrowReporter.report(c);
  return c.right;
};

const trySerialize = (arg: any, schema: any): any => {
  return schema.encode(arg);
};

/// signed transaction
export const tryDeserializeSignedTransaction = (
  arg: any
): SignedTransaction => {
  return tryDeserialize(arg, signedTransactionT);
};
export const trySerializeSignedTransaction = (arg: SignedTransaction) => {
  return trySerialize(arg, signedTransactionT);
};

/// transaction
export const tryDeserializeTransaction = (arg: any): Transaction => {
  return tryDeserialize(arg, transactionT);
};
export const trySerializeTransaction = (arg: Transaction) => {
  return trySerialize(arg, transactionT);
};
