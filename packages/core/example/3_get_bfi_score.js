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

const gettransactions = async (searchLength, addresses) =>
  sendJsonrpcRequest('gettransactions', {
    searchLength,
    ids: addresses,
  });

// for async/await
(async () => {
  //////////////////////////////////////////////////////////////////////
  //! List of TxIds
  const transactionIds = [
    '75ADB65B16F9BBD1F61E696527B037B50950DD06789A6686B5A43D0BD7D5D8A6'
  ];

  const defaultSearchLength = 5000; // if transactions id too old this need to be higher. 5000 is enough for recent transaction (around 5 minutes)

  //////////////////////////////////////////////////////////////////////
  //! Query to get tx(s) info
  return gettransactions(defaultSearchLength, transactionIds);
})()
  .then(getTransactionsReply => {
    if (getTransactionsReply.success){

      getTransactionsReply.transactions.forEach(transaction => {
        console.log('----------------------------------------');
        console.log(`TxID: ${transaction.transaction.txId}`);
        console.log(`Confirmations: ${transaction.confirmations}`);
        console.log(`Bitcoin Confirmations: ${transaction.bitcoinConfirmations}`);
        console.log('----------------------------------------');
      });
    } else {
      console.error("Something wrong happened...");
      console.log(getTransactionsReply);
    }
  })
  .catch(e => {
    if (e.response.status === 500) {
      throw Error('Error in Nodecore');
    } else {
      console.error(e);
    }
  });
