
import React, { useState } from 'react';
import { Send, Clock, CheckCircle, AlertCircle, Upload, CreditCard } from 'lucide-react';
import { TransferRequest, NotificationType } from '../types';

interface TransfersProps {
  onAddRequest: (req: TransferRequest) => void;
  onNotify: (message: string, type?: NotificationType) => void;
  requests: TransferRequest[];
}

const Transfers: React.FC<TransfersProps> = ({ onAddRequest, onNotify, requests }) => {
  const [amount, setAmount] = useState('');
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !code) {
      onNotify("لطفا تمام فیلدها را پر کنید.", "error");
      return;
    }

    const newReq: TransferRequest = {
      id: `req-${Date.now()}`,
      userId: 'user-1',
      userName: 'علی احمدی',
      amount: parseFloat(amount),
      trackingCode: code,
      timestamp: new Date(),
      status: 'PENDING'
    };

    onAddRequest(newReq);
    setAmount('');
    setCode('');
    onNotify('حواله شما با موفقیت ثبت شد و در صف تایید قرار گرفت.', "success");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-2 text-amber-500">
            <CreditCard size={24} />
            <h2 className="text-lg font-bold">ثبت حواله واریزی</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            پس از واریز وجه به شماره حساب‌های شرکت، اطلاعات فیش واریزی خود را در این بخش ثبت کنید تا پس از تایید توسط حسابداری به موجودی شما افزوده شود.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">مبلغ واریزی (ریال)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 focus:border-amber-500 outline-none text-amber-100"
                placeholder="مثلا ۱,۰۰۰,۰۰۰"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">کد پیگیری یا شماره فیش</label>
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 focus:border-amber-500 outline-none text-amber-100"
                placeholder="کد ۱۰ رقمی..."
              />
            </div>
            <button className="w-full bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
              <Send size={18} /> ثبت نهایی حواله
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <h3 className="font-bold flex items-center gap-2 text-slate-300">
          <Clock size={20} className="text-amber-500" /> وضعیت حواله‌های اخیر
        </h3>
        {requests.length === 0 ? (
          <div className="bg-slate-800/50 border border-dashed border-slate-700 p-10 rounded-2xl text-center text-slate-500">
            هنوز هیچ حواله‌ای ثبت نکرده‌اید.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex justify-between items-center group hover:border-amber-500/30 transition-all">
                <div className="flex gap-4 items-center">
                  <div className={`p-2 rounded-lg ${req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {req.status === 'PENDING' ? <Clock size={20} /> : <CheckCircle size={20} />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-200">{req.amount.toLocaleString()} ریال</div>
                    <div className="text-[10px] text-slate-500">کد پیگیری: {req.trackingCode} | {req.timestamp.toLocaleDateString('fa-IR')}</div>
                  </div>
                </div>
                <div className="text-left">
                  <span className={`text-[10px] px-2 py-1 rounded-full ${req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {req.status === 'PENDING' ? 'در حال بررسی' : 'تایید شده'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transfers;
