import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/layout/Header';
import { Icons } from '../lib/utils';
import { CheckinTask, TaskType } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';

export const TaskMaintenancePage: React.FC = () => {
  const { user, tasks, logout, addTask, updateTask, deleteTask } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CheckinTask | null>(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    type: 'checkbox' as TaskType, 
    deadline: '',
    order: 0
  });

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    try {
      await addTask({
        ...formData,
        order: tasks.length + 1
      });
      setIsAddModalOpen(false);
      setFormData({ title: '', description: '', type: 'checkbox', deadline: '', order: 0 });
    } catch (error) {
      console.error("Add task error:", error);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !formData.title.trim()) return;
    try {
      await updateTask(editingTask.id, formData);
      setEditingTask(null);
      setFormData({ title: '', description: '', type: 'checkbox', deadline: '', order: 0 });
    } catch (error) {
      console.error("Update task error:", error);
    }
  };

  const handleDeleteTask = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: '删除打卡项',
      message: '确定要删除这个打卡项吗？此操作不可撤销。',
      type: 'danger',
      onConfirm: async () => {
        await deleteTask(id);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const openEditModal = (task: CheckinTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      type: task.type,
      deadline: task.deadline || '',
      order: task.order
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header user={user!} onLogout={logout} />
      
      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900">打卡维护</h2>
            <p className="text-gray-500 mt-1">管理打卡项目、形式及截止时间</p>
          </div>
          <button 
            onClick={() => {
              setFormData({ title: '', description: '', type: 'checkbox', deadline: '', order: tasks.length + 1 });
              setIsAddModalOpen(true);
            }}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
          >
            <Icons.Plus size={20} /> 添加项目
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">排序</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">项目名称</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">打卡形式</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">截止时间</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-400">#{task.order}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{task.title}</span>
                        <span className="text-xs text-gray-500 line-clamp-1">{task.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        task.type === 'checkbox' ? 'bg-blue-50 text-blue-600' :
                        task.type === 'image' ? 'bg-purple-50 text-purple-600' :
                        task.type === 'audio' ? 'bg-amber-50 text-amber-600' :
                        task.type === 'file' ? 'bg-indigo-50 text-indigo-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {task.type === 'checkbox' ? '打勾' :
                         task.type === 'image' ? '图片' :
                         task.type === 'audio' ? '音频' :
                         task.type === 'file' ? '文档' : '文字'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{task.deadline || '--'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(task)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                          <Icons.Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Icons.Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(isAddModalOpen || editingTask) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingTask(null);
              }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-gray-900">
                  {editingTask ? '编辑打卡项' : '添加打卡项'}
                </h3>
                <button 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTask(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icons.X size={24} />
                </button>
              </div>

              <form onSubmit={editingTask ? handleUpdateTask : handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">项目名称</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="例如：早安打卡"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">项目说明</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
                    placeholder="详细描述打卡要求..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">打卡形式</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none bg-white"
                    >
                      <option value="checkbox">打勾</option>
                      <option value="image">图片上传</option>
                      <option value="audio">音频上传</option>
                      <option value="file">文档上传</option>
                      <option value="text">文字输入</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">截止时间</label>
                    <input
                      type="text"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="例如：08:00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">排序权重</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                  >
                    {editingTask ? '保存修改' : '立即添加'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        type={confirmConfig.type}
      />
    </div>
  );
};
