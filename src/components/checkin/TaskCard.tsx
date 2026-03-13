import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from '../../lib/utils';
import { TaskType, HomeworkAnalysis } from '../../types';
import * as mammoth from 'mammoth';

interface TaskCardProps {
  title: string;
  description: string;
  type: TaskType;
  value: any;
  onChange: (value: any, fileName?: string) => void;
  deadline?: string;
  analysis?: HomeworkAnalysis;
}

export const TaskCard: React.FC<TaskCardProps> = ({ title, description, type, value, onChange, deadline, analysis }) => {
  const completed = type === 'checkbox' ? value === true : !!value;

  const renderInput = () => {
    switch (type) {
      case 'checkbox':
        return (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
            completed 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'bg-white border-gray-200 text-transparent'
          }`}>
            <Icons.Check size={20} />
          </div>
        );
      case 'image':
        return (
          <div className="flex flex-col items-end gap-2">
            <div className={`p-2 rounded-xl border-2 transition-all ${
              value ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400'
            }`}>
              <Icons.Image size={20} />
            </div>
            {value && <span className="text-[10px] text-emerald-600 font-bold">已上传图片</span>}
          </div>
        );
      case 'audio':
        return (
          <div className="flex flex-col items-end gap-2">
            <div className={`p-2 rounded-xl border-2 transition-all ${
              value ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400'
            }`}>
              <Icons.Mic size={20} />
            </div>
            {value && <span className="text-[10px] text-emerald-600 font-bold">已上传音频</span>}
          </div>
        );
      case 'file':
        return (
          <div className="flex flex-col items-end gap-2">
            <div className={`p-2 rounded-xl border-2 transition-all ${
              value ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400'
            }`}>
              <Icons.FileText size={20} />
            </div>
            {value && <span className="text-[10px] text-emerald-600 font-bold">已上传文档</span>}
          </div>
        );
      case 'text':
        return (
          <div className="flex flex-col items-end gap-2">
            <div className={`p-2 rounded-xl border-2 transition-all ${
              value ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400'
            }`}>
              <Icons.Type size={20} />
            </div>
            {value && <span className="text-[10px] text-emerald-600 font-bold">已输入内容</span>}
          </div>
        );
      default:
        return null;
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [showPreview, setShowPreview] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (type === 'text') return; // Textarea handles its own interaction

    if (completed && type !== 'checkbox') {
      e.stopPropagation();
      setShowPreview(true);
      return;
    }

    if (type === 'checkbox') {
      onChange(!value);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Check file size (limit to 1MB for the raw file, but we'll aim for much smaller after compression)
    if (file.size > 1024 * 1024) {
      alert('文件太大啦！为了保证打卡成功，请上传 1MB 以内的文件。');
      return;
    }

    if (file.type.startsWith('image/')) {
      // Compress image using Canvas
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimension 800px
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Export as low quality JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          onChange(dataUrl, file.name);
          
          // Reset input so the same file can be selected again
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      // For audio and other files, just check size and convert to base64
      if (file.size > 500 * 1024) {
        alert('文件请保持在 500KB 以内。');
        return;
      }
      
      const isDocx = file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc');
      
      if (isDocx) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          try {
            const result = await mammoth.extractRawText({ arrayBuffer });
            const text = result.value;
            
            if (!text.trim()) {
              alert('无法从该文档中提取文字内容，请确保文档不是空的，或者尝试将其另存为 PDF 后上传。');
              return;
            }

            // Convert extracted text to a text data URL so it fits the existing flow
            const base64Text = btoa(unescape(encodeURIComponent(text)));
            const dataUrl = `data:text/plain;base64,${base64Text}`;
            onChange(dataUrl, file.name);
          } catch (err) {
            console.error('Docx extraction error:', err);
            alert('读取 Word 文档失败，请尝试将其另存为 PDF 后上传。');
          } finally {
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }
        };
        reader.readAsArrayBuffer(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange(event.target.result as string, file.name);
        }
        // Reset input so the same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getAcceptType = () => {
    switch (type) {
      case 'image': return 'image/*';
      case 'audio': return 'audio/*';
      case 'file': return '*/*';
      default: return undefined;
    }
  };

  return (
    <>
      <motion.div 
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`relative overflow-hidden p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
          completed 
            ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
            : 'bg-white border-gray-100 hover:border-gray-200'
        }`}
      >
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={getAcceptType()}
          className="hidden"
        />
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-lg ${completed ? 'text-emerald-900' : 'text-gray-900'}`}>
                {title}
              </h3>
              {deadline && (
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-mono">
                  {deadline}
                </span>
              )}
            </div>
            <p className={`text-sm mt-1 ${completed ? 'text-emerald-700/70' : 'text-gray-500'}`}>
              {description}
            </p>
          </div>
          {type !== 'text' && renderInput()}
        </div>

        {type === 'text' && (
          <div className="mt-4 relative">
            <textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="请在此输入内容..."
              className="w-full h-40 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none text-gray-700 bg-white/50"
            />
            <div className="absolute bottom-3 right-3 text-[10px] text-gray-400 font-mono">
              {(value || '').length} 字
            </div>
          </div>
        )}
        
        {completed && type !== 'text' && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-2 -right-2 text-emerald-100 opacity-20"
          >
            <Icons.Award size={64} />
          </motion.div>
        )}
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{title} - 预览</h3>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Icons.X size={20} />
                </button>
              </div>
              
              <div className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                {type === 'image' && (
                  <img src={value} alt={title} className="max-w-full max-h-[60vh] rounded-xl shadow-lg" referrerPolicy="no-referrer" />
                )}
                {type === 'audio' && (
                  <div className="w-full space-y-4">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <Icons.Mic size={40} />
                    </div>
                    <audio src={value} controls className="w-full" />
                  </div>
                )}
                {type === 'file' && (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                      <Icons.FileText size={40} />
                    </div>
                    <p className="font-bold text-gray-700">已上传文档</p>
                    <a 
                      href={value} 
                      download 
                      className="inline-block px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-bold"
                    >
                      下载查看
                    </a>
                  </div>
                )}
                {type === 'text' && (
                  <div className="w-full p-4 bg-gray-50 rounded-xl text-gray-700 whitespace-pre-wrap">
                    {value}
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-gray-50 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowPreview(false);
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors"
                >
                  重新上传
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
