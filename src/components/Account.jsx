import { useState } from 'react';
import { Eye, EyeOff, LogOut, Palette, Save, Shield, User } from 'lucide-react';
import { buildAvatarUrl, createAvatarSeed } from '../utils/avatar';
import { optimizeImageFile } from '../utils/optimizeImage';
import { updateAuthProfile } from '../services/api';

const FREE_THEMES = [
  { id: 'blue', label: 'Ocean Blue', description: 'The default astronomy interface.' },
  { id: 'violet', label: 'Deep Violet', description: 'A warmer night-sky palette.' },
  { id: 'slate', label: 'Graphite', description: 'Low-contrast neutral surfaces.' },
];

const Account = ({ user, profile, updateProfile, onLogout, setActivePage, theme, setTheme, token }) => {
  const [section, setSection] = useState('profile');
  const [name, setName] = useState(profile?.name || user?.name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [email, setEmail] = useState(profile?.email || user?.email || '');
  const [avatar, setAvatar] = useState(profile?.avatar || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [showPasswords, setShowPasswords] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  if (!user) {
    return (
      <div className="page-content account-page">
        <div className="page-title-area"><h1>Account settings</h1><p>Sign in to manage your account.</p></div>
        <div className="account-empty-state">
          <h2>Observer mode</h2>
          <p>Sign in to edit your profile, change security settings, and manage preferences.</p>
          <button className="btn btn-primary" onClick={() => setActivePage('login')}>Sign in</button>
        </div>
      </div>
    );
  }

  const currentAvatar = avatar || buildAvatarUrl(profile?.avatar_seed || username || email || 'user');
  const saveProfile = async () => {
    const avatarSeed = profile?.avatar_seed || createAvatarSeed(username || email || name);
    try {
      const result = await updateAuthProfile(token, { name, username, email, bio, location });
      updateProfile({ ...result.user, name, username, email, avatar: currentAvatar, avatar_seed: avatarSeed, bio, location });
      if (result.token) localStorage.setItem('token', result.token);
      setMessageType('success');
      setMessage('Profile changes saved.');
    } catch (error) {
      setMessageType('error');
      setMessage(error.message || 'Profile changes could not be saved.');
    }
  };
  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      setAvatar(await optimizeImageFile(file));
      setMessage('Photo ready. Save your profile to keep it.');
      setMessageType('success');
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    }
  };
  const changePassword = () => {
    if (newPassword.length < 6 || newPassword !== confirmPassword) {
      setMessage('Use a password of at least six characters and enter it twice.');
      setMessageType('error');
      return;
    }
    setNewPassword('');
    setConfirmPassword('');
    setMessage('Password update request saved locally. Connect this form to the auth endpoint to apply it server-side.');
    setMessageType('success');
  };

  return (
    <div className="page-content account-page">
      <div className="page-title-area">
        <div>
          <h1>Account settings</h1>
          <p>Manage your identity, security, and interface preferences.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setActivePage('profile')}><User size={16} /> View profile</button>
      </div>

      <div className="account-settings-layout">
        <nav className="account-settings-nav" aria-label="Account settings">
          <button className={section === 'profile' ? 'active' : ''} onClick={() => setSection('profile')}><User size={18} /> Profile details</button>
          <button className={section === 'security' ? 'active' : ''} onClick={() => setSection('security')}><Shield size={18} /> Security</button>
          <button className={section === 'appearance' ? 'active' : ''} onClick={() => setSection('appearance')}><Palette size={18} /> Appearance</button>
          <button className="account-sign-out" onClick={onLogout}><LogOut size={18} /> Sign out</button>
        </nav>

        <main className="account-settings-card">
          {message && <div className={`account-message ${messageType}`} role={messageType === 'error' ? 'alert' : 'status'}>{message}</div>}

          {section === 'profile' && (
            <section className="settings-section">
              <div className="settings-section-heading"><div><h2>Profile details</h2><p>These details appear on your public profile.</p></div></div>
              <div className="account-avatar-section">
                <div className="account-avatar-preview"><img src={currentAvatar} alt="Profile avatar" /></div>
                <div className="account-avatar-controls">
                  <div className="account-avatar-buttons">
                    <label className="avatar-upload-button"><span>Choose photo</span><input type="file" accept="image/*" onChange={handleUpload} /></label>
                    <button className="account-reset-avatar" onClick={() => setAvatar(buildAvatarUrl(profile?.avatar_seed || username || email || 'user'))}>Reset avatar</button>
                  </div>
                  <p>Use a clear image up to 5 MB. Your avatar is stored in this browser.</p>
                </div>
              </div>
              <div className="account-profile-row">
                <label>Full name<input value={name} onChange={(event) => setName(event.target.value)} /></label>
                <label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Your public username" /></label>
              </div>
              <label className="account-profile-field">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Add an email later (optional)" /><small>Optional. You can use it to sign in after adding it.</small></label>
              <div className="account-profile-row"><label>Location<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, country" /></label></div>
              <label className="account-profile-field">About you<textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={160} placeholder="Tell the club a little about yourself." /><small>{bio.length}/160</small></label>
              <div className="account-profile-actions"><button className="btn btn-primary" onClick={saveProfile}><Save size={16} /> Save changes</button><button className="btn btn-secondary" onClick={() => setActivePage('profile')}>Preview profile</button></div>
            </section>
          )}

          {section === 'security' && (
            <section className="settings-section">
              <div className="settings-section-heading"><div><h2>Security</h2><p>Keep your account access protected.</p></div></div>
              <div className="settings-panel">
                <h3>Change password</h3>
                <label>New password<div className="password-input"><input type={showPasswords ? 'text' : 'password'} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /><button onClick={() => setShowPasswords(!showPasswords)} aria-label="Toggle password visibility">{showPasswords ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
                <label>Confirm new password<input type={showPasswords ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
                <button className="btn btn-primary" onClick={changePassword}>Update password</button>
              </div>
            </section>
          )}

          {section === 'appearance' && (
            <section className="settings-section">
              <div className="settings-section-heading"><div><h2>Appearance</h2><p>Choose a free interface theme. Experimental cosmetics remain available only in the admin sandbox.</p></div></div>
              <div className="theme-choice-grid">
                {FREE_THEMES.map((option) => <button key={option.id} className={`theme-choice ${theme === option.id ? 'active' : ''}`} onClick={() => setTheme(option.id)}><span className={`theme-preview theme-${option.id}`} /><strong>{option.label}</strong><small>{option.description}</small></button>)}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export { FREE_THEMES };
export default Account;
