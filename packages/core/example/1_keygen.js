const nc = require("@veriblock/nodecore-js")
const keypair = nc.KeyPair.generate()

console.log(`Private key: ${keypair.privateKey.toStringHex()}`)
console.log(`Public key : ${keypair.publicKey.toStringHex()}`)
console.log(`Address    : ${keypair.publicKey.getAddress()}`)
