
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, History as HistoryIcon, 
  Clock, ShieldCheck, AlertCircle, RefreshCw, BarChart3, Info
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { User, GoldPrice, Transaction, TransactionType } from '../types';
import { INITIAL_PRICE, MOCK_USER, CHART_DATA } from '../constants';
import { getMarketAnalysis } from '../services/geminiService';

interface DashboardProps {
  isAdmin: boolean;
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ isAdmin, transactions, onAddTransaction }) => {
  const [user, setUser] = useState<User>(MOCK_USER);
  const [prices, setPrices] = useState<GoldPrice>(INITIAL_PRICE);
  const [freezeTime, setFreezeTime] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const [analysis, setAnalysis] = useState<string>('در حال آماده‌سازی تحلیل بازار...');
  const [tradeAmount, setTradeAmount] = useState<string>('');
  const [notifications, setNotifications] = useState<{id: number, msg: string}[]>([]);

  // Price Simulation
  useEffect(() => {
    if (isFrozen) return;
    const interval = setInterval(() => {
      setPrices(prev => ({
        ...prev,
        buy: prev.buy + (Math.random() - 0.5) * 60000,
        sell: prev.sell + (Math.random() - 0.5) * 60000,
        base18k: prev.base18k + (Math.random() - 0.5) * 35000,
        timestamp: Date.now()
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, [isFrozen]);

  // Frequency-limited AI analysis
  useEffect(() => {
    const fetchAnalysis = async () => {
      const result = await getMarketAnalysis(prices.buy);
      setAnalysis(result);
    };

    // Initial fetch
    fetchAnalysis();

    // Refresh analysis every 5 minutes only, instead of reacting to price fluctuations
    const analysisInterval = setInterval(fetchAnalysis, 300000);
    return () => clearInterval(analysisInterval);
  }, []); // Only run on mount and then use internal interval

  const addNotification = (msg: string) => {
    const id = Date.now();
    setNotifications(prev => [{id, msg}, ...prev]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  };

  const handleFreeze = () => {
    setIsFrozen(true);
    setFreezeTime(10);
  };

  useEffect(() => {
    if (freezeTime > 0) {
      const timer = setTimeout(() => setFreezeTime(freezeTime - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsFrozen(false);
    }
  }, [freezeTime]);

  const executeTrade = (type: TransactionType) => {
    const amount = parseFloat(tradeAmount);
    if (!amount || amount <= 0) {
      addNotification("لطفاً مقدار معتبر وارد کنید.");
      return;
    }

    const currentRate = type === TransactionType.BUY ? prices.sell : prices.buy;
    const totalCost = amount * (currentRate / 4.3318);
    
    if (type === TransactionType.BUY && user.balanceIRR < totalCost) {
      addNotification("موجودی ریالی کافی نیست!");
      return;
    }
    if (type === TransactionType.SELL && user.balanceGold < amount) {
      addNotification("موجودی طلایی کافی نیست!");
      return;
    }

    const newBalanceGold = type === TransactionType.BUY ? user.balanceGold + amount : user.balanceGold - amount;
    const newBalanceIRR = type === TransactionType.BUY ? user.balanceIRR - totalCost : user.balanceIRR + totalCost;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: user.id,
      type,
      amountGold: amount,
      amountIRR: totalCost,
      pricePerGram: currentRate,
      timestamp: new Date(),
      status: 'COMPLETED',
      balanceAfterGold: newBalanceGold,
      balanceAfterIRR: newBalanceIRR
    };

    onAddTransaction(newTx);
    setUser(prev => ({ ...prev, balanceIRR: newBalanceIRR, balanceGold: newBalanceGold }));
    addNotification(`معامله ${type === TransactionType.BUY ? 'خرید' : 'فروش'} با موفقیت انجام شد.`);
    setTradeAmount('');
    setIsFrozen(false);
    setFreezeTime(0);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-xs font-bold">موجودی ریالی</span>
            <Wallet className="text-amber-500" size={18} />
          </div>
          <div className="text-2xl font-black text-amber-100 font-mono">
            {user.balanceIRR.toLocaleString()} <span className="text-[10px] text-amber-500">ریال</span>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-xs font-bold">موجودی طلایی</span>
            <div className="w-4 h-4 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50" />
          </div>
          <div className="text-2xl font-black text-amber-100 font-mono">
            {user.balanceGold.toFixed(3)} <span className="text-[10px] text-amber-500">گرم</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-amber-800 p-6 rounded-2xl shadow-xl text-white">
          <div className="flex items-center gap-2 mb-2 font-bold">
            <ShieldCheck size={18} /> حساب تایید شده
          </div>
          <div className="text-[10px] opacity-80 mb-4">تمامی قابلیت‌های خرید و فروش برای شما فعال است.</div>
          <div className="flex justify-between text-[10px]">
            <span>بدهکاری: ۰</span>
            <span>بستانکاری: ۰</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Charts & History Snippet */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <BarChart3 className="text-amber-500" size={20} /> روند بازار
              </h3>
              <div className="flex gap-2 text-[10px]">
                <button className="bg-slate-700 px-3 py-1 rounded hover:bg-slate-600">۱س</button>
                <button className="bg-amber-500/20 text-amber-500 border border-amber-500/30 px-3 py-1 rounded">۱ر</button>
                <button className="bg-slate-700 px-3 py-1 rounded hover:bg-slate-600">۱ه</button>
              </div>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="#475569" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => (v/1000000).toFixed(1) + 'M'} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="price" stroke="#fbbf24" fill="url(#chartGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-amber-500/20 p-3 rounded-xl">
              <RefreshCw size={20} className="text-amber-500 animate-spin-slow" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-slate-500 font-bold mb-1">دستیار هوشمند زرین (AI)</div>
              <p className="text-xs text-slate-200 italic leading-relaxed">"{analysis}"</p>
            </div>
          </div>
        </div>

        {/* Right: Real-time Trade Board */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 font-bold">نرخ‌های لحظه‌ای</span>
              <span className="flex items-center gap-1 text-emerald-500 animate-pulse">
                <Clock size={12} /> زنده
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl group transition-all hover:bg-emerald-500/10">
                <span className="text-[10px] font-bold text-emerald-500">خرید از شما</span>
                <span className="font-mono text-xl font-black text-slate-100">{prices.buy.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl group transition-all hover:bg-rose-500/10">
                <span className="text-[10px] font-bold text-rose-500">فروش به شما</span>
                <span className="font-mono text-xl font-black text-slate-100">{prices.sell.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="text-[9px] text-slate-600 border-t border-slate-800 pt-3 flex justify-between">
              <span>گرم ۱۸ عیار:</span>
              <span className="text-slate-400">{(prices.base18k/4.3318).toLocaleString(undefined, {maximumFractionDigits: 0})} ریال</span>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp size={18} className="text-amber-500" /> ثبت معامله سریع
            </h3>
            <div className="relative">
              <input 
                type="number"
                placeholder="وزن طلا به گرم..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 pr-10 focus:ring-1 focus:ring-amber-500 outline-none text-amber-100 transition-all"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
              />
              <span className="absolute left-3 top-3.5 text-slate-500 text-[10px]">G</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => executeTrade(TransactionType.BUY)}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-black py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
              >
                خرید
              </button>
              <button 
                onClick={() => executeTrade(TransactionType.SELL)}
                className="bg-rose-600 hover:bg-rose-500 text-slate-900 font-black py-3 rounded-xl transition-all shadow-lg shadow-rose-900/20 active:scale-95"
              >
                فروش
              </button>
            </div>

            <button 
              onClick={handleFreeze}
              disabled={isFrozen}
              className={`w-full py-2.5 rounded-xl text-[10px] font-bold transition-all border flex items-center justify-center gap-2 ${isFrozen ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-slate-700/50 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
            >
              {isFrozen ? (
                <>فریز شده: {freezeTime} ثانیه</>
              ) : (
                <>فریز قیمت (تضمین نرخ)</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3">
        {notifications.map(n => (
          <div key={n.id} className="bg-slate-900 border-r-4 border-amber-500 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
            <Info className="text-amber-500" size={18} />
            <span className="text-xs font-medium text-slate-200">{n.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
