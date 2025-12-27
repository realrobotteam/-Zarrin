
export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
  DEPOSIT = 'DEPOSIT', // واریز ریالی
  WITHDRAW = 'WITHDRAW' // برداشت ریالی
}

export interface User {
  id: string;
  name: string;
  phone: string;
  status: UserStatus;
  balanceIRR: number;
  balanceGold: number;
  debtIRR: number; // بدهکاری ریالی
  creditIRR: number; // بستانکاری ریالی
  nationalId?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amountGold: number;
  amountIRR: number;
  pricePerGram: number;
  timestamp: Date;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  balanceAfterGold: number;
  balanceAfterIRR: number;
}

export interface GoldPrice {
  buy: number;
  sell: number;
  base18k: number;
  timestamp: number;
}

export interface TransferRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  trackingCode: string;
  timestamp: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  description?: string;
}
