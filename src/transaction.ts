// VeriBlock Blockchain Project
// Copyright 2017-2018 VeriBlock, Inc
// Copyright 2018-2019 Xenios SEZC
// All rights reserved.
// https://www.veriblock.org
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import { Address, AddressLike, addressLikeToAddress } from './address';
import {
  assertInt,
  assertMaxNumber,
  assertNumberInRange,
  assertPositive,
  serializeTransactionEffects,
} from './util';
import { sha256 } from './hash';
import { KeyPair, PublicKey, SHA256withECDSA, Signature } from './crypto';
import { Amount, AmountLike, amountLikeToAmount } from './amount';
import { Output } from './basic';

export enum Type {
  ZERO_UNUSED = 0,
  STANDARD = 1,
  PROOF_OF_PROOF = 2,
  MULTISIG = 3,
}

export class Transaction {
  private _address: Address;
  private _amount: Amount;

  constructor(
    readonly type: Type,
    sourceAddress: AddressLike,
    sourceAmount: AmountLike,
    readonly outputs: Output[],
    readonly networkByte: number
  ) {
    // check type
    assertNumberInRange(type, 0, 3);

    // check address
    this._address = addressLikeToAddress(sourceAddress);

    // check amount
    this._amount = amountLikeToAmount(sourceAmount);

    // check networkByte
    assertPositive(networkByte, 'networkByte');
    assertInt(networkByte, 'networkByte');
    assertMaxNumber(networkByte, 0xff, 'networkByte');
  }

  get sourceAddress(): Address {
    return this._address;
  }

  get sourceAmount(): Amount {
    return this._amount;
  }
}

export const getTransactionId = (
  tx: Transaction,
  signatureIndex: number
): Buffer => {
  const ser = serializeTransactionEffects(tx, signatureIndex);
  return sha256(ser);
};

export class SignedTransaction {
  constructor(
    readonly signature: Signature,
    readonly publicKey: PublicKey,
    readonly signatureIndex: number,
    readonly transaction: Transaction
  ) {}
}

export const signTransaction = (
  tx: Transaction,
  keyPair: KeyPair,
  signatureIndex: number
): SignedTransaction => {
  const id: Buffer = getTransactionId(tx, signatureIndex);
  const sig = SHA256withECDSA.sign(id, keyPair);
  return new SignedTransaction(sig, keyPair.publicKey, signatureIndex, tx);
};
