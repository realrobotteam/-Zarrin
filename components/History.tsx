
import React, { useState } from 'react';
import { Search, Filter, ArrowDownCircle, ArrowUpCircle, FileText } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface HistoryProps {
  transactions: Transaction[];
}

const History: React.FC<HistoryProps> = ({ transactions }) => {
  const [filter, setFilter] = useState('ALL');

  const filteredData = transactions.filter(tx => {
    if (filter === 'ALL') return true;
    return tx.type === filter;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-amber-500 flex items-center gap-2">
          <FileText size={24} /> گردش حساب و تاریخچه معاملات
        </h2>
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
          {['ALL', 'BUY', 'SELL', 'DEPOSIT'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {f === 'ALL' ? 'همه' : f === 'BUY' ? 'خرید' : f === 'SELL' ? 'فروش' : 'واریز'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400">
                <th className="p-4 font-medium">تاریخ و زمان</th>
                <th className="p-4 font-medium">نوع تراکنش</th>
                <th className="p-4 font-medium">شرح</th>
                <th className="p-4 font-medium">مقدار (طلا)</th>
                <th className="p-4 font-medium">مبلغ (ریال)</th>
                <th className="p-4 font-medium">مانده ریالی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredData.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center text-slate-500 italic">موردی برای نمایش یافت نشد.</td></tr>
              ) : (
                filteredData.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="p-4 text-slate-400 text-xs">
                      {tx.timestamp.toLocaleDateString('fa-IR')} <span className="opacity-50">| {tx.timestamp.toLocaleTimeString('fa-IR')}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {tx.type === TransactionType.BUY ? <ArrowDownCircle size={16} className="text-emerald-500" /> : <ArrowUpCircle size={16} className="text-rose-500" />}
                        <span className={tx.type === TransactionType.BUY ? 'text-emerald-500' : 'text-rose-500'}>
                          {tx.type === TransactionType.BUY ? 'خرید طلا' : tx.type === TransactionType.SELL ? 'فروش طلا' : 'واریز وجه'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      معامله طلا به نرخ {tx.pricePerGram.toLocaleString()} ریال
                    </td>
                    <td className="p-4 font-mono font-bold text-amber-100">{tx.amountGold > 0 ? tx.amountGold.toFixed(3) : '-'}</td>
                    <td className={`p-4 font-mono ${tx.type === TransactionType.BUY ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {tx.amountIRR.toLocaleString()}
                    </td>
                    <td className="p-4 text-amber-500 font-mono">{tx.balanceAfterIRR.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
