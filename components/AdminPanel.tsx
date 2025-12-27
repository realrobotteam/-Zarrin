
import React, { useState } from 'react';
import { 
  Users, Settings, ShieldAlert, CheckCircle, XCircle, 
  CreditCard, DollarSign, Activity, Lock, Unlock
} from 'lucide-react';
import { User, UserStatus, TransferRequest } from '../types';
import { MOCK_USER } from '../constants';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'transfers' | 'settings'>('users');
  // Added debtIRR and creditIRR to mock user objects to match User interface
  const [users, setUsers] = useState<User[]>([
    MOCK_USER,
    { id: 'u2', name: 'رضا سهرابی', phone: '09351112233', status: UserStatus.PENDING, balanceIRR: 0, balanceGold: 0, debtIRR: 0, creditIRR: 0 },
    { id: 'u3', name: 'مریم نوری', phone: '09121110000', status: UserStatus.APPROVED, balanceIRR: 5000000, balanceGold: 2.5, debtIRR: 0, creditIRR: 0 }
  ]);
  const [isHalted, setIsHalted] = useState(false);

  const approveUser = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: UserStatus.APPROVED } : u));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-amber-500">پنل مدیریت زرین</h1>
          <p className="text-slate-400 text-sm">مدیریت کاربران، تراکنش‌ها و تنظیمات سیستمی</p>
        </div>
        <button 
          onClick={() => setIsHalted(!isHalted)}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${isHalted ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white shadow-lg shadow-rose-900/20'}`}
        >
          {isHalted ? <Unlock size={20}/> : <Lock size={20}/>}
          {isHalted ? 'فعال‌سازی معاملات' : 'توقف آنی معاملات'}
        </button>
      </div>

      <div className="flex border-b border-slate-700 gap-8 mb-6">
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-2 text-sm font-medium transition-all border-b-2 ${activeTab === 'users' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          <div className="flex items-center gap-2"><Users size={16}/> مدیریت کاربران</div>
        </button>
        <button 
          onClick={() => setActiveTab('transfers')}
          className={`pb-4 px-2 text-sm font-medium transition-all border-b-2 ${activeTab === 'transfers' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          <div className="flex items-center gap-2"><CreditCard size={16}/> تایید حواله‌ها</div>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`pb-4 px-2 text-sm font-medium transition-all border-b-2 ${activeTab === 'settings' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          <div className="flex items-center gap-2"><Settings size={16}/> تنظیمات قیمت و محدودیت</div>
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-900 text-slate-400 text-sm">
                <th className="p-4">نام</th>
                <th className="p-4">شماره تماس</th>
                <th className="p-4">موجودی (ریال)</th>
                <th className="p-4">موجودی (طلا)</th>
                <th className="p-4">وضعیت</th>
                <th className="p-4">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-700/20">
                  <td className="p-4">{u.name}</td>
                  <td className="p-4 font-mono">{u.phone}</td>
                  <td className="p-4">{u.balanceIRR.toLocaleString()}</td>
                  <td className="p-4">{u.balanceGold} گرم</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] ${u.status === UserStatus.APPROVED ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {u.status === UserStatus.APPROVED ? 'تایید شده' : 'در انتظار'}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.status === UserStatus.PENDING && (
                      <button 
                        onClick={() => approveUser(u.id)}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded"
                      >
                        تایید حساب
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Activity size={18} className="text-amber-500"/> تنظیم دستی قیمت</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">حباب خرید (ریال)</label>
                <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 focus:border-amber-500 outline-none" placeholder="مثلا ۵۰,۰۰۰" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">حباب فروش (ریال)</label>
                <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 focus:border-amber-500 outline-none" placeholder="مثلا ۱۰۰,۰۰۰" />
              </div>
              <button className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg transition-all">به‌روزرسانی قیمت‌ها</button>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold mb-4 flex items-center gap-2"><ShieldAlert size={18} className="text-amber-500"/> محدودیت‌های معاملاتی</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">سقف معامله تک (گرم)</label>
                <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 focus:border-amber-500 outline-none" defaultValue={500} />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">حداقل موجودی برای فروش (ریال)</label>
                <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 focus:border-amber-500 outline-none" defaultValue={1000000} />
              </div>
              <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg transition-all">ذخیره تغییرات</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transfers' && (
        <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
           <p className="text-slate-500">حواله جدیدی برای بررسی وجود ندارد.</p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
