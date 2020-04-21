const { Command, flags } = require('@oclif/command');
const util = require('../util');

const formatVbkBlock = block => {
  return `height=${block.height}`;
};

const formatBtcBlock = block => {
  return `time=${block.timestamp}`;
};

const formatContext = (ctx, formatBlock) => {
  if (ctx.length === 0) {
    return `<empty>`;
  } else {
    return `Size: ${ctx.length}\tFirst: ${formatBlock(
      ctx[0]
    )}\tLast: ${formatBlock(ctx[ctx.length - 1])}`;
  }
};

class PrintcontextCommand extends Command {
  async run() {
    const { flags } = this.parse(PrintcontextCommand);
    const { atv, vtbs } = await util.readPopPublications(process.stdin);

    this.log(
      `ATV:
  - VBK ctx: ${formatContext(
    atv.context,
    formatVbkBlock
  )}\tContaining: ${formatVbkBlock(atv.containingBlock)}`
    );
    vtbs.forEach((v, index) => {
      this.log(
        `VTB${index}:
  - VBK ctx: ${formatContext(
    v.context,
    formatVbkBlock
  )}\tContaining: ${formatVbkBlock(v.containingBlock)}
  - BTC ctx: ${formatContext(
    v.transaction.blockOfProofContext,
    formatBtcBlock
  )}\tContaining: ${formatBtcBlock(v.transaction.blockOfProof)}`
      );
    });
  }
}

PrintcontextCommand.description = `Print context details of ALT POP TX.

Reads STDIN. Expects to get JSON of ALT POP TX.
This command parses payloads and outputs context in human-readable form.
`;

PrintcontextCommand.flags = {};

module.exports = PrintcontextCommand;
