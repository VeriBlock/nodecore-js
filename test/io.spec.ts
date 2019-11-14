import { addressT, amountT, dataT, ThrowReporter } from '../src';

describe('address', () => {
  it('valid', () => {
    expect(() =>
      addressT.decode('V5ZguGxnAckADJMkFFG6Vpr9EGyk6v')
    ).not.toThrow();
  });

  it('invalid', () => {
    expect(() => ThrowReporter.report(addressT.decode('123'))).toThrow();
  });
});

describe('amount', () => {
  it('valid', () => {
    expect(() => amountT.decode('123')).not.toThrow();
  });

  it('too big', () => {
    expect(() =>
      ThrowReporter.report(amountT.decode('99999999999999999999'))
    ).toThrow();
  });

  it('negative', () => {
    expect(() => ThrowReporter.report(amountT.decode('-1'))).toThrow();
  });
});

describe('data', () => {
  it('valid', () => {
    expect(() => dataT.decode('001122aabbcc')).not.toThrow();
  });

  it('not string', () => {
    expect(() => ThrowReporter.report(dataT.decode(123))).toThrow();
  });
});
