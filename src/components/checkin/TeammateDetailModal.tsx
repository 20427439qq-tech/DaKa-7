import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons, formatCurrency, formatDate } from '../../lib/utils';
import { DailyCheckin, User } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { HomeworkQualityCard } from './HomeworkQualityCard';

interface TeammateDetailModalProps {
  user: User | null;
  checkin: DailyCheckin | null;
  onClose: () => void;
}

export const TeammateDetailModal: React.FC<TeammateDetailModalProps> = ({ user, checkin, onClose }) => {
  const { tasks } = useAuth();
  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];
  const isToday = checkin?.date === today;
  const now = new Date();
  const isBefore10PM = now.getHours() < 22;
  const displayDonation = (isToday && isBefore10PM) ? 0 : (checkin?.donationAmount || 0);
  const totalTasks = tasks.length || 7;

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
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white ${
              (checkin?.completedCount || 0) === totalTasks ? 'bg-emerald-500' : 'bg-blue-500'
            }`}>
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg">{user.name} 的打卡</h3>
              <p className="text-xs text-gray-500">{formatDate(checkin?.date || today)}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full text-gray-400 transition-colors"
          >
            <Icons.X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto grow">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">完成进度</p>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-black text-gray-900">{checkin?.completedCount || 0}</span>
                <span className="text-sm text-gray-400 mb-1">/ {totalTasks}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">需乐捐</p>
              <span className={`text-2xl font-black ${displayDonation > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {formatCurrency(displayDonation)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => {
              const value = checkin?.taskValues?.[task.id];
              const isCompleted = task.type === 'checkbox' ? value === true : !!value;
              return (
                <React.Fragment key={task.id}>
                  <div 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {isCompleted ? <Icons.Check size={16} /> : <Icons.Circle size={16} />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${isCompleted ? 'text-emerald-900' : 'text-gray-500'}`}>
                          {task.title}
                        </p>
                        <p className="text-[10px] text-gray-400">{task.description}</p>
                        {isCompleted && task.type === 'text' && (
                          <p className="text-xs text-gray-600 italic mt-2 p-2 bg-white/50 rounded-lg border border-emerald-100/50">
                            {value}
                          </p>
                        )}
                      </div>
                    </div>
                    {isCompleted && task.type !== 'checkbox' && task.type !== 'text' && (
                      <span className="text-[10px] text-emerald-600 font-bold">已提交</span>
                    )}
                  </div>
                  {task.id === 't7' && checkin?.homeworkAnalysis && (
                    <div className="mt-2 mb-4">
                      <HomeworkQualityCard analysis={checkin.homeworkAnalysis} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all"
          >
            返回
          </button>
        </div>
      </motion.div>
    </div>
  );
};
