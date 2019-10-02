import {isAddressValid} from "./address";

test('valid address is valid', () => {
  const validAddress = 'V44i36pPHyhaiW695Xg8PEos4G2PrC';
  const val = isAddressValid(validAddress);
  expect(val).toEqual(true);
});
