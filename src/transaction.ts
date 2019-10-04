import {
  Address,
  isValidMultisigAddress,
  isValidStandardAddress,
} from './address';
import {
  assertInt,
  assertMaxNumber,
  assertNumberInRange,
  assertPositive,
  assertTrue,
  serializeTransactionEffects,
} from './util';
import { sha256 } from './hash';
import { KeyPair, PublicKey, SHA256withECDSA } from './crypto';
import { Amount } from './amount';
import { Output } from './basic';

export enum Type {
  ZERO_UNUSED = 0,
  STANDARD = 1,
  PROOF_OF_PROOF = 2,
  MULTISIG = 3,
}

export class Transaction {
  constructor(
    readonly type: Type,
    readonly sourceAddress: Address,
    readonly sourceAmount: Amount,
    readonly outputs: Output[],
    readonly networkByte: number
  ) {
    // check type
    assertNumberInRange(type, 0, 3);

    // check address
    assertTrue(
      isValidStandardAddress(sourceAddress.value) ||
        isValidMultisigAddress(sourceAddress.value),
      'sourceAddress is neither standard nor multisig'
    );

    // check amount
    assertPositive(sourceAmount.value.toNumber(), 'sourceAmount');

    // check networkByte
    assertPositive(networkByte, 'networkByte');
    assertInt(networkByte, 'networkByte');
    assertMaxNumber(networkByte, 0xff, 'networkByte');
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
    readonly signature: Buffer,
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
