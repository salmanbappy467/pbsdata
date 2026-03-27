'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: username.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        router.replace('/dashboard');
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
    setLoading(false);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card glass-card animate-fade">
        <div className="login-header">
           <h1 className="logo-accent">PBS DataHub</h1>
           <p className="login-subtitle">Connect with your PBS network ID</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-field">
            <label htmlFor="user">Network API Key</label>
            <div className="input-icon-wrap">
              <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <input 
                id="user"
                type="text" 
                placeholder="e.g. pbsnet-testistest" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="glass-input"
              />
            </div>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className={`btn-auth ${loading ? 'btn-loading' : ''}`}
          >
            {loading ? 'Authenticating...' : 'Sign In Now'}
          </button>
        </form>

        <p className="login-footer">
          Don't have access? Contact your PBS IT administrator.
        </p>
      </div>

      <style jsx>{`
        .login-wrapper {
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 60%);
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 48px 32px;
          text-align: center;
          border-radius: 24px;
        }

        .login-header {
          margin-bottom: 32px;
        }

        .logo-accent {
          font-size: 2rem;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
        }

        .login-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .login-form {
          text-align: left;
        }

        .input-field {
          margin-bottom: 24px;
        }

        label {
          display: block;
          margin-bottom: 10px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .input-icon-wrap {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: var(--text-muted);
        }

        .glass-input {
          width: 100%;
          padding-left: 44px;
          height: 52px;
          font-size: 1rem;
        }

        .error-msg {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          padding: 12px;
          border-radius: 12px;
          font-size: 0.85rem;
          margin-bottom: 24px;
          border-left: 3px solid var(--danger);
        }

        .btn-auth {
          width: 100%;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          font-weight: 600;
          font-size: 1rem;
          box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4);
          transition: var(--transition);
        }

        .btn-auth:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px -5px rgba(59, 130, 246, 0.5);
        }

        .btn-loading {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-footer {
          margin-top: 32px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
