
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, History as HistoryIcon, 
  Clock, ShieldCheck, AlertCircle, RefreshCw, BarChart3, Info, AlertTriangle
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

  // Real-time calculation for visual feedback
  const parsedAmount = parseFloat(tradeAmount) || 0;
  
  const buyCost = useMemo(() => parsedAmount * (prices.sell / 4.3318), [parsedAmount, prices.sell]);
  const sellValue = useMemo(() => parsedAmount * (prices.buy / 4.3318), [parsedAmount, prices.buy]);

  const hasInsufficientRial = buyCost > user.balanceIRR;
  const hasInsufficientGold = parsedAmount > user.balanceGold;

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

    fetchAnalysis();
    const analysisInterval = setInterval(fetchAnalysis, 300000);
    return () => clearInterval(analysisInterval);
  }, []);

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
      addNotification("خطا: موجودی ریالی کافی نیست!");
      return;
    }
    if (type === TransactionType.SELL && user.balanceGold < amount) {
      addNotification("خطا: موجودی طلایی کافی نیست!");
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
        <div className={`bg-slate-800 border p-6 rounded-2xl shadow-xl transition-all ${hasInsufficientRial && parsedAmount > 0 ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-700 hover:border-amber-500/30'}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-xs font-bold">موجودی ریالی</span>
            <Wallet className={hasInsufficientRial && parsedAmount > 0 ? 'text-rose-500' : 'text-amber-500'} size={18} />
          </div>
          <div className={`text-2xl font-black font-mono ${hasInsufficientRial && parsedAmount > 0 ? 'text-rose-400' : 'text-amber-100'}`}>
            {user.balanceIRR.toLocaleString()} <span className="text-[10px] text-amber-500">ریال</span>
          </div>
          {hasInsufficientRial && parsedAmount > 0 && (
            <div className="text-[9px] text-rose-500 mt-2 flex items-center gap-1">
              <AlertTriangle size={10} /> موجودی ریالی برای این خرید کافی نیست
            </div>
          )}
        </div>

        <div className={`bg-slate-800 border p-6 rounded-2xl shadow-xl transition-all ${hasInsufficientGold && parsedAmount > 0 ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-700 hover:border-amber-500/30'}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-xs font-bold">موجودی طلایی</span>
            <div className={`w-4 h-4 rounded-full shadow-lg ${hasInsufficientGold && parsedAmount > 0 ? 'bg-rose-500 shadow-rose-500/50' : 'bg-amber-500 shadow-amber-500/50'}`} />
          </div>
          <div className={`text-2xl font-black font-mono ${hasInsufficientGold && parsedAmount > 0 ? 'text-rose-400' : 'text-amber-100'}`}>
            {user.balanceGold.toFixed(3)} <span className="text-[10px] text-amber-500">گرم</span>
          </div>
          {hasInsufficientGold && parsedAmount > 0 && (
            <div className="text-[9px] text-rose-500 mt-2 flex items-center gap-1">
              <AlertTriangle size={10} /> موجودی طلایی برای این فروش کافی نیست
            </div>
          )}
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
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <BarChart3 className="text-amber-500" size={20} /> روند بازار
              </h3>
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
                className={`w-full bg-slate-900 border rounded-xl p-3 pr-10 outline-none text-amber-100 transition-all ${
                  (hasInsufficientRial || hasInsufficientGold) && parsedAmount > 0 
                    ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                    : 'border-slate-700 focus:ring-1 focus:ring-amber-500'
                }`}
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
              />
              <span className="absolute left-3 top-3.5 text-slate-500 text-[10px]">G</span>
            </div>

            {parsedAmount > 0 && (
              <div className="space-y-1 px-1">
                <div className={`flex justify-between text-[10px] ${hasInsufficientRial ? 'text-rose-400' : 'text-slate-500'}`}>
                  <span>برآورد هزینه خرید:</span>
                  <span className="font-mono">{buyCost.toLocaleString(undefined, {maximumFractionDigits:0})} ریال</span>
                </div>
                <div className={`flex justify-between text-[10px] ${hasInsufficientGold ? 'text-rose-400' : 'text-slate-500'}`}>
                  <span>برآورد ارزش فروش:</span>
                  <span className="font-mono">{sellValue.toLocaleString(undefined, {maximumFractionDigits:0})} ریال</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => executeTrade(TransactionType.BUY)}
                disabled={hasInsufficientRial && parsedAmount > 0}
                className={`text-slate-900 font-black py-3 rounded-xl transition-all shadow-lg active:scale-95 ${
                  hasInsufficientRial && parsedAmount > 0 
                    ? 'bg-slate-700 cursor-not-allowed opacity-50' 
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
                }`}
              >
                خرید
              </button>
              <button 
                onClick={() => executeTrade(TransactionType.SELL)}
                disabled={hasInsufficientGold && parsedAmount > 0}
                className={`text-slate-900 font-black py-3 rounded-xl transition-all shadow-lg active:scale-95 ${
                  hasInsufficientGold && parsedAmount > 0 
                    ? 'bg-slate-700 cursor-not-allowed opacity-50' 
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20'
                }`}
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
          <div key={n.id} className={`border-r-4 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${n.msg.includes('خطا') ? 'bg-rose-950/90 border-rose-500' : 'bg-slate-900 border-amber-500'}`}>
            {n.msg.includes('خطا') ? <AlertTriangle className="text-rose-500" size={18} /> : <Info className="text-amber-500" size={18} />}
            <span className="text-xs font-medium text-slate-200">{n.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
