import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, Sparkles, Star } from 'lucide-react';
import { login } from '../services/api';

const Login = ({ setActivePage, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(email, password);
      if (!res || !res.token) {
        setError('Login failed. Please verify your credentials.');
        return;
      }
      if (onLogin) {
        onLogin(res.token);
      } else {
        localStorage.setItem('token', res.token);
        setActivePage('dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px', background: 'var(--bg-base)' }}>
      <style>{`
        @keyframes authFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .auth-orbit { animation: authFloat 4s ease-in-out infinite; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '960px', display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', background: 'var(--bg-surface)' }}>
        <div style={{ position: 'relative', padding: '36px 32px', background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', borderRight: '1px solid var(--border)', minHeight: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: '0', background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.04), transparent 24%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.03), transparent 26%)' }} />
          <div style={{ position: 'absolute', inset: '0', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '18px 18px', opacity: '0.05' }} />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '320px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '18px' }}>
              <Sparkles size={14} /> Dark sky access
            </div>
            <div className="auth-orbit" style={{ width: '220px', height: '220px', margin: '0 auto 20px', borderRadius: '50%', border: '1px solid var(--border)', position: 'relative', background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.06), transparent 60%)' }}>
              <div style={{ position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '118px', height: '118px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)' }} />
              </div>
              <div style={{ position: 'absolute', left: '48px', top: '42px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.45)' }} />
              <div style={{ position: 'absolute', right: '46px', bottom: '44px', width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(255,255,255,0.38)' }} />
              <div style={{ position: 'absolute', left: '92px', bottom: '28px', width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center' }}>
                <Star size={18} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>Astro Club INSAT</div>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' }}>Welcome back</h1>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--text-secondary)', margin: '0 auto' }}>
              Sign in to access the club portal and continue your journey through the cosmos.
            </p>
          </div>
        </div>

        <div style={{ padding: '40px 36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '18px' }}>
              <LogIn size={14} /> Secure access
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Member sign in</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 24px', lineHeight: 1.6 }}>Enter your credentials to continue.</p>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter your email" style={{ width: '100%', padding: '13px 14px', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', outline: 'none' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Enter your password" style={{ width: '100%', padding: '13px 14px', paddingRight: '44px', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', outline: 'none' }} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {error && <div style={{ color: 'var(--text-secondary)', fontSize: '13px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: '12px' }}>{error}</div>}
              <button type="submit" className="btn-join" style={{ width: '100%', marginTop: '8px', justifyContent: 'center', padding: '12px 16px', borderRadius: '14px' }}>
                Sign In
              </button>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                <button type="button" className="btn-more" onClick={() => setActivePage('register')} style={{ color: 'var(--text-secondary)' }}>Create account</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
