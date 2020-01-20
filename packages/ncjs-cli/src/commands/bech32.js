const { Command, flags } = require('@oclif/command');
const bech32 = require('bech32-buffer');

function decodeBitcoinAddress(address) {
  const decoded = bech32.decodeTo5BitArray(address);
  return {
    prefix: decoded.prefix, // should equal `bc` or `tb` for valid addresses
    version: decoded.data[0], // should equal 0 for currently supported addresses
    script: bech32.from5BitArray(decoded.data.subarray(1)), // should have length 20 or 32
  };
}

class Bech32Command extends Command {
  async run() {
    const { flags } = this.parse(Bech32Command);
    const decode = flags.decode;
    const encode = flags.encode;

    if (decode !== undefined) {
      const { prefix, version, script} = decodeBitcoinAddress(decode);
      const buf = Buffer.from(script).toString('hex');
      this.log(`prefix : ${prefix}`);
      this.log(`version: ${version}`);
      this.log(`script : ${buf}`);
      return this.exit(0);
    }

    if (encode !== undefined) {
      const version = flags.version;
      const prefix = flags.prefix || '';
      const data = Buffer.concat([Buffer.from([version]), bech32.to5BitArray(Buffer.from(encode, 'hex'))]);
      const encoded = bech32.encode5BitArray(prefix, data);
      this.log(`encoded: ${encoded}`);
      return this.exit(0);
    }

    await Bech32Command.run(['-h']);
  }
}

Bech32Command.description = `Bech32 utils.
`;

Bech32Command.flags = {
  help: flags.help({ char: 'h' }),
  decode: flags.string({
    char: 'd',
    description: 'decode bech32 string',
    exclusive: ['encode'],
  }),
  encode: flags.string({
    char: 'e',
    description: 'encode hex string into bech32',
    exclusive: ['decode'],
    dependsOn: ['prefix', 'version']
  }),
  prefix: flags.string({
    char: 'p',
    description: 'human-readable prefix for bech32 encoding',
    dependsOn: ['encode', 'prefix'],
  }),
  version: flags.string({
    char: 'v',
    description: 'segwit version',
    dependsOn: ['encode', 'prefix']
  })
};

module.exports = Bech32Command;
