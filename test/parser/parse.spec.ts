import { Sha256Hash, VbkBlock, VBlakeHash } from '../../src/parser/entities';
import { Int16, Int32 } from '@1-corp/fixed-size-numbers-ts/lib/Int';

describe('parse vtv', ()=> {
  it('new block from arguments', () => {
    const block: VbkBlock = {
      height: Int32(5000),
      version: Int16(2),
      previousBlock: VBlakeHash.fromHex("00000000000062948EA92EB694E7DC3E3BE21A96ECCF0FBD"),
      previousKeystone:VBlakeHash.fromHex("00000000000082396E1549F40989D4F5F62A3331DC995C36"),
      secondPreviousKeystone: VBlakeHash.fromHex("00000000000023A90C8B0DFE7C55C1B0935637860679DDD5"),
      merkleRoot: Sha256Hash.fromHex("DB0F135312B2C27867C9A83EF1B99B981ACBE73C1380F6DD"),
      timestamp: Int32(1553699987),
      difficulty: Int32(117586646),
      nonce: Int32(1924857207)
    } as VbkBlock;


  })
})
