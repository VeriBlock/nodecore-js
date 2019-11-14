# Nodecore-js

TypeScript libraries for nodecore repo. 

### Install

**Node:**
```bash
yarn add @veriblock/nodecore-js
```

**Browser:**
```bash
git clone https://github.com/VeriBlock/nodecore-js
yarn
yarn build:browser
```
Bundle path: `./build/browser.veriblock.js`

## Examples

### Basic
1. `KeyPair.generate`
    ```javascript
    // case 1: generate
    var pair = KeyPair.generate();

    pair.privateKey.toStringHex();
    // >> "303e020100301006072a8648ce3d020106052b8104000a0427302502010104203abf83fa470423d4788a760ef6b7aae1dacf98784b0646057a0adca24e522acb"

    pair.publicKey.toStringHex();
    // >> "3056301006072a8648ce3d020106052b8104000a034200042fca63a20cb5208c2a55ff5099ca1966b7f52e687600784d1de062c1dd9c8a5fe55b2ba5d906c703d37cbd02ecd9c97a806110fa05d9014a102a0513dd354ec5"

    // case 2: load from Base64
    var privB64 = "MD4CAQAwEAYHKoZIzj0CAQYFK4EEAAoEJzAlAgEBBCBt1BlBZ72kP3RJKyfcZJ1iVqcHbQ4UxUdNb2aXFHStjw=="
    var priv    = PrivateKey.fromStringBase64(privB64)
    var pair    = KeyPair.fromPrivateKey(priv)

    // case 3: load from HEX
    var privHex = "303e020100301006072a8648ce3d020106052b8104000a0427302502010104203abf83fa470423d4788a760ef6b7aae1dacf98784b0646057a0adca24e522acb"
    var priv    = PrivateKey.fromStringHex(privHex)
    var pair    = KeyPair.fromPrivateKey(priv)

    ```
2. `addressFromPublicKey`
    ```javascript
    var pkB64 = pair.publicKey.asn1.toString('base64');
    // >> "MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAE1r7HRAAW+24m0hklQ7w38k9a4Wdnke2YFo5z9ywxQPAEzrEnn1FsqWosA11BmVhsude4812DS2Y+ymzc2wgBow=="
    var pkBytes = bufferFromBase64(pkB64)

    var address = addressFromPublicKey(pkBytes)
    // >> "V8V11ezRvC8zxiWwuS1Kkw1D8C8mQ4"
    //
    // same as
    addressFromPublicKey(pair.publicKey._full)
    ```
2. `isValidStandardAddress`
    ```javascript
    address = "V8V11ezRvC8zxiWwuS1Kkw1D8C8mQ4"
    isValidStandardAddress(address)
    // >> true
    ```

3. `sign`
    ```javascript
    var msg       = "Hello world";
    var msgBytes  = bufferFromUtf8(msg)
    var signature = SHA256withECDSA.sign(msg, privateKey)

    signature.toStringHex()
    // "3044022008d07afee77324d0bced6f3bce19892d0413981e83e68401cd83d1e1ed3bc37c022005273429062dcf623ccd04c8d9c9e601e7fc45b5db32900c9b0ffda2dbc8f452"    
    ```
4. `verify` signature
    ```
    SHA256withECDSA.verify(msgBytes, signature, pair.publicKey)
    // >> true
    ```

### JSONRPC API

1. query for signature index
   ```json
    {
      "jsonrpc": "2.0",
      "method": "getsignatureindex",
      "params": {
        "addresses": [
          "V4vxZyZ5oR32Vdmj3SFk4SdJ36NRGX"
        ]
      },
      "id": 123
    }
   ```
    
   ```json
   {
     "jsonrpc": "2.0",
     "result": {
       "indexes": [
         {
           "address": "V4vxZyZ5oR32Vdmj3SFk4SdJ36NRGX",
           "poolIndex": "13",
           "blockchainIndex": "13"
         }
       ],
       "success": true
     },
     "id": 123
   }
    ```

    `poolIndex` is based off of transactions in the mempool, the other is only based on transactions in the actual blockchain.

    If you are creating a new transaction, you will want to use the poolIndex.

