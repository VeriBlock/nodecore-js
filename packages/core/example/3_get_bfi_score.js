const axios = require('axios');

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

const gettransaction = async (transactionId) => {
  const defaultSearchLength = 5000; // if transactions is too old this need to be higher. 5000 is enough for recent transaction

  const data = await sendJsonrpcRequest('gettransactions', {
    searchLength: defaultSearchLength,
    ids: [transactionId],
  });

  if (!data.success){
    throw Error(data);
  }

  return data.transactions[0];
};

// for async/await
(async () => {
  //////////////////////////////////////////////////////////////////////
  //! TxId to search
  const transactionId = '75ADB65B16F9BBD1F61E696527B037B50950DD06789A6686B5A43D0BD7D5D8A6';

  //////////////////////////////////////////////////////////////////////
  //! Query to get tx transaction info
  return gettransaction(transactionId);
})()
  .then(result => {
    console.log(`TxID: ${result.transaction.txId}`);
    console.log(`Confirmations: ${result.confirmations}`);
    console.log(`Bitcoin Confirmations: ${result.bitcoinConfirmations}`);
    console.log('---------------------------------------------------------------------------');
    console.log('Full Result:');
    console.log(result);
  })
  .catch(e => {
    if (e.response.status === 500) {
      throw Error('Error in Nodecore');
    } else {
      console.error(e);
    }
  });
