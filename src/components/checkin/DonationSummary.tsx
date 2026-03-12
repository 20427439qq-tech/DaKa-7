import React from 'react';
import { Icons, formatCurrency } from '../../lib/utils';

interface DonationSummaryProps {
  amount: number;
  completedCount: number;
  totalCount?: number;
}

export const DonationSummary: React.FC<DonationSummaryProps> = ({ amount, completedCount, totalCount = 7 }) => {
  const isPerfect = completedCount === totalCount;
  const now = new Date();
  const isBefore10PM = now.getHours() < 22;
  const displayAmount = isBefore10PM ? 0 : amount;
  
  return (
    <div className={`p-6 rounded-2xl border-2 transition-all duration-500 ${
      isPerfect 
        ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-200' 
        : 'bg-white border-gray-100 shadow-sm'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isPerfect ? 'bg-white/20' : 'bg-red-50 text-red-500'
          }`}>
            <Icons.DollarSign size={24} />
          </div>
          <div>
            <p className={`text-sm font-medium ${isPerfect ? 'text-emerald-100' : 'text-gray-500'}`}>
              今日乐捐金额
            </p>
            <h2 className={`text-2xl font-black ${isPerfect ? 'text-white' : 'text-red-600'}`}>
              {formatCurrency(displayAmount)}
            </h2>
            <p className={`text-[10px] mt-0.5 font-bold ${isPerfect ? 'text-emerald-100' : 'text-red-400'}`}>
              {isBefore10PM ? '22点前显示为0，结算后显示实际金额' : `超过22点未打卡需乐捐${totalCount * 1000}元`}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className={`text-sm font-medium ${isPerfect ? 'text-emerald-100' : 'text-gray-500'}`}>
            完成进度
          </p>
          <div className="flex items-end gap-1">
            <span className={`text-2xl font-black ${isPerfect ? 'text-white' : 'text-gray-900'}`}>
              {completedCount}
            </span>
            <span className={`text-sm mb-1 ${isPerfect ? 'text-emerald-100' : 'text-gray-400'}`}>/ {totalCount}</span>
          </div>
        </div>
      </div>
      
      {amount > 0 && (
        <div className={`mt-4 pt-4 border-t ${isPerfect ? 'border-white/20' : 'border-gray-50'}`}>
          <p className={`text-xs ${isPerfect ? 'text-emerald-100' : 'text-gray-400'}`}>
            自律是为了更好的自己，乐捐只是提醒，不是目的。
          </p>
        </div>
      )}
    </div>
  );
};
