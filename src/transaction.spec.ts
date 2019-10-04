// VeriBlock Blockchain Project
// Copyright 2017-2018 VeriBlock, Inc
// Copyright 2018-2019 Xenios SEZC
// All rights reserved.
// https://www.veriblock.org
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import {
  getTransactionId,
  signTransaction,
  Transaction,
  Type,
} from './transaction';
import { KeyPair } from './crypto';
import { Address } from './address';
import { Output } from './basic';

const PRIVATE_KEY = Buffer.from(
  '303E020100301006072A8648CE3D020106052B8104000A04273025020101042017869E398A7ACD18729B8FC6D47DCFE9C1A2B5871334D00471EFC3985762FF8F',
  'hex'
);

const kp = KeyPair.fromPrivateKey(PRIVATE_KEY);
const addr = Address.fromPublicKey(kp.publicKey);
const outputs: Output[] = [new Output(addr, 100)];
const tx: Transaction = new Transaction(Type.STANDARD, addr, 100, outputs, 1);

describe('transaction', () => {
  it('sign', () => {
    const signatureIndex = 0;
    const signed = signTransaction(tx, kp, signatureIndex);
    console.log(
      'msg: ' +
        getTransactionId(signed.transaction, signatureIndex).toString('hex')
    );
    console.log('pub: ' + signed.publicKey.asn1.toString('hex'));
    console.log('sig: ' + signed.signature.asn1.toString('hex'));
    console.log('add: ' + signed.publicKey.address);
  });
});
