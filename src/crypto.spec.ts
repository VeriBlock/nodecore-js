import { KeyPair, PrivateKey, PublicKey, SHA256withECDSA } from './crypto';
import { sha256 } from './hash';

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
    const pub = Buffer.from(
      '044B649515A30A4361DD875F8FAD16C37142116217E5B8069C444773B59911BCCE38782D7BA06C0B9B771305D065279CE9F2288C8EAB5328D260629085F7653504',
      'hex'
    );

    const pubm = new PublicKey(pub);
    expect(pubm.asn1.toString('hex').toUpperCase()).toEqual(ASN1_PUBLIC_KEY);
  });

  it('parse public key from compressed form with even root', () => {
    const pub = Buffer.from(
      '024b649515a30a4361dd875f8fad16c37142116217e5b8069c444773b59911bc66',
      'hex'
    );

    const pubm = new PublicKey(pub);
    expect(pubm.asn1.toString('hex').toUpperCase()).toEqual(
      '3056301006072A8648CE3D020106052B8104000A034200044B649515A30A4361DD875F8FAD16C37142116217E5B8069C444773B59911BC66B94F4E34A03B943E2E2608A60F3FB708244419D0D4E85373D97A1EAA0D349E60'
    );
  });

  it('parse public key from compressed form with odd root', () => {
    const pub = Buffer.from(
      '034b649515a30a4361dd875f8fad16c37142116217e5b8069c444773b59911bc67',
      'hex'
    );

    const pubm = new PublicKey(pub);
    expect(pubm.asn1.toString('hex').toUpperCase()).toEqual(
      '3056301006072A8648CE3D020106052B8104000A034200044B649515A30A4361DD875F8FAD16C37142116217E5B8069C444773B59911BC671717216C6A878216F47A9083A0E4EB4AD592037C520BA65C449DF687448D39F9'
    );
  });
});

describe('keygen', () => {
  it('public key can be derived from private', () => {
    const priv = Buffer.from(
      '303E020100301006072A8648CE3D020106052B8104000A04273025020101042017869E398A7ACD18729B8FC6D47DCFE9C1A2B5871334D00471EFC3985762FF8F',
      'hex'
    );

    const privm = new PrivateKey(priv);
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
  it('sign/verify', () => {
    const kp = KeyPair.fromPrivate(
      Buffer.from(
        '303E020100301006072A8648CE3D020106052B8104000A04273025020101042017869E398A7ACD18729B8FC6D47DCFE9C1A2B5871334D00471EFC3985762FF8F',
        'hex'
      )
    );

    const msg = Buffer.from('hello world!');
    const sig = SHA256withECDSA.sign(msg, kp);
    const result = SHA256withECDSA.verify(msg, sig, kp);

    expect(sig).toHaveLength(64);
    expect(result).toEqual(true);
  });

  it('sign produces deterministic signatures', () => {
    const kp = KeyPair.fromPrivate(
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
