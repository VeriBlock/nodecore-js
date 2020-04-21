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
ncjs-cli/1.4.1 linux-x64 node-v13.12.0
$ ncjs-cli --help [COMMAND]
USAGE
  $ ncjs-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ncjs-cli bech32`](#ncjs-cli-bech32)
* [`ncjs-cli decode`](#ncjs-cli-decode)
* [`ncjs-cli dumppublications`](#ncjs-cli-dumppublications)
* [`ncjs-cli help [COMMAND]`](#ncjs-cli-help-command)
* [`ncjs-cli printcontext`](#ncjs-cli-printcontext)

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

_See code: [src/commands/bech32.js](https://github.com/VeriBlock/nodecore-js/blob/v1.4.1/src/commands/bech32.js)_

## `ncjs-cli decode`

Decode command decodes entities stored as VBK-encoded byte arrays.

```
USAGE
  $ ncjs-cli decode

OPTIONS
  -h, --help                         show CLI help
  --address=address                  hexencoded ADDRESS
  --atv=atv                          hexencoded ATV
  --btcblock=btcblock                hexencoded BTCBLOCK
  --btctx=btctx                      hexencoded BTCTX
  --coin=coin                        hexencoded COIN
  --merklepath=merklepath            hexencoded MERKLEPATH
  --output=output                    hexencoded OUTPUT
  --publicationdata=publicationdata  hexencoded PUBLICATIONDATA
  --raw                              Use raw (non-VBK) encoding when possible
  --subject=subject                  Manually specified MerklePath subject (32 bytes hexencoded hash)
  --vbkblock=vbkblock                hexencoded VBKBLOCK
  --vbkmerklepath=vbkmerklepath      hexencoded VBKMERKLEPATH
  --vbkpoptx=vbkpoptx                hexencoded VBKPOPTX
  --vbktx=vbktx                      hexencoded VBKTX
  --vtb=vtb                          hexencoded VTB

EXAMPLES
  $ ncjs-cli decode --address 01166772F51AB208D32771AB1506970EEB664462730B838E
  $ ncjs-cli decode --raw --btcblock 
  000040203f8e3980304439d853c302f6e496285e110e251251531300000000000000000039a72c22268381bd8d9dcfe002f472634a24cf0454de8b
  50f89e10891e5ffb1de08d9b5c6c1f2c1744290a92
  $ ncjs-cli decode --btcblock 
  50000040203f8e3980304439d853c302f6e496285e110e251251531300000000000000000039a72c22268381bd8d9dcfe002f472634a24cf0454de
  8b50f89e10891e5ffb1de08d9b5c6c1f2c1744290a92
  $ ncjs-cli decode --subject 94E097B110BA3ADBB7B6C4C599D31D675DE7BE6E722407410C08EF352BE585F1 --merklepath <...>
```

_See code: [src/commands/decode.js](https://github.com/VeriBlock/nodecore-js/blob/v1.4.1/src/commands/decode.js)_

## `ncjs-cli dumppublications`

Dumps publications from a ALT POP TX.

```
USAGE
  $ ncjs-cli dumppublications

OPTIONS
  -o, --file=file  output file (default: payloads.json)
```

_See code: [src/commands/dumppublications.js](https://github.com/VeriBlock/nodecore-js/blob/v1.4.1/src/commands/dumppublications.js)_

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

## `ncjs-cli printcontext`

Print context details of ALT POP TX.

```
USAGE
  $ ncjs-cli printcontext

DESCRIPTION
  Reads STDIN. Expects to get JSON of ALT POP TX.
  This command parses payloads and outputs context in human-readable form.
```

_See code: [src/commands/printcontext.js](https://github.com/VeriBlock/nodecore-js/blob/v1.4.1/src/commands/printcontext.js)_
<!-- commandsstop -->
