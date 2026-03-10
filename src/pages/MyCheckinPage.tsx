import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { useCheckinData } from '../hooks/useCheckinData';
import { Header } from '../components/layout/Header';
import { TaskCard } from '../components/checkin/TaskCard';
import { ChallengeNoteCard } from '../components/checkin/ChallengeNoteCard';
import { DonationSummary } from '../components/checkin/DonationSummary';
import { TeammateStatus } from '../components/checkin/TeammateStatus';
import { TeammateDetailModal } from '../components/checkin/TeammateDetailModal';
import { DailyCheckin, TaskKey, User } from '../types';
import { TASKS, calculateCheckinStats, MOCK_USERS } from '../data/mockData';
import { Icons, getRandomQuote, formatDate, formatCurrency } from '../lib/utils';

export const MyCheckinPage: React.FC = () => {
  const { user, users, logout } = useAuth();
  const { getCheckin, saveCheckin, checkins } = useCheckinData();
  const [quote] = useState(getRandomQuote());
  const today = new Date().toISOString().split('T')[0];
  
  const completedTodayCount = useMemo(() => {
    return checkins.filter(c => c.date === today && c.completedCount === 7).length;
  }, [checkins, today]);

  const [checkin, setCheckin] = useState<DailyCheckin>(() => {
    const existing = getCheckin(user!.id, today);
    if (existing) return existing;
    
    return calculateCheckinStats({
      id: `${user!.id}-${today}`,
      userId: user!.id,
      date: today,
      wakeUpAt8: false,
      focusOneHour: false,
      exercise30Min: false,
      read10Pages: false,
      learnNewSkill: false,
      noJunkFood: false,
      challengeNote: '',
      completedCount: 0,
      completionRate: 0,
      donationAmount: 9000,
      updatedAt: new Date().toISOString(),
    });
  });

  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitTime, setSubmitTime] = useState('');

  const [selectedTeammateId, setSelectedTeammateId] = useState<string | null>(null);
  const [showTeammateModal, setShowTeammateModal] = useState(false);

  const teammates = useMemo(() => {
    return users
      .filter(u => (u.roles || []).includes('member') && u.id !== user?.id)
      .sort((a, b) => (a.studentId || 0) - (b.studentId || 0));
  }, [user, users]);

  const selectedTeammate = useMemo(() => {
    return users.find(u => u.id === selectedTeammateId) || null;
  }, [selectedTeammateId, users]);

  const selectedTeammateCheckin = useMemo(() => {
    if (!selectedTeammateId) return null;
    return getCheckin(selectedTeammateId, today) || null;
  }, [selectedTeammateId, today, checkins]);

  const handleTeammateClick = (userId: string) => {
    setSelectedTeammateId(userId);
    setShowTeammateModal(true);
  };

  const handleToggle = (key: TaskKey) => {
    setCheckin(prev => {
      const next = { ...prev, [key]: !prev[key] };
      return calculateCheckinStats(next);
    });
  };

  const handleNoteChange = (val: string) => {
    setCheckin(prev => {
      const next = { ...prev, challengeNote: val };
      return calculateCheckinStats(next);
    });
  };

  const handleSave = () => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}点${now.getMinutes().toString().padStart(2, '0')}分`;
    setSubmitTime(timeStr);
    
    const updated = {
      ...checkin,
      updatedAt: now.toISOString()
    };
    saveCheckin(updated);
    setShowModal(true);
  };

  // Auto-save on change
  useEffect(() => {
    const timer = setTimeout(() => {
      saveCheckin(checkin);
    }, 1000);
    return () => clearTimeout(timer);
  }, [checkin]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header user={user!} onLogout={logout} />
      
      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-2">
              <Icons.Calendar size={16} />
              {formatDate(today)}
            </div>
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-black text-gray-900">
                你好，{user?.name} 👋
              </h2>
              <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1">
                <Icons.Check size={12} />
                已有 {completedTodayCount} 人打卡完成
              </div>
            </div>
            <p className="text-gray-500 mt-1 italic">“{quote}”</p>
          </div>
          
          <button 
            onClick={() => window.location.hash = '#password'}
            className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline"
          >
            <Icons.Info size={14} /> 修改密码
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <DonationSummary 
            amount={checkin.donationAmount} 
            completedCount={checkin.completedCount} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TASKS.map(task => (
              <TaskCard
                key={task.key}
                title={task.title}
                description={task.description}
                completed={checkin[task.key]}
                onToggle={() => handleToggle(task.key)}
              />
            ))}
          </div>

          <ChallengeNoteCard 
            value={checkin.challengeNote} 
            onChange={handleNoteChange} 
          />

          <div className="flex flex-col items-center gap-4 mt-4">
            <button
              onClick={handleSave}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Icons.Check size={20} />
              保存今日打卡
            </button>
            <p className="text-xs text-gray-400">
              最后更新于：{new Date(checkin.updatedAt).toLocaleTimeString()}
            </p>
          </div>

          <TeammateStatus 
            teammates={teammates}
            checkins={checkins}
            onTeammateClick={handleTeammateClick}
          />
        </div>
      </main>

      {/* Teammate Detail Modal */}
      <AnimatePresence>
        {showTeammateModal && (
          <TeammateDetailModal 
            user={selectedTeammate}
            checkin={selectedTeammateCheckin}
            onClose={() => setShowTeammateModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Save Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
                checkin.donationAmount === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
              }`}>
                {checkin.donationAmount === 0 ? <Icons.Check size={40} /> : <Icons.AlertCircle size={40} />}
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                {checkin.donationAmount === 0 ? '今天打卡完成' : '打卡已保存'}
              </h3>
              
              <div className="space-y-2 mb-8">
                <p className="text-gray-600">
                  {checkin.donationAmount === 0 
                    ? '太棒了！您已完成今日所有挑战。' 
                    : `您今天需要乐捐 ${formatCurrency(checkin.donationAmount)}。`}
                </p>
                <p className="text-sm font-bold text-emerald-600">
                  今天提交打卡时间为 {submitTime}
                </p>
              </div>
              
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all"
              >
                我知道了
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-2 z-50"
          >
            <Icons.Check size={18} />
            保存成功，继续加油！
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center sm:hidden z-40">
        <button className="flex flex-col items-center gap-1 text-emerald-600">
          <Icons.Check size={20} />
          <span className="text-[10px] font-bold">今日打卡</span>
        </button>
        <button 
          onClick={() => window.location.hash = '#history'}
          className="flex flex-col items-center gap-1 text-gray-400"
        >
          <Icons.TrendingUp size={20} />
          <span className="text-[10px] font-bold">历史记录</span>
        </button>
      </div>
    </div>
  );
};
