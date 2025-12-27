
import { GoldPrice, User, UserStatus } from './types';

export const INITIAL_PRICE: GoldPrice = {
  buy: 43500000,
  sell: 43850000,
  base18k: 43250000,
  timestamp: Date.now(),
};

// Added debtIRR and creditIRR to match User interface
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
  { time: '08:00', price: 43200000 },
  { time: '09:00', price: 43350000 },
  { time: '10:00', price: 43500000 },
  { time: '11:00', price: 43450000 },
  { time: '12:00', price: 43600000 },
  { time: '13:00', price: 43750000 },
  { time: '14:00', price: 43850000 },
  { time: '15:00', price: 43700000 },
];
