// VeriBlock Blockchain Project
// Copyright 2017-2018 VeriBlock, Inc
// Copyright 2018-2019 Xenios SEZC
// All rights reserved.
// https://www.veriblock.org
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import {
  KeyPair,
  PrivateKey,
  PublicKey,
  SHA256withECDSA,
  Signature,
  sha256,
} from '../src';

const ASN1_PUBLIC_KEY =
  '3056301006072A8648CE3D020106052B8104000A034200044B649515A30A4361DD875F8FAD16C37142116217E5B8069C444773B59911BCCE38782D7BA06C0B9B771305D065279CE9F2288C8EAB5328D260629085F7653504';

describe('keypairs can be parsed correctly', () => {
  it('parse public key from asn1', () => {
    const pub = Buffer.from(ASN1_PUBLIC_KEY, 'hex');

    const pubm = new PublicKey(pub);
    expect(pubm).toBeDefined();
    expect(pubm.asn1).toEqual(pub);
    expect(pubm.compressed.toString('hex')).toEqual(
      '024B649515A30A4361DD875F8FAD16C37142116217E5B8069C444773B59911BCCE'.toLowerCase()
    );
    expect(pubm.uncompressed.toString('hex')).toEqual(
      '044B649515A30A4361DD875F8FAD16C37142116217E5B8069C444773B59911BCCE38782D7BA06C0B9B771305D065279CE9F2288C8EAB5328D260629085F7653504'.toLowerCase()
    );
  });

  it('parse private key from asn1', () => {
    const priv = Buffer.from(
      '303E020100301006072A8648CE3D020106052B8104000A04273025020101042017869E398A7ACD18729B8FC6D47DCFE9C1A2B5871334D00471EFC3985762FF8F',
      'hex'
    );

    const privm = new PrivateKey(priv);
    expect(privm).toBeDefined();
    expect(privm.asn1).toEqual(priv);
    expect(privm.canonical.toString('hex')).toEqual(
      '17869E398A7ACD18729B8FC6D47DCFE9C1A2B5871334D00471EFC3985762FF8F'.toLowerCase()
    );
  });

  it('parse public key from uncompressed form', () => {
    const pubm = PublicKey.fromStringHex(
      '044B649515A30A4361DD875F8FAD16C37142116217E5B8069C444773B59911BCCE38782D7BA06C0B9B771305D065279CE9F2288C8EAB5328D260629085F7653504'
    );
    expect(pubm.asn1.toString('hex').toUpperCase()).toEqual(ASN1_PUBLIC_KEY);
  });

  it('parse public key from compressed form with even root', () => {
    const pubm = PublicKey.fromStringHex(
      '024b649515a30a4361dd875f8fad16c37142116217e5b8069c444773b59911bc66'
    );
    expect(pubm.asn1.toString('hex').toUpperCase()).toEqual(
      '3056301006072A8648CE3D020106052B8104000A034200044B649515A30A4361DD875F8FAD16C37142116217E5B8069C444773B59911BC66B94F4E34A03B943E2E2608A60F3FB708244419D0D4E85373D97A1EAA0D349E60'
    );
  });

  it('parse public key from compressed form with odd root', () => {
    const pubm = PublicKey.fromStringHex(
      '034b649515a30a4361dd875f8fad16c37142116217e5b8069c444773b59911bc67'
    );
    expect(pubm.asn1.toString('hex').toUpperCase()).toEqual(
      '3056301006072A8648CE3D020106052B8104000A034200044B649515A30A4361DD875F8FAD16C37142116217E5B8069C444773B59911BC671717216C6A878216F47A9083A0E4EB4AD592037C520BA65C449DF687448D39F9'
    );
  });

  it('import Nodecore privatekey', () => {
    const privateNodecoreKey =
      '40303E020100301006072A8648CE3D020106052B8104000A0427302502010104205E5356079422753D981D93BDEBF7DE38D4AB063A73540DB50F446D4F4618684C3056301006072A8648CE3D020106052B8104000A0342000461CA7B88C1B097CE7D72860C05D50AF154C63D112E149EE4A36F51E12D960C9065CAFE6CD9D11B54F03DB1A2A82A374E0357C9C63A2D6A1D1C9DF4C889910CAA';
    const keyPair = KeyPair.importFromNodecorePrivateKey(privateNodecoreKey);

    expect(keyPair.publicKey.getAddress()).toEqual(
      'V3kHRaCL6ddmqMRnCSyD8417Z9nJCZ'
    );
  });

  it('export to Nodecore', () => {
    // any valid private key
    const privateNodecoreKey =
      '40303E020100301006072A8648CE3D020106052B8104000A0427302502010104205E5356079422753D981D93BDEBF7DE38D4AB063A73540DB50F446D4F4618684C3056301006072A8648CE3D020106052B8104000A0342000461CA7B88C1B097CE7D72860C05D50AF154C63D112E149EE4A36F51E12D960C9065CAFE6CD9D11B54F03DB1A2A82A374E0357C9C63A2D6A1D1C9DF4C889910CAA';
    const privHex =
      '303e020100301006072a8648ce3d020106052b8104000a0427302502010104205e5356079422753d981d93bdebf7de38d4ab063a73540db50f446d4f4618684c';
    const priv = PrivateKey.fromStringHex(privHex);

    const kp = KeyPair.fromPrivateKey(priv);
    const nodecoreFormat = kp.exportToNodecore();

    expect(nodecoreFormat.address).toEqual('V3kHRaCL6ddmqMRnCSyD8417Z9nJCZ');
    expect(nodecoreFormat.private_key).toEqual(privateNodecoreKey);
  });

  const sigs = [
    '3045022100A09A4374161134803B05A65E0EC3BB63CEBDFBD563436842FB08DB62C1232C2F02201DF9472377071BC7A7122C67C45DF35F346401F19F66BF93FF8829B66FBB4BF8',
    '304502202778AC6399E243377BF3999D9E46AB9FDC37DFD77EAE9A01C46DCB347681702702210094D969BAFD1A0CB797AB27A10E683B17668F97766B28BAF667A86E69D93F060A',
    '30450220529FA01ED4FFC4DFC339D7EB013B4C9B979BC3BBBBF5894635B58C6FC31FF218022100F357BD4006FE450DD9EBA7FBBDEF1C438733FC19C5399C5D8F18D89CF859FE7F',
  ];

  sigs.forEach(sig => {
    it(`signature ${sig} can be parsed`, () => {
      const s = () => Signature.fromStringHex(sig);
      expect(s).not.toThrow();
    });
  });
});

