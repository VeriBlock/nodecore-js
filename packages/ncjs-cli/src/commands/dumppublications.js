const {Command, flags} = require('@oclif/command')
const util = require('../util')
const fs = require('fs');

class DumppublicationsCommand extends Command {
  async run() {
    const {flags} = this.parse(DumppublicationsCommand)
    const file = flags.file || "payloads.json"
    const {atvhex, vtbshex} = await util.readPopPublications(process.stdin);

    const data = {
      "atv": atvhex,
      "vtbs": vtbshex
    }

    const out = JSON.stringify(data, null, 2);

    fs.writeFileSync(file, out);
    this.log(`DONE: Written to ${file}`);
  }
}

DumppublicationsCommand.description = `Dumps publications from a ALT POP TX.
`

DumppublicationsCommand.flags = {
  file: flags.string({char: 'o', description: 'output file (default: payloads.json)'}),
}

module.exports = DumppublicationsCommand
