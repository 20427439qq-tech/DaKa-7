import React from 'react';
import { motion } from 'motion/react';
import { HomeworkAnalysis } from '../../types';
import { Icons } from '../../lib/utils';

interface HomeworkQualityCardProps {
  analysis?: HomeworkAnalysis;
  isAnalyzing?: boolean;
}

export const HomeworkQualityCard: React.FC<HomeworkQualityCardProps> = ({ analysis, isAnalyzing }) => {
  if (isAnalyzing) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 animate-ping bg-emerald-100 rounded-full opacity-75"></div>
            <div className="relative bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-200">
              <Icons.Zap size={24} className="animate-pulse" />
            </div>
          </div>
          <p className="text-sm text-emerald-900 font-bold">AI 正在深度分析中...</p>
          <p className="text-[10px] text-emerald-600 mt-1 animate-pulse">最快速度出分中，请稍候</p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/20 to-transparent"></div>
      </div>
    );
  }

  if (!analysis || (analysis.total === 0 && !analysis.feedback)) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[200px] text-gray-300">
        <Icons.Zap size={48} className="mb-2 opacity-20" />
        <p className="text-sm font-bold">作业质量分析</p>
        <p className="text-[10px]">上传作业后 AI 将自动评分</p>
      </div>
    );
  }

  const dimensions = [
    { label: '可读性', value: analysis.readability || 0, color: 'text-blue-500' },
    { label: '逻辑性', value: analysis.logic || 0, color: 'text-purple-500' },
    { label: '哲理性', value: analysis.philosophy || 0, color: 'text-amber-500' },
    { label: '反思性', value: analysis.reflection || 0, color: 'text-rose-500' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <Icons.Zap size={18} />
          </div>
          <h3 className="font-bold text-gray-900">作业质量分析</h3>
        </div>
        <div className="flex flex-col items-end">
          {analysis.uploadTime && (
            <span className="text-[10px] text-gray-400 font-mono">上传时间: {analysis.uploadTime}</span>
          )}
          {analysis.wordCount && (
            <span className="text-[10px] text-gray-400 font-mono">总字数: {analysis.wordCount} 字</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-6">
        <div className="flex-1 grid grid-cols-2 gap-4">
          {dimensions.map((d) => (
            <div key={d.label}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{d.label}</p>
              <p className={`text-lg font-black ${d.color}`}>{d.value}<span className="text-[10px] ml-0.5 opacity-50">/25</span></p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100 min-w-[100px]">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">总分</p>
          <p className="text-4xl font-black text-emerald-700">{analysis.total}</p>
        </div>
      </div>

      {analysis.feedback && (
        <div className="mt-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-500 italic leading-relaxed">
            “{analysis.feedback}”
          </p>
        </div>
      )}

      <div className="absolute -top-4 -right-4 text-emerald-50 opacity-50 pointer-events-none">
        <Icons.Zap size={120} />
      </div>
    </motion.div>
  );
};
