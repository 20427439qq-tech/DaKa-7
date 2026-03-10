import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { useCheckinData } from '../hooks/useCheckinData';
import { Header } from '../components/layout/Header';
import { Icons, formatCurrency, formatDate } from '../lib/utils';

export const HistoryPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { getPersonalStats } = useCheckinData();
  const stats = getPersonalStats(user!.id);
  const [filterDate, setFilterDate] = useState('');

  const filteredHistory = stats.history.filter(c => 
    !filterDate || c.date.includes(filterDate)
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header user={user!} onLogout={logout} />
      
      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-gray-900">成长足迹</h2>
            <p className="text-gray-500 mt-1">回顾您的自律历程与点滴进步</p>
          </div>
          <button 
            onClick={() => window.location.hash = ''}
            className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:underline"
          >
            返回打卡 <Icons.ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '累计打卡', value: `${stats.totalDays} 天`, icon: Icons.Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: '平均完成率', value: `${Math.round(stats.averageRate)}%`, icon: Icons.TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: '累计乐捐', value: formatCurrency(stats.totalDonation), icon: Icons.DollarSign, color: 'text-red-600', bg: 'bg-red-50' },
            { label: '连续打卡', value: `${stats.streakDays} 天`, icon: Icons.Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-3`}>
                <item.icon size={20} />
              </div>
              <p className="text-xs text-gray-500 font-medium">{item.label}</p>
              <p className={`text-lg font-bold mt-1 ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-bold text-gray-900">历史记录</h3>
            <div className="relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="month"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-gray-700"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {filteredHistory.length > 0 ? (
              filteredHistory.map(checkin => (
                <div key={checkin.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold ${
                        checkin.completionRate === 100 ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <span className="text-xs leading-none">{new Date(checkin.date).getDate()}</span>
                        <span className="text-[10px] uppercase tracking-tighter">{new Date(checkin.date).toLocaleDateString('zh-CN', { month: 'short' })}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{formatDate(checkin.date)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${checkin.completionRate === 100 ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                              style={{ width: `${checkin.completionRate}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-500">{checkin.completedCount}/7</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">乐捐金额</p>
                        <p className={`text-sm font-bold ${checkin.donationAmount > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                          {formatCurrency(checkin.donationAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">挑战记录</p>
                        <p className="text-sm font-medium text-gray-700">
                          {checkin.challengeNote ? '已填写' : <span className="text-red-400">未填写</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {checkin.challengeNote && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-600 italic leading-relaxed">
                      “{checkin.challengeNote}”
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                  <Icons.Search size={32} />
                </div>
                <p className="text-gray-500 font-medium">暂无符合条件的记录</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center sm:hidden z-40">
        <button 
          onClick={() => window.location.hash = ''}
          className="flex flex-col items-center gap-1 text-gray-400"
        >
          <Icons.Check size={20} />
          <span className="text-[10px] font-bold">今日打卡</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-emerald-600">
          <Icons.TrendingUp size={20} />
          <span className="text-[10px] font-bold">历史记录</span>
        </button>
      </div>
    </div>
  );
};
