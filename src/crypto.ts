import {
  SignedTransaction,
  Transaction,
  TransactionUnion,
} from './transaction';
import { Ber, BerReader, BerWriter } from 'asn1';
import secp256k1 from 'secp256k1';
import { sha256 } from './hash';

// https://people.eecs.berkeley.edu/~jonah/bc/org/bouncycastle/asn1/x509/AlgorithmIdentifier.html
class AlgorithmIdentifier {
  constructor(public algorithm: string, public parameters: string) {}

  toASN1(writer: BerWriter) {
    writer.startSequence();
    writer.writeOID(this.algorithm, Ber.OID);
    writer.writeOID(this.parameters, Ber.OID);
    writer.endSequence();
  }

  static fromASN1(reader: BerReader): AlgorithmIdentifier {
    if (reader.readSequence() !== 48) {
      throw new Error('invalid algorithm');
    }
    const algorithm = reader.readOID();
    if (algorithm !== '1.2.840.10045.2.1') {
      throw new Error('incorrect key type #1');
    }
    const parameters = reader.readOID();
    if (parameters !== '1.3.132.0.10') {
      throw new Error('incorrect key type #2');
    }
    return new AlgorithmIdentifier(algorithm, parameters);
  }
}

// https://people.eecs.berkeley.edu/~jonah/bc/org/bouncycastle/asn1/pkcs/PrivateKeyInfo.html
class PrivateKeyInfo {
  constructor(
    public version: number,
    public privateKeyAlgorithm: AlgorithmIdentifier,
    public privateKeyExtra: Buffer
  ) {}

  toASN1(writer: BerWriter): Buffer {
    writer.startSequence();
    writer.writeInt(this.version, Ber.Integer);
    this.privateKeyAlgorithm.toASN1(writer);
    writer.writeString(this.privateKeyExtra.toString('ascii'), Ber.OctetString);
    writer.endSequence();
    return writer.buffer;
  }

  static fromASN1(reader: BerReader): PrivateKeyInfo {
    const seq = reader.readSequence();
    if (seq !== 48) {
      throw new Error('invalid key format');
    }
    const version = reader.readInt();
    const algorithm = AlgorithmIdentifier.fromASN1(reader);
    const key: Buffer = reader.readString(Ber.OctetString, true);
    return new PrivateKeyInfo(version, algorithm, key);
  }

  get privateKey(): Buffer {
    return Buffer.from(
      this.privateKeyExtra.subarray(this.privateKeyExtra.length - 32)
    );
  }
}

export class KeyPair {
  constructor(private info: PrivateKeyInfo) {}

  public static fromASN1Private(b: Buffer): KeyPair {
    const reader = new BerReader(b);
    const pk = PrivateKeyInfo.fromASN1(reader);

    if (!secp256k1.privateKeyVerify(pk.privateKey)) {
      throw new Error('invalid private key');
    }

    return new KeyPair(pk);
  }

  public toASN1Private(): Buffer {
    const writer = new BerWriter();
    this.info.toASN1(writer);
    return writer.buffer;
  }

  public getPublicKey(compressed: boolean = true): Buffer {
    return secp256k1.publicKeyCreate(this.info.privateKey, compressed);
  }

  public getPrivateKey(compressed: boolean = true): Buffer {
    return this.info.privateKey;
  }

  sign(msg: Buffer): Buffer {
    const sig = secp256k1.sign(sha256(msg), this.info.privateKey);
    return sig.signature;
  }
}

export const sign = (msg: Buffer, keyPair: KeyPair): Buffer => {
  const sig = keyPair.sign(msg);
  return secp256k1.signatureExport(sig);
};

export const verify = (
  msg: Buffer,
  sig: Buffer,
  publicKey: Buffer
): boolean => {
  return secp256k1.verify(msg, sig, publicKey);
};
