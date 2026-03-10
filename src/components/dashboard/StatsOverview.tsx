import React from 'react';
import { TeamStats } from '../../types';
import { Icons, formatCurrency } from '../../lib/utils';

interface StatsOverviewProps {
  stats: TeamStats;
  onShowDonationDetails: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, onShowDonationDetails }) => {
  const items = [
    { label: '团队总人数', value: stats.totalMembers, icon: Icons.User, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '已打卡人数', value: stats.checkedInCount, icon: Icons.Check, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '未打卡人数', value: stats.notCheckedInCount, icon: Icons.X, color: 'text-red-600', bg: 'bg-red-50' },
    { label: '当日乐捐金额', value: formatCurrency(stats.totalDonation), icon: Icons.DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
    { 
      label: '合计乐捐金额', 
      value: formatCurrency(stats.totalAccumulatedDonation), 
      icon: Icons.PieChart, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50',
      action: { label: '明细', onClick: onShowDonationDetails }
    },
    { label: '平均完成率', value: `${Math.round(stats.averageCompletionRate)}%`, icon: Icons.TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {items.map((item, idx) => (
        <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group">
          <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-3`}>
            <item.icon size={20} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">{item.label}</p>
            {item.action && (
              <button 
                onClick={item.action.onClick}
                className="text-[10px] font-bold text-orange-600 hover:text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded transition-colors"
              >
                {item.action.label}
              </button>
            )}
          </div>
          <p className={`text-lg font-bold mt-1 ${item.color}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
};
