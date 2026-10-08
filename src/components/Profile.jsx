import { useMemo } from 'react';
import { Award, Edit3, MapPin, Settings, ShieldCheck, Trophy } from 'lucide-react';
import { getRankFromXP, getUserTotalXP } from '../services/api';
import { buildAvatarUrl } from '../utils/avatar';

const Profile = ({ user, profile, setActivePage }) => {
  const displayName = profile?.name || user?.name || user?.email?.split('@')[0] || 'Member';
  const username = profile?.username || user?.email?.split('@')[0] || 'pilot';
  const avatar = profile?.avatar || buildAvatarUrl(profile?.avatar_seed || username);
  const totalXp = getUserTotalXP(profile?.email || user?.email || displayName);
  const rank = useMemo(() => getRankFromXP(totalXp), [totalXp]);

  if (!user) {
    return <div className="page-content account-page"><div className="account-empty-state"><h2>Sign in to view your profile</h2><button className="btn btn-primary" onClick={() => setActivePage('login')}>Sign in</button></div></div>;
  }

  return (
    <div className="page-content profile-page">
      <div className="page-title-area"><div><h1>Profile</h1><p>Your public Astro Club identity and progress.</p></div><button className="btn btn-secondary" onClick={() => setActivePage('account')}><Settings size={16} /> Account settings</button></div>
      <section className="discord-profile-card profile-view-card">
        <div className="discord-banner-header"><div className="discord-avatar-wrapper"><img src={avatar} alt={`${displayName} avatar`} className="discord-avatar-img" /><span className="discord-status-dot" title="Active member" /></div></div>
        <div className="discord-profile-body">
          <div className="profile-view-actions"><button className="btn btn-secondary" onClick={() => setActivePage('account')}><Edit3 size={14} /> Edit profile</button></div>
          <div className="discord-display-name">{displayName}{user.is_admin && <span className="profile-verified"><ShieldCheck size={13} /> Admin</span>}</div>
          <div className="discord-username">@{username}</div>
          <div className="discord-custom-status"><Trophy size={15} /> {rank.tier} member · {totalXp} XP</div>
          <div className="discord-divider" />
          <div className="discord-section-title">About</div>
          <div className="discord-bio-text">{profile?.bio || 'Astro Club INSAT member.'}</div>
          {profile?.location && <div className="profile-location"><MapPin size={14} /> {profile.location}</div>}
          <div className="discord-divider" />
          <div className="discord-section-title">Progress</div>
          <div className="discord-roles-row"><div className="discord-role-pill"><Award size={14} /> {rank.tier} · {rank.title}</div><div className="discord-role-pill"><span className="discord-role-dot" style={{ background: rank.color }} /> {totalXp} XP</div><div className="discord-role-pill"><span className="discord-role-dot" style={{ background: '#38bdf8' }} /> Astro Club member</div></div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
