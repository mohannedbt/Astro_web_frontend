import React from 'react';
import { LogIn } from 'lucide-react';

const Login = ({ setActivePage }) => {
  const handleLogin = (e) => {
    e.preventDefault();
    setActivePage('dashboard');
  };

  return (
    <div className="page-content login-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '60vh' }}>
      <div className="login-card" style={{ background: 'var(--bg-surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'var(--glass-bg)', border: '1px solid var(--border)', marginBottom: '16px' }}>
            <LogIn size={28} style={{ color: 'var(--text-primary)' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '500', color: 'var(--text-primary)' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Log in to your ACI account</p>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" placeholder="Enter your email" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', outline: 'none' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" placeholder="Enter your password" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', outline: 'none' }} required />
          </div>
          <button type="submit" className="btn-join" style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
