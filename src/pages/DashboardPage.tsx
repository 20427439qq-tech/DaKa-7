import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { useCheckinData } from '../hooks/useCheckinData';
import { Header } from '../components/layout/Header';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { CheckinTable } from '../components/dashboard/CheckinTable';
import { DonationDetailsModal } from '../components/dashboard/DonationDetailsModal';
import { DailyCheckin } from '../types';
import { MOCK_USERS } from '../data/mockData';
import { Icons, formatCurrency, formatDate, getBeijingTime } from '../lib/utils';

export const DashboardPage: React.FC = () => {
  const { user, users, logout, tasks } = useAuth();
  const { checkins, getTeamStats, getDonationHistory } = useCheckinData();
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = getBeijingTime();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCheckin, setSelectedCheckin] = useState<DailyCheckin | null>(null);
  const [showDonationHistory, setShowDonationHistory] = useState(false);

  const dayCheckins = checkins.filter(c => c.date === selectedDate);
  const stats = getTeamStats(selectedDate, users);
  const donationHistory = getDonationHistory(users);
  
  const filteredMembers = users.filter(m => 
    m.id !== 'admin' && 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const now = getBeijingTime();
  const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  const isBefore10PM = now.getHours() < 22;
  const hideDonation = selectedDate === todayStr && isBefore10PM;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header user={user!} onLogout={logout} />
      
      <main className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900">团队打卡总览</h2>
            <p className="text-gray-500 mt-1">查看团队每日执行情况与乐捐统计</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {(user?.roles || []).some(r => r === 'admin' || r === 'jiwei') && (
              <div className="flex bg-white border border-gray-200 rounded-xl p-1 mr-2">
                <a 
                  href="#" 
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    window.location.hash === '' 
                      ? 'bg-emerald-500 text-white shadow-md' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  打卡入口
                </a>
                <a 
                  href="#admin" 
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    window.location.hash === '#admin' 
                      ? 'bg-emerald-500 text-white shadow-md' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  账号管理
                </a>
                <a 
                  href="#tasks" 
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    window.location.hash === '#tasks' 
                      ? 'bg-emerald-500 text-white shadow-md' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  打卡维护
                </a>
                <a 
                  href="#dashboard" 
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    window.location.hash === '#dashboard' 
                      ? 'bg-emerald-500 text-white shadow-md' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  纪委进入
                </a>
              </div>
            )}
            <div className="relative">
              <Icons.Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-gray-700"
              />
            </div>
            <div className="relative flex-1 md:flex-none">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="搜索成员姓名..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-gray-700 w-full md:w-64"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <StatsOverview 
            stats={stats} 
            onShowDonationDetails={() => setShowDonationHistory(true)} 
          />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                成员打卡详情
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                  {filteredMembers.length} 人
                </span>
              </h3>
            </div>
            <CheckinTable 
              checkins={dayCheckins} 
              members={filteredMembers} 
              selectedDate={selectedDate}
              onViewDetail={setSelectedCheckin}
            />
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCheckin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCheckin(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                    {users.find(u => u.id === selectedCheckin.userId)?.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">
                      {users.find(u => u.id === selectedCheckin.userId)?.name}
                    </h3>
                    <p className="text-xs text-gray-500">{formatDate(selectedCheckin.date)} 打卡详情</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCheckin(null)}
                  className="p-2 hover:bg-white rounded-full text-gray-400 transition-colors"
                >
                  <Icons.X size={20} />
                </button>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">完成率</p>
                    <p className="text-2xl font-black text-emerald-700">{Math.round(selectedCheckin.completionRate)}%</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                    <p className="text-xs text-red-600 font-bold uppercase tracking-wider">乐捐金额</p>
                    <p className="text-2xl font-black text-red-700">
                      {formatCurrency(hideDonation ? 0 : selectedCheckin.donationAmount)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icons.Check size={18} className="text-emerald-500" />
                    打卡任务状态
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {tasks.map((task, i) => {
                      const value = selectedCheckin.taskValues?.[task.id];
                      const isCompleted = task.type === 'checkbox' ? value === true : !!value;
                      return (
                        <div key={task.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-gray-700">{i + 1}. {task.title}</span>
                            {isCompleted ? (
                              <Icons.Check className="text-emerald-500" size={16} />
                            ) : (
                              <Icons.X className="text-red-400" size={16} />
                            )}
                          </div>
                          {isCompleted && task.type === 'text' && (
                            <p className="text-xs text-gray-500 italic mt-1 line-clamp-3">{value}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-400">
                    最后更新时间：{new Date(selectedCheckin.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Donation History Modal */}
      <AnimatePresence>
        {showDonationHistory && (
          <DonationDetailsModal 
            history={donationHistory} 
            onClose={() => setShowDonationHistory(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
