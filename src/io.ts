import * as t from 'io-ts';
import { isValidStandardAddress } from './address';
import { PrivateKey, PublicKey, Signature } from './crypto';
import BigNumber from 'bignumber.js';
import { Reporter } from 'io-ts/lib/Reporter';
import { isLeft } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { AMOUNT_MAX } from './const';

export const addressT = new t.Type<string, string, unknown>(
  'address',
  t.string.is,
  // `t.success` and `t.failure` are helpers used to build `Either` instances
  (input, context) => {
    if (typeof input !== 'string') {
      return t.failure(input, context, 'not a string');
    }

    if (!isValidStandardAddress(input)) {
      return t.failure(input, context, 'invalid address format');
    }

    return t.success(input);
  },
  t.identity
);

export const amountT = new t.Type<BigNumber, string, unknown>(
  'amount',
  (input: unknown): input is BigNumber => input instanceof BigNumber,
  (input, context) => {
    if (typeof input !== 'string') {
      return t.failure(input, context, 'not a string');
    }

    try {
      const bn = new BigNumber(input);
      if (bn.isNegative()) {
        return t.failure(input, context, 'can not be negative');
      }

      if (bn.gt(AMOUNT_MAX)) {
        return t.failure(
          input,
          context,
          `can not be greater than ${AMOUNT_MAX.toString()}`
        );
      }

      return t.success(bn);
    } catch (e) {
      return t.failure(input, context, 'can not be negative');
    }
  },
  a => a.toString()
);

export const signatureIndexT = new t.Type<number, number, unknown>(
  'signatureIndex',
  (input: unknown): input is number => typeof input === 'number',
  (input, context) => {
    if (typeof input !== 'number') {
      return t.failure(input, context, 'not a number');
    }

    if (input < 0) {
      return t.failure(input, context, 'must be positive');
    }

    return t.success(input);
  },
  t.identity
);

export const outputT = t.type({
  address: addressT,
  amount: amountT,
});

export const byteT = new t.Type<number, number, unknown>(
  'byte',
  (input: unknown): input is number => typeof input === 'number',
  (input, context) => {
    if (typeof input !== 'number') {
      return t.failure(input, context, 'not a number');
    }

    if (input < 0 || input >= 256) {
      return t.failure(input, context, 'does not fit in 0<=N<256');
    }

    return t.success(input);
  },
  t.identity
);

export const transactionT = t.exact(
  t.type({
    sourceAddress: addressT,
    sourceAmount: amountT,
    outputs: t.array(outputT),
    networkByte: t.union([byteT, t.undefined]),
    data: t.union([t.string, t.undefined]),
    transactionFee: t.union([amountT, t.undefined]),
    txId: t.union([t.string, t.undefined]),
    type: t.union([t.number, t.undefined]),
  })
);

export const signatureT = new t.Type<Signature, string, unknown>(
  'signature',
  (input: unknown): input is Signature => typeof input === 'string',
  (input, context) => {
    if (typeof input !== 'string') {
      return t.failure(input, context, 'not a string');
    }

    try {
      return t.success(Signature.fromStringHex(input));
    } catch (e) {
      return t.failure(input, context, e);
    }
  },
  a => a.toStringHex()
);

export const publicKeyT = new t.Type<PublicKey, string, unknown>(
  'signature',
  (input: unknown): input is PublicKey => typeof input === 'string',
  (input, context) => {
    if (typeof input !== 'string') {
      return t.failure(input, context, 'not a string');
    }

    try {
      return t.success(PublicKey.fromStringHex(input));
    } catch (e) {
      return t.failure(input, context, e);
    }
  },
  a => a.toStringHex()
);

export const privateKeyT = new t.Type<PrivateKey, string, unknown>(
  'signature',
  (input: unknown): input is PrivateKey => typeof input === 'string',
  (input, context) => {
    if (typeof input !== 'string') {
      return t.failure(input, context, 'not a string');
    }

    try {
      return t.success(PrivateKey.fromStringHex(input));
    } catch (e) {
      return t.failure(input, context, e);
    }
  },
  a => a.toStringHex()
);

export const signedTransactionT = t.exact(
  t.type({
    signature: signatureT,
    publicKey: publicKeyT,
    signatureIndex: signatureIndexT,
    transaction: transactionT,
  })
);

// tslint:disable-next-line:variable-name
export const ThrowReporter: Reporter<void> = {
  report: validation => {
    if (isLeft(validation)) {
      throw new Error(PathReporter.report(validation).join('\n'));
    }
  },
};
