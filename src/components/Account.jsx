import React, { useState } from 'react';
import { User, Settings, Shield, Bell, LogOut, Eye, EyeOff } from 'lucide-react';
import { buildAvatarUrl, createAvatarSeed } from '../utils/avatar';

const Account = ({ user, profile, updateProfile, onLogout, setActivePage }) => {
  const [section, setSection] = useState('profile');
  const [name, setName] = useState(profile?.name || (user?.name || ''));
  const [username, setUsername] = useState(profile?.username || '');
  const [email, setEmail] = useState(profile?.email || (user?.email || ''));
  const [avatar, setAvatar] = useState(profile?.avatar || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState('');

  const avatarOptions = [
    '',
    buildAvatarUrl('astro1'),
    buildAvatarUrl('astro2'),
    buildAvatarUrl('astro3'),
    buildAvatarUrl('astro4'),
    buildAvatarUrl('astro5')
  ];

  const getPersonalAvatar = () => {
    const seed = profile?.avatar_seed || username || email || 'user';
    return buildAvatarUrl(seed);
  };

  const handleSave = () => {
    const nextAvatarSeed = profile?.avatar_seed || createAvatarSeed(username || email || name);
    const nextAvatar = avatar || buildAvatarUrl(nextAvatarSeed);
    updateProfile({ name, username, email, avatar: nextAvatar, avatar_seed: nextAvatarSeed, bio, location });
    setMessage('Profile saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }
    updateProfile({ name, username, email, avatar });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage('Password changed successfully!');
    setTimeout(() => setMessage(''), 3000);
  };
  return (
    <div className="page-content account-page">
      <div className="page-title-area">
        <h1>Account Settings</h1>
        <p>{user ? 'Manage your profile, preferences, and security settings.' : 'Login to unlock your full Astro Club experience.'}</p>
      </div>

      {!user ? (
        <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border)', padding: '32px' }}>
          <h2 style={{ marginBottom: '16px' }}>Observer Mode</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            You are browsing in public observer mode. Sign in to access your saved content, admin controls, and workshop registration.
          </p>
          <button className="btn btn-primary" onClick={() => setActivePage('login')}>
            Sign In
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '32px', marginTop: '24px' }}>
          {/* Sidebar Navigation */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border)', padding: '16px', height: 'fit-content' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => setSection('profile')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: section === 'profile' ? 'var(--glass-bg)' : 'transparent', border: '1px solid ' + (section === 'profile' ? 'var(--border)' : 'transparent'), borderRadius: '8px', color: section === 'profile' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontSize: '14px', transition: 'all 0.2s' }}
              >
                <User size={18}/> Profile
              </button>
              <button 
                onClick={() => setSection('security')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: section === 'security' ? 'var(--glass-bg)' : 'transparent', border: '1px solid ' + (section === 'security' ? 'var(--border)' : 'transparent'), borderRadius: '8px', color: section === 'security' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontSize: '14px', transition: 'all 0.2s' }}
              >
                <Shield size={18}/> Security
              </button>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />
              <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'transparent', border: '1px solid transparent', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', textAlign: 'left', fontSize: '14px' }}>
                <LogOut size={18}/> Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border)', padding: '32px' }}>
            {message && (
              <div style={{ background: '#10b981', color: 'white', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
                {message}
              </div>
            )}

            {section === 'profile' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <User size={20} /> Profile Information
                </h2>

                {/* Avatar Section */}
                <div style={{ paddingBottom: '32px', borderBottom: '1px solid var(--border)', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-secondary)' }}>Profile Picture</h3>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '12px', background: 'var(--glass-bg)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {avatar ? (
                        <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                      <img src={getPersonalAvatar()} alt="default avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-secondary)' }}>Avatar Image URL</label>
                      <input 
                        placeholder="https://example.com/avatar.jpg" 
                        value={avatar} 
                        onChange={(e) => setAvatar(e.target.value)} 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', marginBottom: '12px' }} 
                      />
                      <button onClick={() => setAvatar('')} style={{ padding: '8px 14px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}>Clear Avatar</button>
                      <div style={{ marginTop: '16px' }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>Abstract avatars (like GitHub):</p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {avatarOptions.map((opt, i) => (
                            <button 
                              key={i} 
                              onClick={() => setAvatar(opt)} 
                              style={{ 
                                width: 50, 
                                height: 50, 
                                borderRadius: '8px', 
                                border: avatar === opt ? '2px solid #3b82f6' : '1px solid var(--border)', 
                                background: opt ? `url(${opt}) center/cover` : 'var(--glass-bg)', 
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }} 
                              aria-label={`avatar-${i}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Full Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Username</label>
                    <input 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }} 
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', wordBreak: 'break-all' }} 
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '6px' }}>Used for login and notifications</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Location</label>
                    <input 
                      type="text" 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)} 
                      placeholder="City, Country" 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }} 
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Bio</label>
                  <textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    placeholder="Tell us about yourself..." 
                    maxLength="160"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', minHeight: '80px', fontFamily: 'inherit' }} 
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '6px' }}>{bio.length}/160</p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={handleSave} 
                    style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => { setName(profile?.name || (user?.name || '')); setUsername(profile?.username || ''); setEmail(profile?.email || (user?.email || '')); setAvatar(profile?.avatar || ''); setBio(profile?.bio || ''); setLocation(profile?.location || ''); }} 
                    style={{ padding: '10px 20px', background: 'var(--bg-base)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {section === 'security' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Shield size={20} /> Security Settings
                </h2>

                <div style={{ background: 'var(--bg-base)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px', color: 'var(--text-primary)' }}>Change Password</h3>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Current Password</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showPasswords ? 'text' : 'password'} 
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)} 
                        style={{ width: '100%', padding: '10px 14px', paddingRight: '40px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }} 
                      />
                      <button 
                        onClick={() => setShowPasswords(!showPasswords)} 
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      >
                        {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showPasswords ? 'text' : 'password'} 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        style={{ width: '100%', padding: '10px 14px', paddingRight: '40px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }} 
                      />
                      <button 
                        onClick={() => setShowPasswords(!showPasswords)} 
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      >
                        {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Confirm New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showPasswords ? 'text' : 'password'} 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        style={{ width: '100%', padding: '10px 14px', paddingRight: '40px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }} 
                      />
                      <button 
                        onClick={() => setShowPasswords(!showPasswords)} 
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      >
                        {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={handlePasswordChange} 
                      style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                    >
                      Update Password
                    </button>
                    <button 
                      onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }} 
                      style={{ padding: '10px 20px', background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
