import React from 'react';
import { Icons, formatCurrency } from '../../lib/utils';
import { User } from '../../types';
import { motion } from 'motion/react';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
              <Icons.Award size={20} />
            </div>
            <h1 className="text-lg font-bold text-gray-900 hidden sm:block">自在队 每日七项打卡</h1>
            <h1 className="text-lg font-bold text-gray-900 sm:hidden">自在打卡</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {(user.roles || []).some(r => r === 'admin' || r === 'jiwei') && (
              <nav className="hidden md:flex items-center gap-1 mr-4 border-r border-gray-100 pr-4">
                <a 
                  href="#" 
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    window.location.hash === '' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  打卡入口
                </a>
                <a 
                  href="#admin" 
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    window.location.hash === '#admin' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  账号管理
                </a>
                <a 
                  href="#dashboard" 
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    window.location.hash === '#dashboard' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  纪委进入
                </a>
              </nav>
            )}
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-medium text-gray-900">{user.name}</span>
              <span className="text-xs text-gray-500">
                {(user.roles || []).includes('admin') ? '管理者' : (user.roles || []).includes('jiwei') ? '纪委' : '团队成员'}
              </span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="退出登录"
            >
              <Icons.LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
