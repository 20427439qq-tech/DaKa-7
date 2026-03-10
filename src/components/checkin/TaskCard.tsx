import React from 'react';
import { motion } from 'motion/react';
import { Icons } from '../../lib/utils';

interface TaskCardProps {
  title: string;
  description: string;
  completed: boolean;
  onToggle: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ title, description, completed, onToggle }) => {
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={`relative overflow-hidden p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
        completed 
          ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
          : 'bg-white border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className={`font-bold text-lg ${completed ? 'text-emerald-900' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`text-sm mt-1 ${completed ? 'text-emerald-700/70' : 'text-gray-500'}`}>
            {description}
          </p>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
          completed 
            ? 'bg-emerald-500 border-emerald-500 text-white' 
            : 'bg-white border-gray-200 text-transparent'
        }`}>
          <Icons.Check size={20} />
        </div>
      </div>
      
      {completed && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-2 -right-2 text-emerald-100 opacity-20"
        >
          <Icons.Award size={64} />
        </motion.div>
      )}
    </motion.div>
  );
};
