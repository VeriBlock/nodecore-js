# nodecore-js
JavaScript libraries for nodecore repo.

## workflow

## examples

1. `KeyPair.generate`
    ```
    // case 1: generate
    var pair = VeriBlock.crypto.KeyPair.generate();

    pair.privateKey.toStringHex();
    // >> "303e020100301006072a8648ce3d020106052b8104000a0427302502010104203abf83fa470423d4788a760ef6b7aae1dacf98784b0646057a0adca24e522acb"

    pair.publicKey.toStringHex();
    // >> "3056301006072a8648ce3d020106052b8104000a034200042fca63a20cb5208c2a55ff5099ca1966b7f52e687600784d1de062c1dd9c8a5fe55b2ba5d906c703d37cbd02ecd9c97a806110fa05d9014a102a0513dd354ec5"

    // case 2: load from Base64
    var privB64 = "MD4CAQAwEAYHKoZIzj0CAQYFK4EEAAoEJzAlAgEBBCBt1BlBZ72kP3RJKyfcZJ1iVqcHbQ4UxUdNb2aXFHStjw=="
    var priv    = VeriBlock.crypto.PrivateKey.fromStringBase64(privB64)
    var pair    = VeriBlock.crypto.KeyPair.fromPrivateKey(priv)

    // case 3: load from HEX
    var privHex = "303e020100301006072a8648ce3d020106052b8104000a0427302502010104203abf83fa470423d4788a760ef6b7aae1dacf98784b0646057a0adca24e522acb"
    var priv    = VeriBlock.crypto.PrivateKey.fromStringHex(privHex)
    var pair    = VeriBlock.crypto.KeyPair.fromPrivateKey(priv)

    ```
2. `addressFromPublicKey`
    ```
    var pkB64 = pair.publicKey.asn1.toString('base64');
    // >> "MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAE1r7HRAAW+24m0hklQ7w38k9a4Wdnke2YFo5z9ywxQPAEzrEnn1FsqWosA11BmVhsude4812DS2Y+ymzc2wgBow=="
    var pkBytes = VeriBlock.util.bufferFromBase64(pkB64)

    var address = VeriBlock.address.addressFromPublicKey(pkBytes)
    // >> "V8V11ezRvC8zxiWwuS1Kkw1D8C8mQ4"
    //
    // same as
    VeriBlock.address.addressFromPublicKey(pair.publicKey._full)
    ```
2. `isValidStandardAddress`
    ```
    address = "V8V11ezRvC8zxiWwuS1Kkw1D8C8mQ4"
    VeriBlock.address.isValidStandardAddress(address)
    // >> true
    ```

3. `sign`
    ```
    var msg       = "Hello world";
    var msgBytes  = VeriBlock.util.bufferFromUtf8(msg)
    var signature = VeriBlock.crypto.SHA256withECDSA.sign(msg, privateKey)

    signature.toStringHex()
    // "3044022008d07afee77324d0bced6f3bce19892d0413981e83e68401cd83d1e1ed3bc37c022005273429062dcf623ccd04c8d9c9e601e7fc45b5db32900c9b0ffda2dbc8f452"    
    ```
4. `verify` signature
    ```
    VeriBlock.crypto.SHA256withECDSA.verify(msgBytes, signature, pair.publicKey)
    // >> true
    ```
