import { BtcBlock } from '../../src/parser/entities';
import { ReadStream } from '../../src/parser';

describe('btc block', ()=>{
  const blockBuffer = Buffer.from('AAAAIPfeKZWJiACrEJr5Z3m5eaYHFdqb8ru3RbMAAAAAAAAA+FSGAmv06tijekKSUzLsi1U/jjEJdP6h66I4987mFl4iE7dchBoBGi4A8po=', 'base64');
  const stream = new ReadStream(blockBuffer);
  const block = BtcBlock.read(stream);

  const hash = block.getHash();

  expect(hash.data.toString('hex')).toEqual("000000000000000246200f09b513e517a3bd8c591a3b692d9852ddf1ee0f8b3a")

})

// describe('parse vtv', () => {
//   it('new block from arguments', () => {
//     const block: VbkBlock = {
//       height: 5000,
//       version: 2,
//       previousBlock: VBlakeHash.fromHex(
//         '00000000000062948EA92EB694E7DC3E3BE21A96ECCF0FBD'
//       ),
//       previousKeystone: VBlakeHash.fromHex(
//         '00000000000082396E1549F40989D4F5F62A3331DC995C36'
//       ),
//       secondPreviousKeystone: VBlakeHash.fromHex(
//         '00000000000023A90C8B0DFE7C55C1B0935637860679DDD5'
//       ),
//       merkleRoot: Sha256Hash.fromHex(
//         'DB0F135312B2C27867C9A83EF1B99B981ACBE73C1380F6DD'
//       ),
//       timestamp: 1553699987,
//       difficulty: 117586646,
//       nonce: 1924857207,
//     } as VbkBlock;
//   });
// });

