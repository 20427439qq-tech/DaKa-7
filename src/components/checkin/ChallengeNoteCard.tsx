import React from 'react';

interface ChallengeNoteCardProps {
  value: string;
  onChange: (val: string) => void;
}

export const ChallengeNoteCard: React.FC<ChallengeNoteCardProps> = ({ value, onChange }) => {
  const isCompleted = value.trim().length > 0;
  
  return (
    <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
      isCompleted 
        ? 'bg-emerald-50 border-emerald-200' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-bold text-lg ${isCompleted ? 'text-emerald-900' : 'text-gray-900'}`}>
            挑战记录
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            写出真实的挑战过程、反思、感受或收获（必填）
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {isCompleted ? '已填写' : '待填写'}
        </div>
      </div>
      
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="今天最大的挑战是... 我的反思是..."
          className="w-full h-40 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none text-gray-700 bg-white/50"
        />
        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
          {value.length} 字
        </div>
      </div>
      
      {!isCompleted && (
        <p className="mt-3 text-sm text-amber-600 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          未填写此项将乐捐 3000 元
        </p>
      )}
    </div>
  );
};
