
import { GoldPrice, User, UserStatus } from './types';

export const INITIAL_PRICE: GoldPrice = {
  buy: 43500000,
  sell: 43850000,
  base18k: 43250000,
  timestamp: Date.now(),
};

export const MOCK_USER: User = {
  id: 'user-1',
  name: 'علی احمدی',
  phone: '09123456789',
  status: UserStatus.APPROVED,
  balanceIRR: 1500000000,
  balanceGold: 125.45,
  debtIRR: 0,
  creditIRR: 0,
  nationalId: '1234567890'
};

export const CHART_DATA = [
  { time: '08:00', price: 43200000, open: 43100000, close: 43200000, high: 43250000, low: 43050000 },
  { time: '09:00', price: 43350000, open: 43200000, close: 43350000, high: 43400000, low: 43150000 },
  { time: '10:00', price: 43500000, open: 43350000, close: 43500000, high: 43550000, low: 43300000 },
  { time: '11:00', price: 43450000, open: 43500000, close: 43450000, high: 43520000, low: 43400000 },
  { time: '12:00', price: 43600000, open: 43450000, close: 43600000, high: 43650000, low: 43420000 },
  { time: '13:00', price: 43750000, open: 43600000, close: 43750000, high: 43800000, low: 43580000 },
  { time: '14:00', price: 43850000, open: 43750000, close: 43850000, high: 43900000, low: 43700000 },
  { time: '15:00', price: 43700000, open: 43850000, close: 43700000, high: 43880000, low: 43650000 },
];
