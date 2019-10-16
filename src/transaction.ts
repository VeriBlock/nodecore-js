// VeriBlock Blockchain Project
// Copyright 2017-2018 VeriBlock, Inc
// Copyright 2018-2019 Xenios SEZC
// All rights reserved.
// https://www.veriblock.org
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
// tslint:disable-next-line:variable-name
import BigNumber from 'bignumber.js';

// tslint:disable-next-line:variable-name
const JSONbig = require('json-bigint')({ strict: true, storeAsString: false });

import {
  Address,
  isValidMultisigAddress,
  isValidStandardAddress,
} from './address';
import {
  assertAddressValid,
  assertAmountValid,
  assertByteValid,
  makeBigNumber,
  serializeTransactionEffects,
} from './util';
import { sha256 } from './hash';
import { KeyPair, PublicKey, SHA256withECDSA, Signature } from './crypto';

export enum AddressType {
  ZERO_UNUSED = 0,
  STANDARD = 1,
  PROOF_OF_PROOF = 2,
  MULTISIG = 3,
}

export class Output {
  constructor(readonly address: Address, readonly amount: Amount) {
    assertAddressValid(address);
    assertAmountValid(amount);
  }

  toJSON() {
    return {
      address: this.address,
      amount: this.amount,
    };
  }

  stringify(): string {
    return JSONbig.stringify(this);
  }

  static parse(json: string): Output {
    return Output.fromJSON(JSONbig.parse(json));
  }

  // tslint:disable-next-line:no-any
  static fromJSON(obj: any): Output {
    const { address, amount } = obj;
    return new Output(address, makeBigNumber(amount));
  }
}

export type Amount = BigNumber | string | number;

export type Byte = number;

export class Transaction {
  readonly type: AddressType;

  constructor(
    readonly sourceAddress: Address,
    readonly sourceAmount: Amount,
    readonly outputs: Output[],
    readonly networkByte?: Byte
  ) {
    if (isValidStandardAddress(sourceAddress)) {
      this.type = AddressType.STANDARD;
    } else if (isValidMultisigAddress(sourceAddress)) {
      this.type = AddressType.MULTISIG;
    } else {
      throw new Error('invalid source address');
    }

    assertAmountValid(sourceAmount);
    outputs.forEach(o => {
      assertAddressValid(o.address);
      assertAmountValid(o.amount);
    });

    if (networkByte !== undefined) assertByteValid(networkByte);
  }

  stringify(): string {
    return JSONbig.stringify(this);
  }

  toJSON() {
    if (this.networkByte === undefined) {
      return {
        type: this.type,
        sourceAddress: this.sourceAddress,
        sourceAmount: makeBigNumber(this.sourceAmount),
        outputs: this.outputs,
      };
    } else {
      return {
        type: this.type,
        sourceAddress: this.sourceAddress,
        sourceAmount: makeBigNumber(this.sourceAmount),
        outputs: this.outputs,
        networkByte: this.networkByte,
      };
    }
  }

  static parse(json: string): Transaction {
    return Transaction.fromJSON(JSONbig.parse(json));
  }

  // tslint:disable-next-line:no-any
  static fromJSON(obj: any): Transaction {
    const { sourceAddress, sourceAmount, outputs, networkByte } = obj;

    return new Transaction(
      sourceAddress,
      makeBigNumber(sourceAmount),
      // tslint:disable-next-line:no-any
      outputs.map((o: any) => Output.fromJSON(o)),
      networkByte
    );
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
    readonly signatureIndex: Byte,
    readonly transaction: Transaction
  ) {
    assertByteValid(signatureIndex);
  }

  stringify(): string {
    return JSONbig.stringify(this);
  }

  toJSON() {
    return {
      signature: this.signature.toStringHex(),
      publicKey: this.publicKey.toStringHex(),
      signatureIndex: this.signatureIndex,
      transaction: this.transaction,
    };
  }

  static parse(json: string): SignedTransaction {
    return SignedTransaction.fromJSON(JSONbig.parse(json));
  }

  // tslint:disable-next-line:no-any
  static fromJSON(obj: any): SignedTransaction {
    const { signature, publicKey, signatureIndex, transaction } = obj;

    return new SignedTransaction(
      Signature.fromStringHex(signature),
      PublicKey.fromStringHex(publicKey),
      signatureIndex,
      Transaction.fromJSON(transaction)
    );
  }
}

export const signTransaction = (
  transaction: Transaction,
  keyPair: KeyPair,
  signatureIndex: Byte
): SignedTransaction => {
  assertByteValid(signatureIndex);
  const id: Buffer = getTransactionId(transaction, signatureIndex);
  const signature = SHA256withECDSA.sign(id, keyPair);
  return new SignedTransaction(
    signature,
    keyPair.publicKey,
    signatureIndex,
    transaction
  );
};
