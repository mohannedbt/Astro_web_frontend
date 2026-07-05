import React from 'react';
import { Menu, Search, Bell, Maximize } from 'lucide-react';

const Topbar = ({ collapsed, setCollapsed, activePage }) => {
  const getBreadcrumbs = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <>
            Club ACI / <span>Dashboard</span>
          </>
        );
      case 'magazine':
        return (
          <>
            Club Space / <span>Magazine</span>
          </>
        );
      case 'skymap':
        return (
          <>
            Club Space / <span>Live Sky Map</span>
          </>
        );
      case 'workshops':
        return (
          <>
            Activities / <span>Workshops</span>
          </>
        );
      case 'login':
        return (
          <>
            System / <span>Login</span>
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
            Activities / <span>Events</span>
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

  const renderRightButton = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <button style={{ color: 'var(--text-secondary)' }}>
            <Search size={18} />
          </button>
        );
      case 'magazine':
        return (
          <button style={{ color: 'var(--text-secondary)' }}>
            <Bell size={18} />
          </button>
        );
      case 'skymap':
        return (
          <button style={{ color: 'var(--text-secondary)' }}>
            <Maximize size={18} />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="toggle-sidebar" onClick={() => setCollapsed(!collapsed)}>
          <Menu />
        </button>
        <div className="breadcrumbs">{getBreadcrumbs()}</div>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={() => window.dispatchEvent(new Event('showTour'))} style={{ fontSize: 13, padding: '8px 10px' }}>Take Tour</button>
        {renderRightButton()}
      </div>
    </header>
  );
};

export default Topbar;
