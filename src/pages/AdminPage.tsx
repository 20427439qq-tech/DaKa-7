import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/layout/Header';
import { Icons } from '../lib/utils';
import { User, UserRole } from '../types';

export const AdminPage: React.FC = () => {
  const { user, users, logout, addUser, updateUser, deleteUser, resetPassword } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', roles: ['member'] as UserRole[], studentId: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users
    .filter(u => {
      const roles = u.roles || [];
      const roleNames = roles.map(r => r === 'admin' ? '管理员' : r === 'jiwei' ? '纪委' : '成员');
      return u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        roles.some(r => r.toLowerCase().includes(searchQuery.toLowerCase())) ||
        roleNames.some(rn => rn.includes(searchQuery)) ||
        (u.studentId?.toString() || '').includes(searchQuery);
    })
    .sort((a, b) => (a.studentId || 0) - (b.studentId || 0));

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    addUser({ 
      name: formData.name, 
      roles: formData.roles, 
      password: '2026',
      studentId: formData.studentId ? parseInt(formData.studentId) : undefined
    });
    setIsAddModalOpen(false);
    setFormData({ name: '', roles: ['member'], studentId: '' });
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !formData.name.trim()) return;
    updateUser(editingUser.id, { 
      name: formData.name, 
      roles: formData.roles,
      studentId: formData.studentId ? parseInt(formData.studentId) : undefined
    });
    setEditingUser(null);
    setFormData({ name: '', roles: ['member'], studentId: '' });
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setFormData({ name: u.name, roles: u.roles, studentId: u.studentId?.toString() || '' });
  };

  const toggleRole = (role: UserRole) => {
    setFormData(prev => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role];
      
      // Ensure at least one role is selected, if not default to member
      if (roles.length === 0) return { ...prev, roles: ['member'] };
      return { ...prev, roles };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header user={user!} onLogout={logout} />
      
      <main className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900">账号管理中心</h2>
            <p className="text-gray-500 mt-1">管理团队成员账号及权限（点击右侧“编辑”按钮录入学号）</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
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
            <div className="relative flex-1 md:flex-none">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="搜索姓名或角色..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-gray-700 w-full md:w-64"
              />
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
            >
              <Icons.Plus size={18} />
              新增账号
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">学号</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">成员信息</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">权限角色</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">当前密码</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-bold text-gray-500">
                        {u.studentId !== undefined ? u.studentId.toString().padStart(3, '0') : '---'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          (u.roles || []).includes('admin') ? 'bg-indigo-500' : 'bg-emerald-500'
                        }`}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">ID: {u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(u.roles || []).map(r => (
                          <span key={r} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r === 'admin' ? 'bg-indigo-50 text-indigo-600' :
                            r === 'jiwei' ? 'bg-amber-50 text-amber-600' :
                            'bg-emerald-50 text-emerald-600'
                          }`}>
                            {r === 'admin' ? '管理员' : r === 'jiwei' ? '纪委' : '成员'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-600">
                        {u.password}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => resetPassword(u.id)}
                          className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          title="重置密码为 2026"
                        >
                          <Icons.RefreshCw size={18} />
                        </button>
                        <button 
                          onClick={() => openEditModal(u)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="编辑账号"
                        >
                          <Icons.Edit size={18} />
                        </button>
                        {u.id !== 'admin' && (
                          <button 
                            onClick={() => {
                              if (confirm(`确定要删除账号 ${u.name} 吗？`)) {
                                deleteUser(u.id);
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除账号"
                          >
                            <Icons.Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Search size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">未找到匹配的账号</p>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(isAddModalOpen || editingUser) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingUser(null);
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="font-black text-gray-900">
                  {editingUser ? '编辑账号' : '新增账号'}
                </h3>
                <button 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="p-2 hover:bg-white rounded-full text-gray-400 transition-colors"
                >
                  <Icons.X size={20} />
                </button>
              </div>
              
              <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">学号</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value.replace(/\D/g, '') })}
                    placeholder="请输入学号（数字）"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">学号将用于团队成员排序</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">姓名</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="请输入姓名"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">角色权限 (多选)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'admin', label: '管理员' },
                      { value: 'jiwei', label: '纪委' },
                      { value: 'member', label: '成员' }
                    ].map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => toggleRole(r.value as UserRole)}
                        className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                          formData.roles.includes(r.value as UserRole)
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98]"
                  >
                    {editingUser ? '保存修改' : '确认新增'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
