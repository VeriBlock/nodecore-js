// VeriBlock Blockchain Project
// Copyright 2017-2018 VeriBlock, Inc
// Copyright 2018-2021 Xenios SEZC
// All rights reserved.
// https://www.veriblock.org
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import secp256k1 from 'secp256k1';
import { sha256 } from './hash';
import { chopChecksumStandard } from './address';
import { Base58 } from './base58';
import { ADDRESS_DATA_END, ADDRESS_DATA_START, STARTING_CHAR } from './const';
import { NodecoreKeypair } from './types';

/* eslint-disable */
const secureRandom = require('secure-random');
/* eslint-enable */

// prefix which you need to add to an uncompressed public key to get asn1 (java-like) public key
export const PUBKEY_ASN1_PREFIX = Buffer.from(
  '3056301006072A8648CE3D020106052B8104000A034200',
  'hex'
);

// prefix which you need to add to a private key to get asn1 (java-like) private key
export const PRIVKEY_ASN1_PREFIX = Buffer.from(
  '303E020100301006072A8648CE3D020106052B8104000A042730250201010420',
  'hex'
);

// prefix which nodecore adds to the begginning of the string
export const NC_PRIVKEY_PREFIX = Buffer.from(
  '40',
  'hex'
);

export class PublicKey {
  // stores asn1 encoded public key as [pubkey asn1 prefix + 0x04 + x + y]
  // 88 bytes in total
  private readonly _full: Buffer;

  constructor(buf: Uint8Array) {
    const buffer: Buffer = Buffer.from(buf);
    if (
      buffer.length === 88 &&
      buffer[23] === 0x04 &&
      buffer.slice(0, PUBKEY_ASN1_PREFIX.length).compare(PUBKEY_ASN1_PREFIX) ===
        0
    ) {
      // it is a full asn1 encoded key
      this._full = buffer;
    } else if (buffer.length === 65 && buffer[0] === 0x04) {
      // it is an uncompressed secp256k1 public key in format [0x04 + x + y]
      this._full = Buffer.concat([PUBKEY_ASN1_PREFIX, buffer]);
    } else if (buffer.length === 33) {
      // 0x02 = even root
      // 0x03 = odd root
      if (buffer[0] !== 0x02 && buffer[0] !== 0x03) {
        throw new Error(
          'invalid key format, expected 0x02 or 0x03 as first byte'
        );
      }

      // it is a compressed secp256k1 public key in format [0x0(2|3) + x]
      const uncompressed: Uint8Array = secp256k1.publicKeyConvert(
        new Uint8Array(buffer),
        false
      );
      this._full = Buffer.concat([PUBKEY_ASN1_PREFIX, uncompressed]);
    } else {
      throw new Error('unknown public key format');
    }
  }

  get compressed(): Buffer {
    // extract [0x02 + x] from [PUBKEY_ASN1_PREFIX + 0x04 + x + y]
    return Buffer.concat([
      Buffer.from([0x02]),
      this._full.slice(this._full.length - 64, this._full.length - 32),
    ]);
  }

  get uncompressed(): Buffer {
    // return last 65 bytes
    return this._full.slice(this._full.length - 65);
  }

  get asn1(): Buffer {
    return this._full;
  }

  getAddress(): string {
    const b58 = Base58.encode(sha256(this.asn1));
    const slice = b58.slice(ADDRESS_DATA_START, ADDRESS_DATA_END);
    const address = STARTING_CHAR + slice;

    const checksum = chopChecksumStandard(
      Base58.encode(sha256(Buffer.from(address)))
    );

    return address + checksum;
  }

  toStringHex(): string {
    return this.asn1.toString('hex');
  }

  static fromStringHex(h: string): PublicKey {
    return new PublicKey(Buffer.from(h, 'hex'));
  }

  static fromStringBase64(b64: string): PublicKey {
    return new PublicKey(Buffer.from(b64, 'base64'));
  }
}

export const addressFromPublicKey = (publicKey: PublicKey | Buffer): string => {
  if (publicKey instanceof Buffer) {
    publicKey = new PublicKey(publicKey);
  }

  return publicKey.getAddress();
};

export class PrivateKey {
  // stores asn1 encoded private key as [asn1 prefix + 32 byte private key]
  private readonly _full: Buffer;

