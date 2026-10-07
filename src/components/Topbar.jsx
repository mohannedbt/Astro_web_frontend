import { Menu, Palette, LogIn, Home, Sparkles } from 'lucide-react';

const Topbar = ({ collapsed, setCollapsed, activePage, setActivePage, user, theme, setTheme }) => {
  const getBreadcrumbs = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <>
            Astro Club INSAT / <span>{user ? 'Member Dashboard' : 'Observer Hub'}</span>
          </>
        );
      case 'magazine':
        return (
          <>
            Club Space / <span>Cosmic Magazine</span>
          </>
        );
      case 'skymap':
        return (
          <>
            Club Space / <span>Live Zenith Sky Map</span>
          </>
        );
      case 'workshops':
        return (
          <>
            Activities / <span>Workshops & Labs</span>
          </>
        );
      case 'login':
        return (
          <>
            System / <span>Sign In</span>
          </>
        );
      case 'account':
        return (
          <>
            User / <span>Account Settings</span>
          </>
        );
      case 'events':
        return (
          <>
            Activities / <span>Club Events Timeline</span>
          </>
        );
      case 'astrogames':
        return (
          <>
            Club Space / <span>Space Arcade</span>
          </>
        );
      case 'committee':
        return (
          <>
            Astro Club INSAT / <span>Committee Board</span>
          </>
        );
      case 'admin':
        return (
          <>
            System / <span>Admin Panel</span>
          </>
        );
      default:
        return (
          <>
            Astro Club INSAT / <span>Dashboard</span>
          </>
        );
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="toggle-sidebar"
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Open navigation' : 'Collapse navigation'}
          aria-expanded={!collapsed}
          aria-controls="sidebar"
          title={collapsed ? 'Open navigation' : 'Collapse navigation'}
        >
          <Menu size={20} />
        </button>
        <div className="breadcrumbs">{getBreadcrumbs()}</div>
      </div>
      <div className="topbar-actions">
        <button
          className="topbar-action"
          type="button"
          onClick={() => setActivePage('landing')}
          title="Return to Landing Page"
        >
          <Home size={14} /> <span className="hide-on-mobile">Landing</span>
        </button>

        <button
          className="topbar-action"
          type="button"
          onClick={() => window.dispatchEvent(new Event('showTour'))}
          title="Quick Tour of Features"
        >
          <Sparkles size={14} /> <span className="hide-on-mobile">Tour</span>
        </button>

        <button
          className="topbar-action topbar-theme"
          type="button"
          onClick={() => setTheme(theme === 'blue' ? 'dark' : 'blue')}
          aria-label={`Toggle theme (currently ${theme})`}
          title={`Switch color theme (currently ${theme})`}
        >
          <Palette size={16} />
        </button>

        {!user ? (
          <button
            className="topbar-auth"
            type="button"
            onClick={() => setActivePage('login')}
          >
            <LogIn size={14} /> <span>Sign In</span>
          </button>
        ) : (
          <button
            className="topbar-auth is-member"
            type="button"
            onClick={() => setActivePage('account')}
            aria-label="Open account settings"
          >
            <span className="topbar-member-indicator" />
            <span>Member</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;
