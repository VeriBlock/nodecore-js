const axios = require('axios');
const BigNumber = require('bignumber.js');
const {
  tryDeserializeTransactionOutputs,
  KeyPair,
  calculateFee
} = require('../build/node/src');

BigNumber.prototype[require('util').inspect.custom] = BigNumber.prototype.valueOf;

// Testnet keypair
// Private key: 303e020100301006072a8648ce3d020106052b8104000a042730250201010420034074f049a8b84774ad432c379e22df7b7a9b48ebb3b3c238f6aad6b8249b09
// Public key : 3056301006072a8648ce3d020106052b8104000a0342000454163b17fbefaebd71162612c11012abe31d8fee9458a0ef2780da3f4e294cccbd887549275c3de9f1fb9db31c67dc74c9ce25fb4590a61f425b96e2ddeb8e67
// Address    : V9Jr1bqi57NzCkfSEJ5mRzW5NA2cQw
const keypair = KeyPair.importFromNodecorePrivateKey(
  '303e020100301006072a8648ce3d020106052b8104000a042730250201010420034074f049a8b84774ad432c379e22df7b7a9b48ebb3b3c238f6aad6b8249b09'
);

const port = 10600
const host = '95.216.252.205'; // full node address
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

// for async/await
(async () => {
  //////////////////////////////////////////////////////////////////////
  //! Create TX
  const rawTx = {
    sourceAddress: keypair.publicKey.getAddress(),
    // sum of outputs amount without fee
    sourceAmount: '1500000000',
    outputs: [
      {
        address: 'VCea32PtTGh7qDEXp9KFh1xGx9USvh',
        amount: '100000000',
      },
      {
        address: 'VCPVMPth5P4mYeacrhy2dMdZdHSscD',
        amount: '200000000',
      },
      {
        address: 'V6ANstk3uoc6oP9gEboXv7ajA7U9fo',
        amount: '300000000',
      },
      {
        address: 'V6RFmnA9sHiQmm28CUJ3UuUT7CC3Wq',
        amount: '400000000',
      },
      {
        address: 'VAz4e7QwZu9wwXQfjFzVtLv5e7PTcv',
        amount: '500000000',
      },
    ],
  };

  //////////////////////////////////////////////////////////////////////
  //! Query signature index
  const response = await getsignatureindex([keypair.publicKey.getAddress()]);
  const signatureIndex = Number(response.indexes[0].poolIndex);

  const modelOutputTx = tryDeserializeTransactionOutputs(rawTx.outputs);

  const transactionFee = calculateFee(modelOutputTx, signatureIndex + 1);

  console.log('Transaction Fee');
  console.log(`${transactionFee}\n`);

  //! add fee to source amount 
  rawTx.sourceAmount = BigNumber(rawTx.sourceAmount).plus(transactionFee).valueOf();

  return rawTx;
})()
  .then(result => {
    console.log('Transaction');
    console.log(result);
  })
  .catch(e => {
    if (e.response.status === 500) {
      throw Error('Error in Nodecore');
    } else {
      console.error(e);
    }
  });