2. prepare transaction data
    ```js
    const rawTx = {
        // send VBK from this address
        sourceAddress: 'V4vxZyZ5oR32Vdmj3SFk4SdJ36NRGX',
        // deduct this much units from your balance. 1 VBK = 10**9 units.
        sourceAmount: '100701000',
        outputs: [
          {
            // send 1 VBK = 10**8
            address: 'VAE91zJuku3oiMa7tqZKwo2YQ2UvcD',
            amount: '100000000'
          }
        ],
        // use data field to payload any data as a hex string
        data: '' 
    }
    ```
   
3. prepare a keypair
   ```js
   const privateKeyHex = "303E020100301006072A8648CE3D020106052B8104000A04273025020101042017869E398A7ACD18729B8FC6D47DCFE9C1A2B5871334D00471EFC3985762FF8F";
   const privateKeyBuffer = bufferFromHex(privateKeyHex); 
   const keyPair = KeyPair.fromPrivateKey(privateKeyBuffer);
   ```

4. deserialize rawTx into modelTx, sign it with queried signatureIndex (in our example signatureIndex=13)
   ```js
   // deserialize rawTx
   const modelTx = tryDeserializeTransaction(rawTx); // may throw
   // sign it
   const signedModelTx = signTransaction(modelTx, keyPair, signatureIndex);
   // serialize back to raw signed transaction
   const rawSignedTx = trySerializeSignedTransaction(signedModelTx); // may throw
   ```
   You should get this:
   ```json
     {
       "signature": "3045022100bc6508c47500e3cf5e01d4f0c2709602d479d45d486bf244a499df05dbdb233802204de76c6f126b2ef8343dd18b21551a70497c0c50eed81bfca605c3240a5469f5",
       "publicKey": "3056301006072a8648ce3d020106052b8104000a034200048569053d7b483059100b4c914cce0b39ed3d4b8c70419e9a4f3102a6f9ad62606e6c5085767f4fc83dad5cc5c35e70ce7198b8db0e863ac19e4c20b37a503a5e",
       "signatureIndex": 13,
       "transaction": {
         "transactionFee": "701000",
         "data": "",
         "type": 1,
         "sourceAddress": "V4vxZyZ5oR32Vdmj3SFk4SdJ36NRGX",
         "sourceAmount": "100701000",
         "txId": "ffc717462162ebc5e8730cc82b225f998c878be9fc47eb251ccc948cf2d2d296",
         "outputs": [
           {
             "address": "VAE91zJuku3oiMa7tqZKwo2YQ2UvcD",
             "amount": "100000000"
           }
         ]
       }
     }
   ```

5. send `submittransactions` request
   ```json
   {
     "jsonrpc": "2.0",
     "method": "submittransactions",
     "id": 124,
     "params": {
       "transactions": [
         {
           "signed": {
             "signature": "3045022100bc6508c47500e3cf5e01d4f0c2709602d479d45d486bf244a499df05dbdb233802204de76c6f126b2ef8343dd18b21551a70497c0c50eed81bfca605c3240a5469f5",
             "publicKey": "3056301006072a8648ce3d020106052b8104000a034200048569053d7b483059100b4c914cce0b39ed3d4b8c70419e9a4f3102a6f9ad62606e6c5085767f4fc83dad5cc5c35e70ce7198b8db0e863ac19e4c20b37a503a5e",
             "signatureIndex": 13,
             "transaction": {
               "transactionFee": "701000",
               "data": "",
               "type": 1,
               "sourceAddress": "V4vxZyZ5oR32Vdmj3SFk4SdJ36NRGX",
               "sourceAmount": "100701000",
               "txId": "ffc717462162ebc5e8730cc82b225f998c878be9fc47eb251ccc948cf2d2d296",
               "outputs": [
                 {
                   "address": "VAE91zJuku3oiMa7tqZKwo2YQ2UvcD",
                   "amount": "100000000"
                 }
               ]
             }
           }
         }
       ]
     }
   }
   ```
   ```json
   {
     "jsonrpc": "2.0",
     "result": {
       "success": true
     },
     "id": 124
   }
   ```