describe('keygen', () => {
  it('public key can be derived from private', () => {
    const privm = PrivateKey.fromStringHex(
      '303E020100301006072A8648CE3D020106052B8104000A04273025020101042017869E398A7ACD18729B8FC6D47DCFE9C1A2B5871334D00471EFC3985762FF8F'
    );
    const pubm = privm.derivePublicKey();
    expect(pubm).toBeDefined();
    expect(pubm.asn1.toString('hex')).toEqual(
      '3056301006072A8648CE3D020106052B8104000A034200044B649515A30A4361DD875F8FAD16C37142116217E5B8069C444773B59911BCCE38782D7BA06C0B9B771305D065279CE9F2288C8EAB5328D260629085F7653504'.toLowerCase()
    );
  });

  it('two consecutive keypair generations create different keypairs', () => {
    const k1 = KeyPair.generate();
    const k2 = KeyPair.generate();
    expect(k1).not.toEqual(k2);
  });

  it('two consecutive keypair generations with same seed crete sam keypairs', () => {
    const seed = sha256(Buffer.from('hi there'));
    const k1 = KeyPair.generate(seed);
    const k2 = KeyPair.generate(seed);
    expect(k1).toEqual(k2);
  });
});

describe('signature works', () => {
  it('sign/verify js', () => {
    const kp = KeyPair.fromPrivateKey(
      Buffer.from(
        '303E020100301006072A8648CE3D020106052B8104000A04273025020101042017869E398A7ACD18729B8FC6D47DCFE9C1A2B5871334D00471EFC3985762FF8F',
        'hex'
      )
    );

    const msg = Buffer.from('hello world!');
    const sig = SHA256withECDSA.sign(msg, kp);
    const result = SHA256withECDSA.verify(msg, sig, kp);

    expect(sig.canonical).toHaveLength(64);
    expect(result).toEqual(true);
  });

  it('verify signature from java', () => {
    const kp = KeyPair.fromPrivateKey(
      Buffer.from(
        '303E020100301006072A8648CE3D020106052B8104000A04273025020101042017869E398A7ACD18729B8FC6D47DCFE9C1A2B5871334D00471EFC3985762FF8F',
        'hex'
      )
    );

    const msg = Buffer.from(
      '4cb778a158601701c98028b778e583859ef814ba1a57284fadef720a1dd5fbb7',
      'hex'
    );

    const sig = Signature.fromStringHex(
      '3045022100A09A4374161134803B05A65E0EC3BB63CEBDFBD563436842FB08DB62C1232C2F02201DF9472377071BC7A7122C67C45DF35F346401F19F66BF93FF8829B66FBB4BF8'
    );
    const result: boolean = SHA256withECDSA.verify(msg, sig, kp);
    expect(result).toEqual(true);
  });

  it('sign produces deterministic signatures', () => {
    const kp = KeyPair.fromPrivateKey(
      Buffer.from(
        '303E020100301006072A8648CE3D020106052B8104000A04273025020101042017869E398A7ACD18729B8FC6D47DCFE9C1A2B5871334D00471EFC3985762FF8F',
        'hex'
      )
    );

    const msg = Buffer.from('hello world!');
    const sig1 = SHA256withECDSA.sign(msg, kp);
    const sig2 = SHA256withECDSA.sign(msg, kp);

    expect(sig1).toEqual(sig2);
  });
});
