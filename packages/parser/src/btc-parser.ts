import { ReadStream } from './stream';
import { ATV, Publications, VTB } from './entities';
import { BTC_HEADER_SIZE, VBK_HEADER_SIZE } from './const';

export enum Opcode {
  OP_CHECKATV = 0xba,
  OP_CHECKVTB = 0xbb,
  OP_CHECKPOP = 0xbc,
  OP_PUSHDATA4 = 0x4e,
  OP_PUSHDATA2 = 0x4d,
  OP_PUSHDATA1 = 0x4c,
  OP_POPBTCHEADER = 0xbd,
  OP_POPVBKHEADER = 0xbe,
}

interface GetOpRet {
  opcode: Opcode | null;
  pushed?: Buffer;
}

const getOp = (script: ReadStream): GetOpRet => {
  const opcode = script.readUInt8();
  let pushed;
  if (opcode <= Opcode.OP_PUSHDATA4) {
    let size = 0;
    if (opcode < Opcode.OP_PUSHDATA1) {
      size = opcode;
    } else if (opcode === Opcode.OP_PUSHDATA1) {
      size = script.readUInt8();
    } else if (opcode === Opcode.OP_PUSHDATA2) {
      size = script.readUInt16LE();
    } else if (opcode === Opcode.OP_PUSHDATA4) {
      size = script.readUInt32LE();
    }

    pushed = script.read(size);
  }

  return { opcode, pushed };
};

const evalScript = (script: Buffer): Publications => {
  const stack: Buffer[] = [];
  const stream = new ReadStream(script);
  const publications: Publications = new Publications();
  try {
    while (stream.hasMore(1)) {
      const { opcode, pushed } = getOp(stream);
      if (pushed) {
        stack.push(pushed);
        continue;
      }

      switch (opcode) {
        case Opcode.OP_POPBTCHEADER: {
          const header = stack.pop();
          if (!header) {
            throw new Error(`expected BTC header, but stack is empty`);
          }
          if (header.length !== BTC_HEADER_SIZE) {
            throw new Error(
              `expected BTC header of size ${BTC_HEADER_SIZE}, got size ${header.length}`
            );
          }
          publications.context.btc.push(header);
          break;
        }
        case Opcode.OP_POPVBKHEADER: {
          const header = stack.pop();
          if (!header) {
            throw new Error(`expected VBK header, but stack is empty`);
          }

          if (header.length !== VBK_HEADER_SIZE) {
            throw new Error(
              `expected VBK header of size ${VBK_HEADER_SIZE}, got size ${header.length}`
            );
          }

          publications.context.vbk.push(header);
          break;
        }
        case Opcode.OP_CHECKVTB: {
          const vtb = stack.pop();
          if (!vtb) {
            throw new Error(`expected VTB, but stack is empty`);
          }

          publications.vtbshex.push(vtb.toString('hex'));
          publications.vtbs.push(VTB.read(new ReadStream(vtb)));
          break;
        }
        case Opcode.OP_CHECKATV: {
          const atv = stack.pop();
          if (!atv) {
            throw new Error(`expected ATV, but stack is empty`);
          }

          if (publications.atv) {
            throw new Error(`found second ATV`);
          }

          publications.atvhex = atv.toString('hex');
          publications.atv = ATV.read(new ReadStream(atv));
          break;
        }
        case Opcode.OP_CHECKPOP: {
          if (stream.hasMore(1)) {
            throw new Error(
              `unexpected opcode after OP_CHECKPOP (${Opcode.OP_CHECKPOP})`
            );
          }

          if (stack.length !== 0) {
            throw new Error(
              `OP_CHECKPOP is executed, but stack is not empty (not all ATV/VTBs consumed)`
            );
          }
          break;
        }
        default:
          throw new Error(`interpreter found unexpected opcode: ${opcode}`);
      }
    }

    if (!publications.atv) {
      throw new Error(`End of execution: ATV is empty`);
    }
  } catch (e) {
    throw new Error(`Failed to eval BTC script: ${e}`);
  }

  return publications;
};

export const parseBtcScriptSig = (
  buffer: Buffer | string | undefined
): Publications => {
  if (!buffer || buffer.length === 0) {
    throw new Error(`BtcScriptSigParser: empty buffer`);
  }

  if (typeof buffer === 'string') {
    buffer = Buffer.from(buffer, 'hex');
  }

  return evalScript(buffer);
};
