import React from 'react';
import { Icons, formatCurrency } from '../../lib/utils';
import { HomeworkAnalysis } from '../../types';

interface DonationSummaryProps {
  amount: number;
  completedCount: number;
  totalCount?: number;
  homeworkAnalysis?: HomeworkAnalysis;
}

export const DonationSummary: React.FC<DonationSummaryProps> = ({ amount, completedCount, totalCount = 7, homeworkAnalysis }) => {
  const isPerfect = completedCount === totalCount;
  const now = new Date();
  const isBefore10PM = now.getHours() < 22;
  const displayAmount = isBefore10PM ? 0 : amount;
  
  const metadata = homeworkAnalysis?.metadata;
  
  return (
    <div className={`py-5 px-6 rounded-2xl border-2 transition-all duration-500 ${
      isPerfect 
        ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-200' 
        : 'bg-white border-gray-100 shadow-sm'
    }`}>
      <div className="flex items-center justify-between gap-4">
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
              {isBefore10PM ? '22点前显示为0' : `未打卡需乐捐${totalCount * 1000}元`}
            </p>
          </div>
        </div>

        {/* Homework Metadata in the middle */}
        {metadata && (
          <div className={`flex-1 flex flex-col items-center justify-center px-4 py-2 rounded-xl border ${
            isPerfect ? 'bg-white/10 border-white/20' : 'bg-amber-50 border-amber-100'
          }`}>
            <div className={`flex items-center gap-1.5 font-bold text-xs mb-1 ${isPerfect ? 'text-white' : 'text-amber-900'}`}>
              <Icons.Award size={14} className={isPerfect ? 'text-amber-200' : 'text-amber-500'} />
              《{metadata.bookName}》
            </div>
            <div className={`text-[10px] font-bold ${isPerfect ? 'text-emerald-100' : 'text-amber-700'}`}>
              {(() => {
                if (!metadata.homeworkDate) return '';
                const date = metadata.homeworkDate;
                // Handle YYYY-MM-DD
                if (date.includes('-')) {
                  const [y, m, d] = date.split('-');
                  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
                }
                // Handle YYYYMMDD
                if (date.length === 8) {
                  return `${date.slice(0,4)}年${parseInt(date.slice(4,6))}月${parseInt(date.slice(6,8))}日`;
                }
                return date;
              })()} 第{metadata.homeworkNumber}次作业
            </div>
          </div>
        )}
        
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
    </div>
  );
};
