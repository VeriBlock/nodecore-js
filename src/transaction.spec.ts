// VeriBlock Blockchain Project
// Copyright 2017-2018 VeriBlock, Inc
// Copyright 2018-2019 Xenios SEZC
// All rights reserved.
// https://www.veriblock.org
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import {
  Output,
  SignedTransaction,
  signTransaction,
  Transaction,
} from './transaction';
import { KeyPair } from './crypto';
import { addressFromPublicKey } from './address';
import { AMOUNT_MAX } from './const';
import BigNumber from 'bignumber.js';

const PRIVATE_KEY = Buffer.from(
  '303E020100301006072A8648CE3D020106052B8104000A04273025020101042017869E398A7ACD18729B8FC6D47DCFE9C1A2B5871334D00471EFC3985762FF8F',
  'hex'
);

const kp = KeyPair.fromPrivateKey(PRIVATE_KEY);
const sourceAddress = addressFromPublicKey(kp.publicKey);
const tx: Transaction = new Transaction(
  sourceAddress,
  AMOUNT_MAX,
  [new Output(sourceAddress, new BigNumber(100))],
  1
);

const signatureIndex = 0;
const signed: SignedTransaction = signTransaction(tx, kp, signatureIndex);

describe('transaction', () => {
  it('toJSON/fromJSON', () => {
    const str: string = signed.stringify();
    const deserialized = SignedTransaction.parse(str);
    expect(deserialized).toEqual(signed);
    expect(deserialized.stringify()).toEqual(str);
    expect(deserialized.stringify()).toEqual(
      '{"signature":"304502204348ce9c3d7cdb6bd7939f7acabd7e3b6eb00900f5cb496d6bd99354fe3f073b7b89d3268c65be85c2b677459ccd5ababd7f764eb227b3e051dbe14a7f63b97a4865eb","publicKey":"3056301006072a8648ce3d020106052b8104000a034200044b649515a30a4361dd875f8fad16c37142116217e5b8069c444773b59911bcce38782d7ba06c0b9b771305d065279ce9f2288c8eab5328d260629085f7653504","signatureIndex":0,"transaction":{"type":1,"sourceAddress":"V5ZguGxnAckADJMkFFG6Vpr9EGyk6v","sourceAmount":9223372036854775807,"outputs":[{"address":"V5ZguGxnAckADJMkFFG6Vpr9EGyk6v","amount":100}],"networkByte":1}}'
    );
  });
});
