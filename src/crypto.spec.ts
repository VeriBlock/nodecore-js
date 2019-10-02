import { KeyPair, sign, verify } from './crypto';
import { ec } from 'elliptic';

const secp256k1 = new ec('secp256k1');

const PRIVATE_KEY =
  'MD4CAQAwEAYHKoZIzj0CAQYFK4EEAAoEJzAlAgEBBCCV0ZmUM1F3hTwbX47m0lDD+Al3j+y2TDMHNq076EPCzQ==';
const PUBLIC_KEY =
  'MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAERma1mS2caMSQHp4fV/UbRipyQCu47VOik8oQze9SA3EMxuLWlTHBBEYWALFBTxpcd99ksgWaOmGxAdfJ9Ybctg==';
const ADDRESS = 'V44i36pPHyhaiW695Xg8PEos4G2PrC';

const KEYPAIR_2 = {
  pub:
    // 02bf99c9871df784fd2be9f94c5e350523ac37808a114f656d8d2e0d0c5b412a2e
    '3056301006072A8648CE3D020106052B8104000A034200044B649515A30A4361DD875F8FAD16C37142116217E5B8069C444773B59911BCCE38782D7BA06C0B9B771305D065279CE9F2288C8EAB5328D260629085F7653504',
  priv:
    // big integer: 10641045051318797084434375538139088772680553025493747518172698890107548270479
    // from elliptic: 3a9a4cf7639561230960454107a4a8dd4329e6f6b7b89b0e1419e1017b27639f
    // parsed: 17869e398a7acd18729b8fc6d47dcfe9c1a2b5871334d00471efc3985762ff8f
    '303E020100301006072A8648CE3D020106052B8104000A04273025020101042017869E398A7ACD18729B8FC6D47DCFE9C1A2B5871334D00471EFC3985762FF8F',
  // MD4CAQAwEAYHKoZIzj0CAQYFK4EEAAoEJzAlAgEBBCAXhp45inrNGHKbj8bUfc/pwaK1hxM00ARx78OYV2L/jw==
};

describe('hardcoded keypair', () => {
  const kp: KeyPair = KeyPair.fromASN1Private(
    Buffer.from(KEYPAIR_2.priv, 'hex')
  );
  const msg = Buffer.from('helloo world');

  // elliptic keypair
  const kp2: ec.KeyPair = secp256k1.keyFromPrivate(KEYPAIR_2.priv, 'hex');
  const encodedPub1 = kp2.getPublic().encode('hex', true);
  const encodedPub2 = kp2.getPublic().encode('hex', false);
  console.log('parsed private key ' + kp.getPrivateKey().toString('hex'));
  console.log('compact pubkey: ' + encodedPub1);
  console.log('not compact pubkey: ' + encodedPub2);
  console.log('inspect ' + kp2.inspect());

  it('decode ASN.1 privkey', () => {
    console.log(
      'asn1 encoded private key: ' + kp.getPrivateKey().toString('hex')
    );
    expect(kp).toBeDefined();
  });

  it('encode privkey to ASN.1', () => {
    const encoded = kp.toASN1Private().toString('hex');
    expect(encoded.toUpperCase()).toEqual(KEYPAIR_2.priv);
  });

  it('sign/verify', () => {
    const signature = sign(msg, kp);
    const result = verify(msg, signature, kp.getPublicKey());
    expect(result).toEqual(true);
  });
});