  constructor(buffer: Buffer) {
    if (buffer.length === 32) {
      this._full = Buffer.concat([PRIVKEY_ASN1_PREFIX, buffer]);
    } else if (
      buffer.length === 64 &&
      buffer
        .slice(0, PRIVKEY_ASN1_PREFIX.length)
        .compare(PRIVKEY_ASN1_PREFIX) === 0
    ) {
      this._full = buffer;
    } else if (
      buffer.length === 153 &&
      buffer[0] === 0x40 &&
      buffer
        .slice(1, PRIVKEY_ASN1_PREFIX.length + NC_PRIVKEY_PREFIX.length)
        .compare(PRIVKEY_ASN1_PREFIX) === 0
    ) {
      this._full = buffer.slice(1, PRIVKEY_ASN1_PREFIX.length + NC_PRIVKEY_PREFIX.length + 32);
    } else {
      throw new Error('unknown private key format');
    }
  }

  get canonical(): Buffer {
    // return last 32 bytes
    return this._full.slice(this._full.length - 32);
  }

  get asn1(): Buffer {
    return this._full;
  }

  derivePublicKey(): PublicKey {
    const buf = secp256k1.publicKeyCreate(new Uint8Array(this.canonical), true);
    return new PublicKey(buf);
  }

  toStringHex(): string {
    return this.asn1.toString('hex');
  }

  static fromStringHex(h: string): PrivateKey {
    return new PrivateKey(Buffer.from(h, 'hex'));
  }

  static fromStringBase64(b64: string): PrivateKey {
    return new PrivateKey(Buffer.from(b64, 'base64'));
  }
}

export class Signature {
  private readonly _canonical: Buffer;

  constructor(buffer: Buffer) {
    if (buffer.length === 71) {
      this._canonical = Buffer.from(
        secp256k1.signatureImport(new Uint8Array(buffer))
      );
    } else if (buffer.length === 64) {
      this._canonical = buffer;
    } else {
      throw new Error('unknown signature format');
    }
  }

  /// returns full asn1 encoded signature of length 71 bytes
  get asn1(): Buffer {
    return Buffer.from(
      secp256k1.signatureExport(new Uint8Array(this._canonical))
    );
  }

  /// returns canonical secp256k1 signature with length 64 bytes
  get canonical(): Buffer {
    return this._canonical;
  }

  toStringHex(): string {
    return this.asn1.toString('hex');
  }

  static fromStringHex(h: string): Signature {
    return new Signature(Buffer.from(h, 'hex'));
  }

  static fromStringBase64(b64: string): Signature {
    return new Signature(Buffer.from(b64, 'base64'));
  }
}

export class KeyPair {
  constructor(readonly publicKey: PublicKey, readonly privateKey: PrivateKey) {}

  static fromPrivateKey(privateKey: PrivateKey | Buffer): KeyPair {
    if (privateKey instanceof Buffer) {
      privateKey = new PrivateKey(privateKey);
    }

    const pub = privateKey.derivePublicKey();
    return new KeyPair(pub, privateKey);
  }

  static generate(entropy?: Buffer | undefined): KeyPair {
    /*eslint-disable */
    if (!entropy) {
      entropy = secureRandom(32);
    }

    if (entropy!.length < 32) {
      throw new Error('not enough entropy, supply 32 bytes or more');
    }

    const priv = new PrivateKey(sha256(entropy!));
    const pub = priv.derivePublicKey();
    /*eslint-enable */
    return new KeyPair(pub, priv);
  }

  exportToNodecore(): NodecoreKeypair {
    const addr = this.publicKey.getAddress();
    const pub = this.publicKey.toStringHex().toUpperCase();
    const priv = this.privateKey.toStringHex().toUpperCase();

    /* eslint-disable */
    // private_key can be used for nodecore-cli command: importprivatekey
    return {
      address: addr,
      private_key: '40' + priv + pub,
    };
    /* eslint-enable */
  }

  static importFromNodecorePrivateKey(privateKey: string): KeyPair {
    const priv = Buffer.from(privateKey.substr(2, 128), 'hex');

    return KeyPair.fromPrivateKey(priv);
  }
}

export class SHA256withECDSA {
  static sign(msg: Buffer, privateKey: PrivateKey | KeyPair): Signature {
    if (privateKey instanceof KeyPair) {
      privateKey = privateKey.privateKey;
    }

    const m: Uint8Array = new Uint8Array(sha256(msg));
    const sig = secp256k1.ecdsaSign(m, new Uint8Array(privateKey.canonical));
    return new Signature(Buffer.from(sig.signature));
  }

  static verify(
    msg: Buffer,
    sig: Signature,
    publicKey: PublicKey | KeyPair
  ): boolean {
    if (publicKey instanceof KeyPair) {
      publicKey = publicKey.publicKey;
    }
    const m: Uint8Array = new Uint8Array(sha256(msg));
    const s: Uint8Array = new Uint8Array(sig.canonical);
    return secp256k1.ecdsaVerify(s, m, new Uint8Array(publicKey.uncompressed));
  }
}
