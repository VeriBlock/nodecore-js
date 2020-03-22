// VeriBlock Blockchain Project
// Copyright 2017-2018 VeriBlock, Inc
// Copyright 2018-2020 Xenios SEZC
// All rights reserved.
// https://www.veriblock.org
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
// tslint:disable:no-any
import { serializeTransactionEffects } from './util';
import { sha256 } from './hash';
import { KeyPair, SHA256withECDSA } from './cryptography';
import BigNumber from 'bignumber.js';
import { signedTransactionT, ThrowReporter, transactionT } from './io';
import { AddressType, isValidStandardAddress } from './address';
import {
  Output,
  SignatureIndex,
  SignedTransaction,
  Transaction,
} from './types';
import { Decoder, Encoder } from 'io-ts';

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

const tryDeserialize = <T extends Decoder<{}, any>>(
  arg: {},
  schema: T
): any => {
  const c = schema.decode(arg);
  ThrowReporter.report(c);
  return c._tag !== 'Left' ? c.right : null;
};

const trySerialize = <T extends Encoder<any, {}>>(arg: {}, schema: T): {} => {
  return schema.encode(arg);
};

/// signed transaction
export const tryDeserializeSignedTransaction = (arg: {}): SignedTransaction => {
  return tryDeserialize(arg, signedTransactionT);
};
export const trySerializeSignedTransaction = (arg: SignedTransaction): any => {
  return trySerialize(arg, signedTransactionT);
};

/// transaction
export const tryDeserializeTransaction = (arg: {}): Transaction => {
  return tryDeserialize(arg, transactionT);
};
export const trySerializeTransaction = (arg: Transaction): any => {
  return trySerialize(arg, transactionT);
};
