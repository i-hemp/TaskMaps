import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050811] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-400 mb-8 border border-rose-500/20 shadow-[0_0_50px_-12px_rgba(244,63,94,0.3)]">
            <AlertTriangle size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4 tracking-tight">Something went wrong</h1>
          <p className="text-slate-400 mb-10 max-w-md mx-auto text-lg leading-relaxed">
            The application encountered an unexpected error. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary px-8 !bg-rose-600 shadow-rose-500/20"
          >
            <RefreshCw size={20} />
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
