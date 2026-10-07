import { Menu, Palette, LogIn, Home, Sparkles } from 'lucide-react';

const Topbar = ({ collapsed, setCollapsed, activePage, setActivePage, user, theme, setTheme }) => {
  const getBreadcrumbs = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <>
            Club ACI / <span>{user ? 'Member Dashboard' : 'Observer Hub'}</span>
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
            Club ACI / <span>Committee Board</span>
          </>
        );
      default:
        return (
          <>
            Club ACI / <span>Dashboard</span>
          </>
        );
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="toggle-sidebar"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Open navigation' : 'Collapse navigation'}
          title={collapsed ? 'Open navigation' : 'Collapse navigation'}
        >
          <Menu size={20} />
        </button>
        <div className="breadcrumbs">{getBreadcrumbs()}</div>
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={() => setActivePage('landing')}
          style={{
            color: 'var(--text-secondary)',
            fontSize: '13px',
            padding: '7px 12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'rgba(255, 255, 255, 0.03)',
            transition: 'var(--transition)',
          }}
          title="Return to Landing Page"
        >
          <Home size={14} /> <span className="hide-on-mobile">Landing</span>
        </button>

        <button
          onClick={() => window.dispatchEvent(new Event('showTour'))}
          style={{
            fontSize: '13px',
            padding: '7px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            background: 'rgba(255, 255, 255, 0.03)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
          }}
          title="Quick Tour of Features"
        >
          <Sparkles size={14} /> <span className="hide-on-mobile">Tour</span>
        </button>

        <button
          onClick={() => setTheme(theme === 'blue' ? 'dark' : 'blue')}
          style={{
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'rgba(255, 255, 255, 0.03)',
          }}
          aria-label={`Toggle theme (currently ${theme})`}
          title={`Switch color theme (currently ${theme})`}
        >
          <Palette size={16} />
        </button>

        {!user ? (
          <button
            onClick={() => setActivePage('login')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              borderRadius: '999px',
              background: 'var(--accent)',
              color: '#07111b',
              fontWeight: 600,
              fontSize: '13px',
              boxShadow: '0 0 16px rgba(125, 211, 252, 0.28)',
              transition: 'var(--transition)',
            }}
          >
            <LogIn size={14} /> <span>Sign In</span>
          </button>
        ) : (
          <button
            onClick={() => setActivePage('account')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '999px',
              background: 'rgba(125, 211, 252, 0.1)',
              border: '1px solid rgba(125, 211, 252, 0.25)',
              color: 'var(--accent)',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-success)' }} />
            <span>Member</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;
