
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, UserCircle, LogOut, Menu, X, Coins, History as HistoryIcon, CreditCard } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import History from './components/History';
import Transfers from './components/Transfers';
import ChatBot from './components/ChatBot';
import { Transaction, TransferRequest, UserStatus } from './types';
import { MOCK_USER } from './constants';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);

  const handleAddTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
  };

  const handleAddTransfer = (req: TransferRequest) => {
    setTransfers(prev => [req, ...prev]);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2">
                  <div className="bg-amber-500 p-2 rounded-lg shadow-lg shadow-amber-500/20">
                    <Coins className="text-slate-900" size={24} />
                  </div>
                  <span className="text-xl font-black text-amber-500 tracking-tighter">سامانه زرین</span>
                </Link>
                
                <div className="hidden md:flex items-center gap-4">
                  <Link to="/" className="text-slate-300 hover:text-amber-500 px-3 py-2 text-sm font-medium transition-colors">پیشخوان</Link>
                  <Link to="/history" className="text-slate-300 hover:text-amber-500 px-3 py-2 text-sm font-medium transition-colors">گردش حساب</Link>
                  <Link to="/transfers" className="text-slate-300 hover:text-amber-500 px-3 py-2 text-sm font-medium transition-colors">حواله‌ها</Link>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4">
                <button 
                  onClick={() => setIsAdmin(!isAdmin)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${isAdmin ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
                >
                  <ShieldCheck size={16} />
                  {isAdmin ? 'پنل کاربری' : 'پنل ادمین'}
                </button>
                <div className="h-6 w-px bg-slate-800 mx-2" />
                <div className="flex items-center gap-3 bg-slate-800/50 p-1 px-3 rounded-full border border-slate-700">
                  <div className="text-left">
                    <div className="text-[10px] font-bold text-amber-100">{MOCK_USER.name}</div>
                    <div className="text-[8px] text-slate-500">سطح: برنز</div>
                  </div>
                  <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-500">
                    <UserCircle size={20} />
                  </div>
                </div>
              </div>

              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-400">
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden bg-slate-900 border-t border-slate-800 p-4 space-y-4 animate-in slide-in-from-top">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-slate-300 hover:text-amber-500 py-2">پیشخوان</Link>
              <Link to="/history" onClick={() => setIsMenuOpen(false)} className="block text-slate-300 hover:text-amber-500 py-2">گردش حساب</Link>
              <Link to="/transfers" onClick={() => setIsMenuOpen(false)} className="block text-slate-300 hover:text-amber-500 py-2">حواله‌ها</Link>
              <button 
                onClick={() => { setIsAdmin(!isAdmin); setIsMenuOpen(false); }}
                className="w-full bg-slate-800 text-slate-300 py-3 rounded-xl text-sm font-bold border border-slate-700"
              >
                {isAdmin ? 'سوئیچ به کاربری' : 'سوئیچ به مدیریت'}
              </button>
            </div>
          )}
        </nav>

        <main className="flex-grow pb-12">
          <Routes>
            <Route path="/" element={isAdmin ? <AdminPanel /> : <Dashboard isAdmin={false} transactions={transactions} onAddTransaction={handleAddTransaction} />} />
            <Route path="/history" element={<History transactions={transactions} />} />
            <Route path="/transfers" element={<Transfers requests={transfers} onAddRequest={handleAddTransfer} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <ChatBot />

        <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4 text-center">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-[10px]">
            <p>© ۱۴۰۳ سامانه معاملات آنلاین طلای زرین. تمامی حقوق محفوظ است.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-amber-500 transition-colors">قوانین و مقررات</a>
              <a href="#" className="hover:text-amber-500 transition-colors">امنیت تراکنش‌ها</a>
              <a href="#" className="hover:text-amber-500 transition-colors">درباره ما</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
