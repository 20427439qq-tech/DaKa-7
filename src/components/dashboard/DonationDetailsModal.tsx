import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Icons, formatCurrency, formatDate } from '../../lib/utils';

interface DonationDetailsModalProps {
  history: { 
    date: string; 
    amount: number; 
    details: { name: string; reason: string; amount: number }[] 
  }[];
  onClose: () => void;
}

export const DonationDetailsModal: React.FC<DonationDetailsModalProps> = ({ history, onClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      if (item.amount === 0) return false;
      if (startDate && item.date < startDate) return false;
      if (endDate && item.date > endDate) return false;
      return true;
    });
  }, [history, startDate, endDate]);

  const totalFilteredAmount = useMemo(() => {
    return filteredHistory.reduce((sum, h) => sum + h.amount, 0);
  }, [filteredHistory]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center">
              <Icons.PieChart size={20} />
            </div>
            <div>
              <h3 className="font-black text-gray-900">乐捐金额明细</h3>
              <p className="text-xs text-gray-500">系统起始日至今的每日乐捐详情</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full text-gray-400 transition-colors"
          >
            <Icons.X size={20} />
          </button>
        </div>

        {/* Filter Section */}
        <div className="px-6 py-4 bg-white border-b border-gray-50 flex flex-wrap items-center gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400">筛选日期:</span>
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-700 outline-none p-1"
              />
              <span className="text-gray-300">至</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-700 outline-none p-1"
              />
            </div>
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-[10px] font-bold text-amber-600 hover:text-amber-700 underline"
            >
              重置筛选
            </button>
          )}
        </div>
        
        <div className="p-6 overflow-y-auto grow">
          <div className="space-y-8">
            {filteredHistory.map((day) => (
              <div key={day.date} className="space-y-3">
                <div className="flex items-center justify-between sticky top-0 bg-white py-2 z-10 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <Icons.Calendar size={14} className="text-gray-400" />
                    <span className="text-sm font-black text-gray-900">{formatDate(day.date)}</span>
                  </div>
                  <span className={`text-sm font-black ${day.amount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    当日总计: {formatCurrency(day.amount)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {day.details.length > 0 ? (
                    day.details.map((detail, idx) => (
                      <div 
                        key={`${day.date}-${idx}`} 
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-amber-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                            {detail.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">{detail.name}</span>
                            <span className="text-[10px] text-gray-500">{detail.reason}</span>
                          </div>
                        </div>
                        <span className={`text-sm font-black ${detail.amount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {formatCurrency(detail.amount)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <p className="text-xs text-emerald-600 font-bold">🎉 今日无人乐捐，全员达成！</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredHistory.length === 0 && (
              <div className="text-center py-12">
                <Icons.Info className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-400">该时间段内暂无记录</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-500">
              {startDate || endDate ? '筛选范围内乐捐总额' : '累计乐捐总额'}
            </span>
            {startDate || endDate ? (
              <span className="text-[10px] text-gray-400">
                {startDate || '起始'} 至 {endDate || '至今'}
              </span>
            ) : null}
          </div>
          <span className="text-2xl font-black text-amber-600">
            {formatCurrency(totalFilteredAmount)}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
