import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL REACT CRASH:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', fontFamily: 'sans-serif', background: '#fff1f2', color: '#9f1239', minHeight: '100vh' }}>
          <div style={{ maxWidth: '600px', margin: '40px auto', background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #fecdd3', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#e11d48' }}>⚠️ Notice</h2>
            <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '16px' }}>
              We encountered a temporary display issue. Please refresh or return to the home page.
            </p>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#334155', fontFamily: 'monospace', overflow: 'auto', marginBottom: '16px' }}>
              {this.state.error?.toString()}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => window.location.href = '/'}
                style={{ padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                ← Return to Home
              </button>
              <button 
                onClick={() => window.location.reload()}
                style={{ padding: '10px 20px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                ↻ Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
