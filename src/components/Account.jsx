import { useState } from 'react';
import { User, Shield, LogOut, Eye, EyeOff, Upload, Save, RotateCcw } from 'lucide-react';
import { buildAvatarUrl, createAvatarSeed } from '../utils/avatar';
import { optimizeImageFile } from '../utils/optimizeImage';

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
  const [messageType, setMessageType] = useState('success');

  const avatarOptions = [
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

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    try {
      setAvatar(await optimizeImageFile(file));
      setMessageType('success');
      setMessage('Photo ready. Save your profile to keep it.');
    } catch (error) {
      setMessageType('error');
      setMessage(error.message);
    }
  };

  const handleSave = () => {
    const nextAvatarSeed = profile?.avatar_seed || createAvatarSeed(username || email || name);
    const nextAvatar = avatar || buildAvatarUrl(nextAvatarSeed);
    try {
      updateProfile({ name, username, email, avatar: nextAvatar, avatar_seed: nextAvatarSeed, bio, location });
      setMessageType('success');
      setMessage('Profile saved in this browser.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save profile', error);
      setMessageType('error');
      setMessage('Could not save your profile. Browser storage may be full; free some space and try again.');
    }
  };

  const handleResetAvatar = () => {
    const nextAvatarSeed = profile?.avatar_seed || createAvatarSeed(username || email || name);
    const defaultAvatar = buildAvatarUrl(nextAvatarSeed);
    try {
      updateProfile({ avatar: defaultAvatar, avatar_seed: nextAvatarSeed });
      setAvatar(defaultAvatar);
      setMessageType('success');
      setMessage('Default avatar saved to your profile.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save default avatar', error);
      setMessageType('error');
      setMessage('Could not save your default avatar. Browser storage may be full; free some space and try again.');
    }
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setMessageType('error');
      setMessage('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setMessageType('error');
      setMessage('Password must be at least 6 characters');
      return;
    }
    try {
      updateProfile({ name, username, email, avatar });
    } catch (error) {
      console.error('Failed to save profile', error);
      setMessageType('error');
      setMessage('Could not save your profile. Browser storage may be full; free some space and try again.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMessageType('success');
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
        <div className="account-settings-layout">
          {/* Sidebar Navigation */}
          <nav className="account-settings-nav" aria-label="Account settings">
              <button 
                type="button"
                className={section === 'profile' ? 'active' : ''}
                onClick={() => setSection('profile')}
                aria-current={section === 'profile' ? 'page' : undefined}
              >
                <User size={18}/> Profile
              </button>
              <button 
                type="button"
                className={section === 'security' ? 'active' : ''}
                onClick={() => setSection('security')}
                aria-current={section === 'security' ? 'page' : undefined}
              >
                <Shield size={18}/> Security
              </button>
              <button type="button" className="account-sign-out" onClick={onLogout}>
                <LogOut size={18}/> Sign Out
              </button>
          </nav>

          {/* Main Content */}
          <div className="account-settings-card">
            {message && (
              <div
                role={messageType === 'error' ? 'alert' : 'status'}
                style={{
                  background: messageType === 'error' ? 'var(--color-error-bg)' : 'var(--color-success-bg)',
                  border: `1px solid ${messageType === 'error' ? 'var(--color-error-border)' : 'var(--color-success-border)'}`,
                  color: messageType === 'error' ? 'var(--color-error)' : 'var(--color-success)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  fontSize: '14px',
                }}
              >
                {message}
              </div>
            )}

            {section === 'profile' && (
              <div>
                <div className="account-section-heading">
                  <div>
                    <h2><User size={20} /> Profile Information</h2>
                    <p>Update your details and profile image.</p>
                  </div>
                </div>

                {/* Avatar Section */}
                <div className="account-avatar-section">
                  <div className="account-avatar-preview">
                      {avatar ? (
                        <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                      <img src={getPersonalAvatar()} alt="default avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                  </div>
                  <div className="account-avatar-controls">
                    <div className="account-avatar-buttons">
                      <label className="avatar-upload-button">
                        <Upload size={15} /> Choose photo
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} aria-label="Upload profile photo" />
                      </label>
                      <button className="account-reset-avatar" type="button" onClick={handleResetAvatar}>
                        <RotateCcw size={14} /> Reset to default
                      </button>
                    </div>
                    <p>Upload an image up to 5 MB. Your profile picture is stored in this browser.</p>
                    <label className="account-url-label" htmlFor="profile-avatar-url">Or paste a public image URL</label>
                    <input
                      id="profile-avatar-url"
                      className="account-avatar-url"
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={avatar.startsWith('data:') ? '' : avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                    />
                    <div className="account-avatar-presets">
                      <span>Choose a generated avatar</span>
                      <div>
                        {avatarOptions.map((option, index) => (
                          <button
                            key={index}
                            type="button"
                            className={avatar === option ? 'selected' : ''}
                            onClick={() => setAvatar(option)}
                            style={{ backgroundImage: `url("${option}")` }}
                            aria-label={`Select generated avatar ${index + 1}`}
                            aria-pressed={avatar === option}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="account-profile-row">
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

                <div className="account-profile-field">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', wordBreak: 'break-all' }} 
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '6px' }}>Used for login and notifications</p>
                </div>

                <div className="account-profile-row">
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

                <div className="account-profile-field">
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

                <div className="account-profile-actions">
                  <button 
                    type="button"
                    onClick={handleSave} 
                    className="btn btn-primary"
                  >
                    <Save size={16} /> Save changes
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setName(profile?.name || (user?.name || '')); setUsername(profile?.username || ''); setEmail(profile?.email || (user?.email || '')); setAvatar(profile?.avatar || ''); setBio(profile?.bio || ''); setLocation(profile?.location || ''); }} 
                    className="btn btn-secondary"
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
