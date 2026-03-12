import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from '../lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  type = 'info'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-8"
          >
            <div className="text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
                type === 'danger' ? 'bg-red-500 shadow-red-200 text-white' :
                type === 'warning' ? 'bg-amber-500 shadow-amber-200 text-white' :
                'bg-blue-500 shadow-blue-200 text-white'
              }`}>
                {type === 'danger' ? <Icons.Trash2 size={32} /> :
                 type === 'warning' ? <Icons.AlertTriangle size={32} /> :
                 <Icons.Info size={32} />}
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">{message}</p>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 py-3 text-white rounded-xl font-bold transition-all shadow-lg ${
                    type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-100' :
                    type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' :
                    'bg-gray-900 hover:bg-gray-800 shadow-gray-100'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
