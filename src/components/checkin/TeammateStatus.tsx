import React from 'react';
import { motion } from 'motion/react';
import { Icons } from '../../lib/utils';
import { User, DailyCheckin } from '../../types';

interface TeammateStatusProps {
  teammates: User[];
  checkins: DailyCheckin[];
  tasksCount: number;
  onTeammateClick: (userId: string) => void;
}

export const TeammateStatus: React.FC<TeammateStatusProps> = ({ teammates, checkins, tasksCount, onTeammateClick }) => {
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
          <Icons.Users size={16} className="text-blue-500" />
          自在队 队员打卡状态
        </h3>
        <span className="text-[10px] text-gray-400 font-bold">点击查看详情</span>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {teammates.map((member) => {
          const checkin = checkins.find(c => c.userId === member.id && c.date === today);
          const completedCount = checkin?.completedCount || 0;
          const isFinished = completedCount === tasksCount;
          const isStarted = completedCount > 0;
          const score = checkin?.homeworkAnalysis?.total;
          
          return (
            <motion.button
              key={member.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTeammateClick(member.id)}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                isFinished 
                  ? 'bg-emerald-50 border-emerald-100' 
                  : isStarted 
                    ? 'bg-blue-50 border-blue-100' 
                    : 'bg-gray-50 border-gray-100'
              }`}
            >
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black mb-1 ${
                  isFinished 
                    ? 'bg-emerald-500 text-white' 
                    : isStarted 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {member.name.charAt(0)}
                </div>
                {isFinished && (
                  <div className="absolute -top-1 -right-1 bg-amber-400 text-white rounded-full p-0.5 border-2 border-white">
                    <Icons.Star size={8} fill="currentColor" />
                  </div>
                )}
                {score !== undefined && (
                  <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-bold px-1 rounded-full border border-white min-w-[16px] h-4 flex items-center justify-center shadow-sm">
                    {score}
                  </div>
                )}
              </div>
              <span className={`text-[11px] font-bold truncate w-full text-center ${
                isFinished 
                  ? 'text-emerald-700' 
                  : isStarted 
                    ? 'text-blue-600' 
                    : 'text-gray-400'
              }`}>
                {member.name}
              </span>
              <div className="flex items-center gap-0.5 mt-1">
                {[...Array(tasksCount)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1 h-1 rounded-full ${
                      i < completedCount ? (isFinished ? 'bg-emerald-400' : 'bg-blue-400') : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
