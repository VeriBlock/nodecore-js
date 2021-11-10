// VeriBlock Blockchain Project
// Copyright 2017-2018 VeriBlock, Inc
// Copyright 2018-2021 Xenios SEZC
// All rights reserved.
// https://www.veriblock.org
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
// tslint:disable:no-any
import {
  serializeTransactionEffects,
  trimmedByteArrayFromNumber,
} from './util';
import { sha256 } from './hash';
import { KeyPair, SHA256withECDSA } from './cryptography';
import BigNumber from 'bignumber.js';
import {
  outputArrayT,
  signedTransactionT,
  ThrowReporter,
  transactionT,
} from './io';
import { AddressType, isValidStandardAddress } from './address';
import {
  Output,
  SignatureIndex,
  SignedTransaction,
  Transaction,
} from './types';
import { Decoder, Encoder } from 'io-ts';
import { DEFAULT_TRANSACTION_FEE } from './const';

export const getTransactionId = (
  tx: Transaction,
  signatureIndex: SignatureIndex,
  networkByte: number | undefined = undefined
): Buffer => {
  const ser = serializeTransactionEffects(tx, signatureIndex, networkByte);
  return sha256(ser);
};

export const signTransaction = (
  transaction: Transaction,
  keyPair: KeyPair,
  signatureIndex: SignatureIndex,
  networkByte: number | undefined = undefined
): SignedTransaction => {
  // set txIdTx
  const id: Buffer = getTransactionId(transaction, signatureIndex, networkByte);
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
/*eslint-disable */
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

/// transaction outputs
export const tryDeserializeTransactionOutputs = (arg: {}): Output[] => {
  return tryDeserialize(arg, outputArrayT);
};
export const trySerializeTransactionOutputs = (arg: Output[]): any => {
  return trySerialize(arg, outputArrayT);
};
/*eslint-enable */

export const getTransactionSize = (
  totalOutputAmount: BigNumber,
  transactionOutputs: Output[],
  signatureIndex: SignatureIndex,
  extraDataLength: number
) => {
  const inputAmountBytes = trimmedByteArrayFromNumber(totalOutputAmount);
  const sigIndexBytes = trimmedByteArrayFromNumber(
    new BigNumber(signatureIndex)
  );
  const dataLengthBytes = trimmedByteArrayFromNumber(
    new BigNumber(extraDataLength)
  );

  let totalSize = 0;

  totalSize += 1; // Transaction Version
  totalSize += 1; // Type of Input Address
  totalSize += 1; // Standard Input Address Length Byte
  totalSize += 22; // Standard Input Address Length
  totalSize += 1; // Input Amount Length Byte
  totalSize += inputAmountBytes.length; // Input Amount Length
  totalSize += 1; // Number of Outputs

  transactionOutputs.forEach(output => {
    const outputAmount = trimmedByteArrayFromNumber(output.amount);
    totalSize += 1; // ID of Output Address
    totalSize += 1; // Output Address Length Bytes
    totalSize += 22; // Output Address Length
    totalSize += 1; // Output Amount Length Bytes
    totalSize += outputAmount.length; // Output Amount Length
  });

  totalSize += 1; // Sig Index Length Bytes
  totalSize += sigIndexBytes.length; // Sig Index Bytes
  totalSize += 1; // Data Length Bytes Length
  totalSize += dataLengthBytes.length; // Data Length Bytes
  totalSize += extraDataLength; // Extra data section

  return totalSize;
};

export const calculateFee = (
  transactionOutputs: Array<{
    address: string;
    amount: BigNumber;
  }>,
  signatureIndex: SignatureIndex
) => {
  // This is for over-estimating the size of the transaction by one byte in the edge case where totalOutputAmount
  // is right below a power-of-two barrier
  const totalOutputAmount: BigNumber = transactionOutputs.reduce(
    (r: BigNumber, o: Output) => r.plus(o.amount),
    new BigNumber(0)
  );
  const feeFudgeFactor = new BigNumber(DEFAULT_TRANSACTION_FEE * 500);
  const predictedTransactionSize = getTransactionSize(
    totalOutputAmount.plus(feeFudgeFactor),
    transactionOutputs,
    signatureIndex,
    0
  );

  return new BigNumber(predictedTransactionSize * DEFAULT_TRANSACTION_FEE);
};
