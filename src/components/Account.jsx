import React from 'react';
import { User, Settings, Shield, Bell, LogOut } from 'lucide-react';

const Account = ({ setActivePage }) => {
  return (
    <div className="page-content account-page">
      <div className="page-title-area">
        <h1>Account Settings</h1>
        <p>Manage your profile, preferences, and security settings.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '32px', marginTop: '24px' }}>
        <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px', height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--glass-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left' }}><User size={18}/> Profile</button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'transparent', border: '1px solid transparent', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' }}><Settings size={18}/> Preferences</button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'transparent', border: '1px solid transparent', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' }}><Shield size={18}/> Security</button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'transparent', border: '1px solid transparent', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' }}><Bell size={18}/> Notifications</button>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
            <button onClick={() => setActivePage('login')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'transparent', border: '1px solid transparent', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', textAlign: 'left' }}><LogOut size={18}/> Sign Out</button>
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border)', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><User size={20} /> Profile Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--glass-bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={32} style={{ color: 'var(--text-secondary)' }}/>
              </div>
              <div>
                <button className="btn-join" style={{ padding: '8px 16px' }}>Upload New Avatar</button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Full Name</label>
                <input type="text" defaultValue="Observer Mode" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email Address</label>
                <input type="email" defaultValue="observer@astroclub.space" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Role</label>
                <input type="text" defaultValue="Enthusiast" disabled style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-tertiary)', outline: 'none', cursor: 'not-allowed' }} />
              </div>
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <button className="btn-join">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
