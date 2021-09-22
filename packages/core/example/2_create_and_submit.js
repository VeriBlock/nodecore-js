const axios = require('axios');
const {
  tryDeserializeTransaction,
  trySerializeSignedTransaction,
  signTransaction,
  KeyPair,
  PrivateKey,
} = require('../build/node/src');

// Testnet keypair
// Private key: 303e020100301006072a8648ce3d020106052b8104000a042730250201010420034074f049a8b84774ad432c379e22df7b7a9b48ebb3b3c238f6aad6b8249b09
// Public key : 3056301006072a8648ce3d020106052b8104000a0342000454163b17fbefaebd71162612c11012abe31d8fee9458a0ef2780da3f4e294cccbd887549275c3de9f1fb9db31c67dc74c9ce25fb4590a61f425b96e2ddeb8e67
// Address    : V9Jr1bqi57NzCkfSEJ5mRzW5NA2cQw
const keypair = KeyPair.fromPrivateKey(
  PrivateKey.fromStringHex(
    '303e020100301006072a8648ce3d020106052b8104000a042730250201010420034074f049a8b84774ad432c379e22df7b7a9b48ebb3b3c238f6aad6b8249b09'
  )
);

// or 'mainnet'
const network = 'testnet';
const port = 10600
const host = '127.0.0.1'; // full node address
const addr = `http://${host}:${port}/api`;

//////////////////////////////////////////////////////////////////////
// some useful RPC calls
const sendJsonrpcRequest = async (method, params = {}) => {
  const { data } = await axios.post(addr, {
    jsonrpc: '2.0',
    method: method,
    params: params,
    id: 1,
  });

  if (data.error !== undefined) {
    throw Error(data.error);
  }

  return data.result;
};

const getsignatureindex = async addresses =>
  sendJsonrpcRequest('getsignatureindex', {
    addresses,
  });

const submittransactions = async txs =>
  sendJsonrpcRequest('submittransactions', {
    transactions: txs.map(tx => ({
      signed: tx,
    })),
  });

// for async/await
(async () => {
  //////////////////////////////////////////////////////////////////////
  //! Create TX
  const rawTx = {
    sourceAddress: keypair.publicKey.getAddress(),
    // 1 VBK with 10k sats fee
    sourceAmount: '100010000',
    outputs: [
      {
        // send to ourselves 1 VBK
        address: keypair.publicKey.getAddress(),
        // 1 VBK
        amount: '100000000',
      },
    ],
  };

  const networkByte = (() => {
    if (network === 'mainnet') return undefined;
    if (network === 'testnet') return 0xaa;
    throw Error('Unknown network');
  })();

  //////////////////////////////////////////////////////////////////////
  //! Query signature index
  const response = await getsignatureindex([keypair.publicKey.getAddress()]);
  const signatureIndex = Number(response.indexes[0].poolIndex);

  const modelTx = tryDeserializeTransaction(rawTx);
  // sign transaction
  const signedModelTx = signTransaction(modelTx, keypair, signatureIndex + 1, networkByte);
  // serialize to raw transaction
  const rawSignedTx = trySerializeSignedTransaction(signedModelTx);

  console.log('Transaction');
  console.log(rawSignedTx);

  //////////////////////////////////////////////////////////////////////
  //! Submit tx
  return submittransactions([rawSignedTx]);
})()
  .then(console.log)
  .catch(e => {
    if (e.response.status === 500) {
      throw Error('Error in Nodecore');
    } else {
      console.error(e);
    }
  });
