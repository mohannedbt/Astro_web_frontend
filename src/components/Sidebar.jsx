import React from 'react';
import { Compass, BookOpen, Map, Mic, User, Calendar, Gamepad2 } from 'lucide-react';

const Sidebar = ({ collapsed, activePage, setActivePage, user, profile }) => {
  const navItems = [
    {
      section: 'Club Space',
      items: [
        { id: 'dashboard', label: 'ACI Dashboard', icon: Compass },
        { id: 'magazine', label: 'Magazine', icon: BookOpen },
        { id: 'skymap', label: 'Sky Map', icon: Map },
        { id: 'astrogames', label: 'AstroGames', icon: Gamepad2 },
      ],
    },
    {
      section: 'Activities',
      items: [
        { id: 'workshops', label: 'Workshops', icon: Mic },
        { id: 'calendar', label: 'Astro Calendar', icon: Calendar },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'admin', label: 'Admin', icon: User, adminOnly: true },
      ],
    },
  ];

  // Generate abstract avatar URL based on username/email
  const getAbstractAvatar = () => {
    const seed = profile?.username || user?.email || 'user';
    return `https://api.dicebear.com/7.x/geometric/svg?seed=${encodeURIComponent(seed)}&scale=80`;
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} id="sidebar">
      <div className="sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => setActivePage('dashboard')}>
        <div className="logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: '6px' }}>
          <img
            src="/profile.png"
            alt="Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        <div className="logo-name">
          ACI<span>.</span>
        </div>
      </div>

      {navItems.map((sectionGroup) => (
        <div className="nav-section" key={sectionGroup.section}>
          <div className="nav-label">{sectionGroup.section}</div>
          {sectionGroup.items.map((item) => {
            if (item.adminOnly && !user?.is_admin) return null;
            const IconComponent = item.icon;
            const isActive = activePage === item.id;
            return (
              <div
                className={`nav-item ${isActive ? 'active' : ''}`}
                key={item.id}
                onClick={() => setActivePage(item.id)}
              >
                <IconComponent />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      ))}

      <div className="sidebar-user" style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setActivePage('account')}>
          <div className="user-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', borderRadius: '50%', overflow: 'hidden' }}>
            {profile?.avatar ? (
              <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <img src={getAbstractAvatar()} alt="default avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            )}
          </div>
          <div className="user-name">{profile?.name ? `${profile.name}` : user?.email ? `${user.email}` : 'Guest'}</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
