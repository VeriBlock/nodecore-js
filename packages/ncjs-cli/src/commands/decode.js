const {
  ReadStream,
  ATV,
  VTB,
  BtcBlock,
  VbkBlock,
  BtcTx,
  Address,
  Coin,
  Output,
  PublicationData,
  VbkMerklePath,
  MerklePath,
  VbkPopTx,
  VbkTx,
  Sha256Hash,
} = require('@veriblock/nodecore-parser');

const { Command, flags } = require('@oclif/command');

const entitiesRead = [
  'vtb',
  'atv',
  'address',
  'btctx',
  'coin',
  'output',
  'publicationdata',
  'vbkmerklepath',
  'vbkblock',
  'vbktx',
  'vbkpoptx',
];

const entitiesReadExtract = ['merklepath', 'btcblock', 'vbkblock'];

const entitiesAll = [...entitiesRead, ...entitiesReadExtract];

const streamWrap = f => {
  return str => {
    const buf = Buffer.from(str, 'hex');
    const stream = new ReadStream(buf);
    return f(stream);
  };
};

const entitiesReadParsers = {
  vtb: streamWrap(VTB.read),
  atv: streamWrap(ATV.read),
  address: streamWrap(Address.read),
  btctx: streamWrap(BtcTx.read),
  coin: streamWrap(Coin.read),
  output: streamWrap(Output.read),
  publicationdata: streamWrap(PublicationData.read),
  vbkmerklepath: streamWrap(VbkMerklePath.read),
  vbkblock: streamWrap(VbkBlock.read),
  vbktx: streamWrap(VbkTx.read),
  vbkpoptx: streamWrap(VbkPopTx.read),
};

const entityFlag = name =>
  flags.build({
    description: `hexencoded ${name.toUpperCase()}`,
    exclusive: entitiesAll.filter(f => f !== name),
  });

class DecodeCommand extends Command {
  async run() {
    const { flags } = this.parse(DecodeCommand);

    if (Object.keys(flags).length === 0) {
      await DecodeCommand.run(['-h']);
      return this.exit(0);
    }

    const extractOrRead = (flag, extract, read) => {
      // @ts-ignore
      const raw = flags.raw;

      let json;
      if (raw) {
        json = streamWrap(extract)(flag);
      } else {
        json = streamWrap(read)(flag);
      }

      this.log(JSON.stringify(json, null, 2));
      return this.exit(0);
    };

    if ('vbkblock' in flags) {
      return extractOrRead(flags.vbkblock, VbkBlock.extract, VbkBlock.read);
    }

    if ('merklepath' in flags) {
      // @ts-ignore
      const subject = Sha256Hash.fromHex(flags.subject);
      return extractOrRead(
        flags.merklepath,
        s => MerklePath.extract(s, subject),
        s => MerklePath.read(s, subject)
      );
    }

    if ('btcblock' in flags) {
      return extractOrRead(flags.btcblock, BtcBlock.extract, BtcBlock.read);
    }

    const key = Object.keys(flags)[0];
    // @ts-ignore
    if (entitiesReadParsers[key] === undefined) {
      this.error('Unknown entity type');
      return this.exit(1);
    }

    // @ts-ignore
    const json = entitiesReadParsers[key](flags[key]);
    this.log(JSON.stringify(json, null, 2));
    return this.exit(0);
  }
}

DecodeCommand.description = `Decode command decodes entities stored as VBK-encoded byte arrays.`;

DecodeCommand.examples = `$ ncjs-cli decode --address 01166772F51AB208D32771AB1506970EEB664462730B838E
$ ncjs-cli decode --raw --btcblock 000040203f8e3980304439d853c302f6e496285e110e251251531300000000000000000039a72c22268381bd8d9dcfe002f472634a24cf0454de8b50f89e10891e5ffb1de08d9b5c6c1f2c1744290a92
$ ncjs-cli decode --btcblock 50000040203f8e3980304439d853c302f6e496285e110e251251531300000000000000000039a72c22268381bd8d9dcfe002f472634a24cf0454de8b50f89e10891e5ffb1de08d9b5c6c1f2c1744290a92
$ ncjs-cli decode --subject 94E097B110BA3ADBB7B6C4C599D31D675DE7BE6E722407410C08EF352BE585F1 --merklepath <...>
`;

DecodeCommand.flags = entitiesRead.reduce(
  (acc, cur) => {
    acc[cur] = entityFlag(cur)();
    return acc;
  },
  {
    help: flags.help({ char: 'h' }),
    raw: flags.boolean({
      description: 'Use raw (non-VBK) encoding when possible',
    }),
    subject: flags.string({
      description:
        'Manually specified MerklePath subject (32 bytes hexencoded hash)',
    }),
    merklepath: entityFlag('merklepath')({ dependsOn: ['subject'] }),
    btcblock: entityFlag('btcblock')(),
  }
);

module.exports = DecodeCommand;
