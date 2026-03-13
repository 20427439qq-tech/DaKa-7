import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Icons } from '../lib/utils';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorInfo: any | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    try {
      const info = JSON.parse(error.message);
      return { hasError: true, errorInfo: info };
    } catch {
      return { hasError: true, errorInfo: { error: error.message } };
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const isQuotaError = this.state.errorInfo?.error?.includes('resource-exhausted') || 
                          this.state.errorInfo?.error?.includes('Quota exceeded');

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icons.AlertTriangle size={40} />
            </div>
            
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              {isQuotaError ? '系统额度已用尽' : '出错了'}
            </h2>
            
            <div className="bg-red-50 p-4 rounded-2xl mb-6 text-left">
              <p className="text-sm text-red-800 font-medium leading-relaxed">
                {isQuotaError 
                  ? '由于当前使用的是免费版数据库，今日的写入额度已达到上限。系统将在北京时间下午自动重置额度，届时您可以继续打卡。'
                  : (this.state.errorInfo?.error || '发生了未知错误，请稍后重试。')}
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              <Icons.RefreshCw size={20} />
              重试
            </button>
            
            <p className="mt-6 text-[10px] text-gray-400 font-mono">
              Error Code: {isQuotaError ? 'RESOURCE_EXHAUSTED' : 'APP_ERROR'}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
