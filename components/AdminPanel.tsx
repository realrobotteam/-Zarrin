
import React, { useState } from 'react';
import { 
  Users, Settings, ShieldAlert, CheckCircle, XCircle, 
  CreditCard, DollarSign, Activity, Lock, Unlock, Edit2, X
} from 'lucide-react';
import { User, UserStatus, TransferRequest, NotificationType } from '../types';
import { MOCK_USER } from '../constants';

interface AdminPanelProps {
  onNotify: (message: string, type?: NotificationType) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onNotify }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'transfers' | 'settings'>('users');
  const [users, setUsers] = useState<User[]>([
    MOCK_USER,
    { id: 'u2', name: 'رضا سهرابی', phone: '09351112233', status: UserStatus.PENDING, balanceIRR: 0, balanceGold: 0, debtIRR: 0, creditIRR: 0 },
    { id: 'u3', name: 'مریم نوری', phone: '09121110000', status: UserStatus.APPROVED, balanceIRR: 5000000, balanceGold: 2.5, debtIRR: 0, creditIRR: 0 }
  ]);
  const [isHalted, setIsHalted] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const approveUser = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: UserStatus.APPROVED } : u));
    onNotify("حساب کاربری با موفقیت تایید شد.", "success");
  };

  const toggleHalt = () => {
    const newState = !isHalted;
    setIsHalted(newState);
    onNotify(newState ? "تمامی معاملات متوقف شدند." : "معاملات مجدداً فعال شدند.", newState ? "error" : "success");
  };

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
  };

  const handleSaveUser = () => {
    if (!editingUser) return;
    setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
    onNotify("اطلاعات کاربر با موفقیت به‌روزرسانی شد.", "success");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-amber-500">پنل مدیریت زرین</h1>
          <p className="text-slate-400 text-sm">مدیریت کاربران، تراکنش‌ها و تنظیمات سیستمی</p>
        </div>
        <button 
          onClick={toggleHalt}
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
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-900 text-slate-400 text-sm">
                <th className="p-4 text-center">نام</th>
                <th className="p-4 text-center">شماره تماس</th>
                <th className="p-4 text-center">موجودی (ریال)</th>
                <th className="p-4 text-center">موجودی (طلا)</th>
                <th className="p-4 text-center">وضعیت</th>
                <th className="p-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="p-4 text-center">{u.name}</td>
                  <td className="p-4 text-center font-mono">{u.phone}</td>
                  <td className="p-4 text-center">{u.balanceIRR.toLocaleString()}</td>
                  <td className="p-4 text-center">{u.balanceGold} گرم</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] ${
                      u.status === UserStatus.APPROVED ? 'bg-emerald-500/10 text-emerald-500' : 
                      u.status === UserStatus.REJECTED ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {u.status === UserStatus.APPROVED ? 'تایید شده' : u.status === UserStatus.REJECTED ? 'رد شده' : 'در انتظار'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEditUser(u)}
                        className="p-1.5 bg-slate-700 hover:bg-slate-600 text-amber-500 rounded-lg transition-colors"
                        title="ویرایش کاربر"
                      >
                        <Edit2 size={14} />
                      </button>
                      {u.status === UserStatus.PENDING && (
                        <button 
                          onClick={() => approveUser(u.id)}
                          className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded transition-colors shadow-lg shadow-emerald-900/10"
                        >
                          تایید سریع
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-amber-500 font-bold flex items-center gap-2">
                <Edit2 size={18} /> ویرایش اطلاعات کاربر
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">نام و نام خانوادگی</label>
                <input 
                  type="text" 
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 focus:border-amber-500 outline-none text-slate-100 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">شماره تماس</label>
                <input 
                  type="text" 
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 focus:border-amber-500 outline-none text-slate-100 text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">وضعیت حساب</label>
                <select 
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as UserStatus })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 focus:border-amber-500 outline-none text-slate-100 text-sm"
                >
                  <option value={UserStatus.PENDING}>در انتظار تایید</option>
                  <option value={UserStatus.APPROVED}>تایید شده</option>
                  <option value={UserStatus.REJECTED}>مسدود / رد شده</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={handleSaveUser}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-900/20"
                >
                  ذخیره تغییرات
                </button>
                <button 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all border border-slate-700"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Activity size={18} className="text-amber-500"/> تنظیم دستی قیمت</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">حباب خرید (ریال)</label>
                <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 focus:border-amber-500 outline-none text-amber-100" placeholder="مثلا ۵۰,۰۰۰" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">حباب فروش (ریال)</label>
                <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 focus:border-amber-500 outline-none text-amber-100" placeholder="مثلا ۱۰۰,۰۰۰" />
              </div>
              <button 
                onClick={() => onNotify("قیمت‌ها با موفقیت به‌روزرسانی شدند.", "success")}
                className="w-full bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold py-2 rounded-lg transition-all shadow-lg shadow-amber-900/10"
              >
                به‌روزرسانی قیمت‌ها
              </button>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl space-y-4 shadow-xl">
            <h3 className="font-bold mb-4 flex items-center gap-2"><ShieldAlert size={18} className="text-amber-500"/> محدودیت‌های معاملاتی</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">سقف معامله تک (گرم)</label>
                <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 focus:border-amber-500 outline-none text-amber-100" defaultValue={500} />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">حداقل موجودی برای فروش (ریال)</label>
                <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 focus:border-amber-500 outline-none text-amber-100" defaultValue={1000000} />
              </div>
              <button 
                onClick={() => onNotify("محدودیت‌ها ذخیره شدند.", "info")}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg transition-all"
              >
                ذخیره تغییرات
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transfers' && (
        <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700 shadow-inner">
           <p className="text-slate-500">حواله جدیدی برای بررسی وجود ندارد.</p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
