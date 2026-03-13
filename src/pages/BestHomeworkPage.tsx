import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from '../lib/utils';
import { useCheckinData } from '../hooks/useCheckinData';
import { useAuth } from '../hooks/useAuth';
import { DailyCheckin, User } from '../types';
import { getBeijingTime } from '../lib/utils';

type FilterPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

export const BestHomeworkPage: React.FC = () => {
  const { checkins, loading } = useCheckinData();
  const { users } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState<FilterPeriod>('day');
  const [viewingHomework, setViewingHomework] = useState<DailyCheckin | null>(null);

  const filteredBestHomework = useMemo(() => {
    if (loading) return [];

    const now = getBeijingTime();
    const targetDate = new Date(selectedDate);
    
    let startDate: Date;
    let endDate: Date;

    if (period === 'day') {
      startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      // Start of week (Monday)
      const day = targetDate.getDay() || 7;
      startDate = new Date(targetDate);
      startDate.setDate(targetDate.getDate() - day + 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (period === 'quarter') {
      const quarter = Math.floor(targetDate.getMonth() / 3);
      startDate = new Date(targetDate.getFullYear(), quarter * 3, 1);
      endDate = new Date(targetDate.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59, 999);
    } else { // year
      startDate = new Date(targetDate.getFullYear(), 0, 1);
      endDate = new Date(targetDate.getFullYear(), 11, 31, 23, 59, 59, 999);
    }

    // Filter checkins with homework analysis in the range
    const inRange = checkins.filter(c => {
      const cDate = new Date(c.date);
      return cDate >= startDate && cDate <= endDate && c.homeworkAnalysis;
    });

    if (period === 'day') {
      // Daily top 3
      return inRange
        .sort((a, b) => (b.homeworkAnalysis?.total || 0) - (a.homeworkAnalysis?.total || 0))
        .slice(0, 3);
    } else {
      // Period top 12
      return inRange
        .sort((a, b) => (b.homeworkAnalysis?.total || 0) - (a.homeworkAnalysis?.total || 0))
        .slice(0, 12);
    }
  }, [checkins, loading, selectedDate, period]);

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || '未知用户';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => window.location.hash = ''}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icons.ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Icons.Star size={20} className="text-amber-500" fill="currentColor" />
            优秀作业展示
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Icons.Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {(['day', 'week', 'month', 'quarter', 'year'] as FilterPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    period === p 
                      ? 'bg-white text-amber-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {p === 'day' ? '当日' : p === 'week' ? '本周' : p === 'month' ? '本月' : p === 'quarter' ? '本季' : '本年'}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            {period === 'day' ? '每日最多展示前3名' : '周期内最多展示前12名'}
          </p>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filteredBestHomework.length > 0 ? (
            filteredBestHomework.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden"
              >
                {/* Rank Badge */}
                <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-white text-xs font-black ${
                  index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-400'
                }`}>
                  TOP {index + 1}
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-black text-xl">
                    {getUserName(item.userId).charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">{getUserName(item.userId)}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-400 font-bold">{item.date}</p>
                      {item.homeworkAnalysis?.uploadTime && (
                        <span className="text-[10px] text-gray-300 font-mono">· {item.homeworkAnalysis.uploadTime} 上传</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-2xl font-black text-amber-600 leading-none">
                      {item.homeworkAnalysis?.total}
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">总分</div>
                  </div>
                </div>

                {item.homeworkAnalysis?.metadata && (
                  <div className="mb-4 p-3 bg-amber-50/50 rounded-xl border border-amber-100/50">
                    <div className="flex items-center justify-between text-amber-900 font-bold text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <Icons.Award size={14} className="text-amber-500" />
                        《{item.homeworkAnalysis.metadata.bookName}》第{item.homeworkAnalysis.metadata.homeworkNumber}次作业
                      </div>
                      {item.homeworkAnalysis.metadata.homeworkDate && (
                        <span className="text-[10px] text-amber-600/60 font-mono">{item.homeworkAnalysis.metadata.homeworkDate}</span>
                      )}
                    </div>
                    <div className="text-[10px] text-amber-700 font-medium">
                      题目：{item.homeworkAnalysis.metadata.firstLine}
                    </div>
                  </div>
                )}

                {/* Scores Grid */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: '可读性', score: item.homeworkAnalysis?.readability, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: '逻辑性', score: item.homeworkAnalysis?.logic, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: '哲理性', score: item.homeworkAnalysis?.philosophy, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: '反思性', score: item.homeworkAnalysis?.reflection, color: 'text-rose-600', bg: 'bg-rose-50' },
                  ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-2 text-center`}>
                      <div className={`text-sm font-black ${s.color}`}>{s.score}</div>
                      <div className="text-[9px] text-gray-400 font-bold">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* AI Feedback */}
                <div className="bg-gray-50 rounded-xl p-4 relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <Icons.MessageSquare size={12} className="text-amber-500" />
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">AI 点评</span>
                        </div>
                        {item.homeworkAnalysis?.wordCount && (
                          <span className="text-[9px] text-gray-400 font-mono">{item.homeworkAnalysis.wordCount} 字</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed italic">
                        “{item.homeworkAnalysis?.feedback || '暂无评价'}”
                      </p>
                    </div>
                    <button 
                      onClick={() => setViewingHomework(item)}
                      className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-amber-600 hover:bg-amber-50 transition-colors"
                      title="查看作业原文"
                    >
                      <Icons.FileText size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <Icons.Inbox size={48} className="mb-4 opacity-20" />
              <p className="font-bold">暂无优秀作业记录</p>
              <p className="text-xs mt-1">快去提交高质量的作业吧！</p>
            </div>
          )}
        </div>
      </main>

      {/* Homework Viewer Modal */}
      <AnimatePresence>
        {viewingHomework && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingHomework(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900">作业原文</h2>
                  <p className="text-xs text-gray-400 font-bold">
                    {getUserName(viewingHomework.userId)} · {viewingHomework.date}
                  </p>
                </div>
                <button 
                  onClick={() => setViewingHomework(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Icons.X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {viewingHomework.taskValues?.['t7'] ? (
                  viewingHomework.taskValues['t7'].startsWith('data:image') ? (
                    <img 
                      src={viewingHomework.taskValues['t7']} 
                      alt="作业内容" 
                      className="w-full rounded-xl shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : viewingHomework.taskValues['t7'].startsWith('data:application/pdf') ? (
                    <div className="aspect-[3/4] w-full bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400">
                      <Icons.FileText size={48} className="mb-4" />
                      <p className="font-bold">PDF 文件</p>
                      <p className="text-xs mt-2 px-8 text-center">由于浏览器限制，请在打卡页重新点击文件查看完整内容。</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                        {viewingHomework.taskValues['t7']}
                      </pre>
                    </div>
                  )
                ) : (
                  <div className="py-12 text-center text-gray-400">
                    <Icons.AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
                    <p>无法加载作业内容</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
