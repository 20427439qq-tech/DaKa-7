import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { useCheckinData } from '../hooks/useCheckinData';
import { Header } from '../components/layout/Header';
import { TaskCard } from '../components/checkin/TaskCard';
import { DonationSummary } from '../components/checkin/DonationSummary';
import { TeammateStatus } from '../components/checkin/TeammateStatus';
import { TeammateDetailModal } from '../components/checkin/TeammateDetailModal';
import { DailyCheckin, User } from '../types';
import { calculateCheckinStats } from '../data/mockData';
import { Icons, getRandomQuote, formatDate, formatCurrency, getBeijingTime, COUNTRY_TIMEZONES, getTimeForCountry } from '../lib/utils';

export const MyCheckinPage: React.FC = () => {
  const { user, users, tasks, logout } = useAuth();
  const { getCheckin, saveCheckin, checkins, cheerTeammate, loading } = useCheckinData();
  const [quote] = useState(getRandomQuote());
  
  const today = useMemo(() => {
    const now = getBeijingTime();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  }, []);
  
  const completedTodayCount = useMemo(() => {
    return checkins.filter(c => c.date === today && c.completedCount === tasks.length).length;
  }, [checkins, today, tasks]);

  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('中国');

  const [checkin, setCheckin] = useState<DailyCheckin | null>(null);

  useEffect(() => {
    if (!loading && !checkin) {
      const existing = getCheckin(user!.id, today);
      if (existing) {
        setCheckin(existing);
        setSelectedCountry(existing.country || '中国');
      } else {
        setCheckin(calculateCheckinStats({
          id: `${user!.id}-${today}`,
          userId: user!.id,
          date: today,
          taskValues: {},
          challengeNote: '',
          completedCount: 0,
          completionRate: 0,
          donationAmount: tasks.length * 1000,
          updatedAt: new Date().toISOString(),
          country: '中国',
          cheers: []
        }, tasks));
      }
    }
  }, [loading, checkin, getCheckin, user, today, tasks]);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('保存成功，继续加油！');
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

  const handleTaskChange = (taskId: string, value: any) => {
    setCheckin(prev => {
      if (!prev) return null;
      const newTaskValues = { ...(prev.taskValues || {}), [taskId]: value };
      const next = { ...prev, taskValues: newTaskValues };
      return calculateCheckinStats(next, tasks);
    });
  };

  const handleSave = () => {
    if (!checkin) return;
    const now = getTimeForCountry(checkin.country || '中国');
    const timeStr = `${now.getHours().toString().padStart(2, '0')}点${now.getMinutes().toString().padStart(2, '0')}分`;
    setSubmitTime(timeStr);
    
    const updated = {
      ...checkin,
      updatedAt: now.toISOString()
    };
    saveCheckin(updated);
    setShowModal(true);
  };

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setCheckin(prev => prev ? ({ ...prev, country }) : null);
    setShowCountryModal(false);
    setToastMessage(`已切换至 ${country} 时间`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleCheer = (targetUserId: string) => {
    cheerTeammate(targetUserId, today, user?.name || '匿名');
    setToastMessage('加油已送达！');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const modalContent = useMemo(() => {
    if (!checkin) return null;
    const now = getTimeForCountry(checkin.country || '中国');
    const isBefore10PM = now.getHours() < 22;
    const isAllCompleted = checkin.completedCount === tasks.length;
    
    if (isBefore10PM && isAllCompleted) {
      const uncompletedTeammates = teammates.filter(t => {
        const tCheckin = getCheckin(t.id, today);
        return !tCheckin || tCheckin.completedCount < tasks.length;
      });

      return (
        <>
          <h3 className="text-2xl font-black text-gray-900 mb-2">
            太棒了！今日满分 🌟
          </h3>
          <div className="space-y-4 mb-8 text-left">
            <p className="text-emerald-600 font-bold text-center italic">
              “自律的你最闪耀，给还没完成的小伙伴加个油吧！”
            </p>
            
            {uncompletedTeammates.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {uncompletedTeammates.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="font-bold text-gray-700">{t.name}</span>
                    <button
                      onClick={() => handleCheer(t.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors"
                    >
                      <Icons.Heart size={12} fill="currentColor" />
                      加油
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 text-sm py-4">
                所有小伙伴都已完成，团队太强了！
              </p>
            )}
            
            <p className="text-[10px] font-bold text-gray-400 text-center">
              提交时间：{submitTime} ({checkin.country})
            </p>
          </div>
        </>
      );
    }

    if (isBefore10PM) {
      const target = new Date(now);
      target.setHours(22, 0, 0, 0);
      const diff = target.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const remainingTasks = tasks.length - checkin.completedCount;
      
      return (
        <>
          <h3 className="text-2xl font-black text-gray-900 mb-2">
            打卡已暂存
          </h3>
          <div className="space-y-3 mb-8">
            <div className="bg-emerald-50 p-4 rounded-2xl">
              <p className="text-emerald-800 font-bold text-sm">
                距完成时间还有 {hours} 小时 {minutes} 分钟
              </p>
              <p className="text-emerald-600 text-xs mt-1">
                你还有 {remainingTasks} 项没有打卡
              </p>
            </div>
            {completedTodayCount > 0 && (
              <p className="text-gray-500 text-sm font-medium">
                已有 {completedTodayCount} 个小伙伴打卡完成
              </p>
            )}
            <p className="text-xs font-bold text-gray-400">
              今天提交打卡时间为 {submitTime}
            </p>
          </div>
        </>
      );
    }

    return (
      <>
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
      </>
    );
  }, [checkin, completedTodayCount, submitTime, tasks, teammates]);

  // Auto-save on change
  useEffect(() => {
    if (!checkin) return;
    const timer = setTimeout(() => {
      saveCheckin(checkin);
    }, 1000);
    return () => clearTimeout(timer);
  }, [checkin, saveCheckin]);

  // Only show loading if we are actually loading from DB or if checkin hasn't been initialized yet
  if (loading || !checkin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="text-sm text-gray-400 font-medium">正在加载打卡数据...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-2 mt-2">
              <button 
                onClick={() => setShowCountryModal(true)}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-blue-100 transition-colors"
              >
                <Icons.Plane size={12} />
                出国时差: {checkin.country || '中国'}
              </button>
              {checkin.cheers && checkin.cheers.length > 0 && (
                <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                  <Icons.Heart size={12} fill="currentColor" />
                  {checkin.cheers.join('、')} 给你的加油
                </div>
              )}
            </div>
            <p className="text-gray-500 mt-2 italic">“{quote}”</p>
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
            totalCount={tasks.length}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.length > 0 ? (
              tasks.map(task => (
                <div key={task.id} className={task.type === 'text' ? 'md:col-span-2' : ''}>
                  <TaskCard
                    title={task.title}
                    description={task.description}
                    type={task.type}
                    deadline={task.deadline}
                    value={checkin.taskValues?.[task.id]}
                    onChange={(val) => handleTaskChange(task.id, val)}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 bg-white rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400">
                <Icons.AlertCircle size={48} className="mb-4 opacity-20" />
                <p className="font-bold">暂无打卡任务</p>
                <p className="text-xs mt-1">请联系管理员添加任务</p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 mt-4">
            <button
              onClick={handleSave}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Icons.Check size={20} />
              保存今日打卡
            </button>
            <p className="text-xs text-gray-400">
              最后更新于：{new Date(new Date(checkin.updatedAt).toLocaleString("en-US", { timeZone: "Asia/Shanghai" })).toLocaleTimeString('zh-CN')}
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

      {/* Country Selection Modal */}
      <AnimatePresence>
        {showCountryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCountryModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6"
            >
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <Icons.Plane className="text-blue-500" size={20} />
                出国时差申请
              </h3>
              <p className="text-sm text-gray-500 mb-6">选择您所在的国家/地区，我们将自动为您调整打卡截止时间（当地时间22:00）。</p>
              
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {Object.keys(COUNTRY_TIMEZONES).map(country => (
                  <button
                    key={country}
                    onClick={() => handleCountrySelect(country)}
                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
                      checkin.country === country 
                        ? 'bg-blue-500 text-white shadow-md' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowCountryModal(false)}
                className="w-full mt-6 py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
              >
                取消
              </button>
            </motion.div>
          </div>
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
              
              {modalContent}
              
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
            {toastMessage}
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
