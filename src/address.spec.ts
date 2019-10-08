// VeriBlock Blockchain Project
// Copyright 2017-2018 VeriBlock, Inc
// Copyright 2018-2019 Xenios SEZC
// All rights reserved.
// https://www.veriblock.org
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import { PublicKey } from './crypto';
import { addressFromPublicKey, isValidStandardAddress } from './address';

test('valid address is valid', () => {
  const validAddress = 'V44i36pPHyhaiW695Xg8PEos4G2PrC';
  const val = isValidStandardAddress(validAddress);
  expect(val).toEqual(true);
});

test('valid address from public key', () => {
  const pub = Buffer.from(
    '3056301006072A8648CE3D020106052B8104000A034200044B649515A30A4361DD875F8FAD16C37142116217E5B8069C444773B59911BCCE38782D7BA06C0B9B771305D065279CE9F2288C8EAB5328D260629085F7653504',
    'hex'
  );
  const addressExpected = 'V5ZguGxnAckADJMkFFG6Vpr9EGyk6v';

  const address1 = addressFromPublicKey(pub);
  const address2 = addressFromPublicKey(new PublicKey(pub));

  expect(isValidStandardAddress(addressExpected)).toEqual(true);
  expect(isValidStandardAddress(address1)).toEqual(true);
  expect(isValidStandardAddress(address2)).toEqual(true);
  expect(address1).toEqual(addressExpected);
  expect(address1).toEqual(address2);
});

describe('invalid address is invalid', () => {
  it('is null', () => {
    expect(isValidStandardAddress(null)).toEqual(false);
  });

  it('too short', () => {
    expect(isValidStandardAddress('VVV')).toEqual(false);
  });

  it('no starting char', () => {
    expect(isValidStandardAddress('Z5ZguGxnAckADJMkFFG6Vpr9EGyk6v')).toEqual(
      false
    );
  });
});
