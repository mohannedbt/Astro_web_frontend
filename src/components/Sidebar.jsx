import { Compass, BookOpen, Map, Mic, User, Calendar, Gamepad2, Settings, UserRound } from 'lucide-react';
import { buildAvatarUrl } from '../utils/avatar';

const Sidebar = ({ collapsed, setCollapsed, activePage, setActivePage, user, profile }) => {
  const navItems = [
    {
      section: 'Club Space',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Compass },
        { id: 'magazine', label: 'Magazine', icon: BookOpen },
        { id: 'skymap', label: 'Sky Map', icon: Map },
        { id: 'astrogames', label: 'AstroGames', icon: Gamepad2 },
      ],
    },
    {
      section: 'Activities',
      items: [
        { id: 'workshops', label: 'Workshops', icon: Mic },
        { id: 'events', label: 'Events', icon: Calendar },
      ],
    },
    {
      section: 'Your account',
      items: [
        { id: 'profile', label: 'Profile', icon: UserRound, memberOnly: true },
        { id: 'account', label: 'Settings', icon: Settings, memberOnly: true },
        { id: 'admin', label: 'Admin', icon: User, adminOnly: true },
      ],
    },
  ];

  const getAbstractAvatar = () => {
    const seed = profile?.avatar_seed || profile?.username || user?.avatar_seed || user?.email || 'user';
    return buildAvatarUrl(seed);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} id="sidebar" aria-label="Main sidebar">
      <button className="sidebar-logo" type="button" onClick={() => setActivePage('dashboard')} aria-label="ACI Dashboard">
        <div className="logo-icon">
          <img
            src="/profile.png"
            alt=""
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        <div className="logo-name">
          <span className="logo-name-title">Astro Club INSAT</span>
          <small>The astronomy club at INSAT</small>
        </div>
      </button>

      <nav className="sidebar-navigation" aria-label="Club navigation">
        {navItems.map((sectionGroup) => (
        <div className="nav-section" key={sectionGroup.section}>
          <div className="nav-label">{sectionGroup.section}</div>
          {sectionGroup.items.map((item) => {
            if (item.adminOnly && !user?.is_admin) return null;
            if (item.memberOnly && !user) return null;
            const IconComponent = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                className={`nav-item ${isActive ? 'active' : ''}`}
                type="button"
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  if (window.matchMedia('(max-width: 980px)').matches) setCollapsed(true);
                }}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <IconComponent aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        ))}
      </nav>

      <button
        className="sidebar-user"
        type="button"
        onClick={() => setActivePage(user ? 'profile' : 'login')}
        title={collapsed ? (user ? profile?.name || user?.email || 'Account' : 'Sign in as Member') : undefined}
        aria-label={user ? 'Open profile' : 'Sign in as a member'}
      >
        {user ? (
          <>
            <div className="user-avatar">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <img src={getAbstractAvatar()} alt="" />
              )}
            </div>
            <div className="sidebar-user-copy">
              <div className="user-name">{profile?.name ? `${profile.name}` : user?.email ? `${user.email}` : 'Member'}</div>
              <span className="sidebar-user-role">{user?.is_admin ? 'Admin' : 'Active Member'}</span>
            </div>
          </>
        ) : (
          <>
            <div className="user-avatar observer-avatar">
              🔭
            </div>
            <div className="sidebar-user-copy">
              <div className="user-name">Observer Mode</div>
              <span className="sidebar-user-role">Sign in to join</span>
            </div>
          </>
        )}
      </button>
    </aside>
  );
};

export default Sidebar;
