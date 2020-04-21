ncjs-cli
======

NodeCore CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/ncjs-cli.svg)](https://npmjs.org/package/ncjs-cli)
[![Downloads/week](https://img.shields.io/npm/dw/ncjs-cli.svg)](https://npmjs.org/package/ncjs-cli)
[![License](https://img.shields.io/npm/l/ncjs-cli.svg)](https://github.com/VeriBlock/nodecore-js/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g ncjs-cli
$ ncjs-cli COMMAND
running command...
$ ncjs-cli (-v|--version|version)
ncjs-cli/1.4.0 linux-x64 node-v13.12.0
$ ncjs-cli --help [COMMAND]
USAGE
  $ ncjs-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ncjs-cli bech32`](#ncjs-cli-bech32)
* [`ncjs-cli help [COMMAND]`](#ncjs-cli-help-command)

## `ncjs-cli bech32`

Bech32 utils.

```
USAGE
  $ ncjs-cli bech32

OPTIONS
  -d, --decode=decode    decode bech32 string
  -e, --encode=encode    encode hex string into bech32
  -h, --help             show CLI help
  -p, --prefix=prefix    human-readable prefix for bech32 encoding
  -v, --version=version  segwit version
```

_See code: [src/commands/bech32.js](https://github.com/VeriBlock/nodecore-js/blob/v1.4.0/src/commands/bech32.js)_

## `ncjs-cli help [COMMAND]`

display help for ncjs-cli

```
USAGE
  $ ncjs-cli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_
<!-- commandsstop -->
