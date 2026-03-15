import React from 'react';

export default class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white p-10 rounded-[2rem] border border-stone-200 shadow-xl text-center">
            <h2 className="text-2xl font-normal text-stone-900 font-serif mb-4">Something went wrong</h2>
            <p className="text-stone-500 text-sm mb-6">An unexpected error occurred.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-stone-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
