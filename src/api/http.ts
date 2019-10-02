import { VeriBlockApi } from '../api';
import { TransactionUnion } from '../transaction';
const jsonrpc = require('json-rpc-client');

export class VeriBlockHttpApi implements VeriBlockApi {
  private client: any;

  constructor(private host: string, private port: number) {
    this.client = new jsonrpc({ port, host });
  }

  async connect(): Promise<void> {
    return this.client.connect();
  }

  async SubmitTransactionsRequest(
    transactions: TransactionUnion[]
  ): Promise<void> {
    return this.client.send('submittransactions', { transactions });
  }
}
