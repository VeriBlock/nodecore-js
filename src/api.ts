import { TransactionUnion } from './transaction';

export interface VeriBlockApi {
  connect() : Promise<void>;
  SubmitTransactionsRequest(transactions: TransactionUnion[]): Promise<void>;
}

