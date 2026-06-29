import React from 'react';
import { Compass, BookOpen, Map, Mic, User, Calendar, LogOut } from 'lucide-react';

const Sidebar = ({ collapsed, activePage, setActivePage }) => {
  const navItems = [
    {
      section: 'Club Space',
      items: [
        { id: 'dashboard', label: 'ACI Dashboard', icon: Compass },
        { id: 'magazine', label: 'Magazine', icon: BookOpen },
        { id: 'skymap', label: 'Sky Map', icon: Map },
      ],
    },
    {
      section: 'Activities',
      items: [
        { id: 'workshops', label: 'Workshops', icon: Mic },
        { id: 'events', label: 'Events', icon: Calendar },
      ],
    },
  ];

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
          <div className="user-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={14} />
          </div>
          <div className="user-name">Observer Mode</div>
        </div>
        <div 
          onClick={() => setActivePage('landing')} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '12px' }}
        >
          <LogOut size={12} /> Exit Portal
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
