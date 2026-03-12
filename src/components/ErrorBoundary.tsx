import * as React from 'react';
import { Icons } from '../lib/utils';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorDetails = null;
      try {
        if (this.state.error?.message) {
          errorDetails = JSON.parse(this.state.error.message);
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Icons.AlertCircle size={32} />
            </div>
            
            <h2 className="text-2xl font-black text-gray-900 mb-2">出错了</h2>
            <p className="text-gray-500 mb-6">
              {errorDetails 
                ? `权限不足或数据访问受限 (${errorDetails.operationType})` 
                : '应用程序遇到了一个意外错误。'}
            </p>

            {errorDetails && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left overflow-hidden">
                <p className="text-[10px] font-mono text-gray-400 break-all">
                  Path: {errorDetails.path}<br />
                  User: {errorDetails.authInfo.userId || '未登录'}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
