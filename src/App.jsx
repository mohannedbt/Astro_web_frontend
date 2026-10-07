import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Starfield from './components/Starfield';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import Magazine from './components/Magazine';
import SkyMap from './components/SkyMap';
import Workshops from './components/Workshops';
import Login from './components/Login';
import Register from './components/Register';
import Account from './components/Account';
import Events from './components/Events';
import Landing from './components/Landing';
import Committee from './components/Committee';
import AdminPanel from './components/AdminPanel';
import Tour from './components/Tour';
import AstroGames from './components/AstroGames';
import { buildAvatarUrl } from './utils/avatar';
import './App.css';

const parseJwt = (token) => {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
};

function App() {
  const [collapsed, setCollapsed] = useState(true);
  const [siteTheme, setSiteTheme] = useState('blue');
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => parseJwt(localStorage.getItem('token') || ''));
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('profile');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    const initial = parseJwt(localStorage.getItem('token') || '') || null;
    if (initial) return { name: initial.name || '', username: '', email: initial.email || initial.sub || '', avatar: '' };
    return null;
  });

  const persistProfile = (source = null) => {
    const stored = (() => {
      try {
        return JSON.parse(localStorage.getItem('profile') || '{}');
      } catch (e) {
        return {};
      }
    })();

    // If source represents a different user than stored, reset stored profile cache
    const isNewUser = source?.email && stored?.email && source.email.toLowerCase() !== stored.email.toLowerCase();
    const effectiveStored = isNewUser ? {} : stored;

    const seed = source?.avatar_seed || source?.username || source?.email || effectiveStored?.avatar_seed || effectiveStored?.username || effectiveStored?.email || 'astro';
    
    // Always calculate fresh default avatar for seed unless explicitly custom avatar provided
    const avatarUrl = source?.avatar || effectiveStored?.avatar || buildAvatarUrl(seed);

    const next = {
      ...(effectiveStored || {}),
      ...(source || {}),
      name: source?.name || effectiveStored?.name || '',
      username: source?.username || effectiveStored?.username || '',
      email: source?.email || effectiveStored?.email || '',
      bio: source?.bio || effectiveStored?.bio || '',
      location: source?.location || effectiveStored?.location || '',
      avatar_seed: seed,
      avatar: avatarUrl,
    };

    setProfile(next);
    try {
      localStorage.setItem('profile', JSON.stringify(next));
    } catch (e) {}
    return next;
  };

  const updateProfile = (updates) => {
    const next = { ...(profile || {}), ...updates };
    setProfile(next);
    try {
      localStorage.setItem('profile', JSON.stringify(next));
    } catch (e) {}
  };

  const pathToPage = (path) => {
    if (!path) return 'landing';
    const p = path.replace(/\/$/, '');
    if (p === '' || p === '/' || p === '/landing') return 'landing';
    if (p === '/dashboard') return 'dashboard';
    if (p === '/magazine') return 'magazine';
    if (p === '/skymap') return 'skymap';
    if (p === '/workshops') return 'workshops';
    if (p === '/events') return 'events';
    if (p === '/committee') return 'committee';
    if (p === '/login') return 'login';
    if (p === '/register') return 'register';
    if (p === '/account') return 'account';
    if (p === '/admin') return 'admin';
    if (p === '/astrogames') return 'astrogames';
    if (p === '/games' || p.startsWith('/games/')) return 'astrogames';
    if (p === '/game' || p.startsWith('/game/')) return 'astrogames';
    if (p.startsWith('/astrogames')) return 'astrogames';
    return 'dashboard';
  };

  const activePage = pathToPage(location.pathname);

  const pageToPath = (page) => {
    switch (page) {
      case 'landing':
        return '/landing';
      case 'dashboard':
        return '/dashboard';
      case 'magazine':
        return '/magazine';
      case 'skymap':
        return '/skymap';
      case 'workshops':
        return '/workshops';
      case 'events':
        return '/events';
      case 'committee':
        return '/committee';
      case 'login':
        return '/login';
      case 'register':
        return '/register';
      case 'account':
        return '/account';
      case 'admin':
        return '/admin';
      case 'astrogames':
        return '/astrogames';
      default:
        return '/dashboard';
    }
  };

  const setActivePage = (page) => {
    const path = pageToPath(page);
    navigate(path, { replace: false });
  };

  useEffect(() => {
    const parsed = parseJwt(token);
    if (parsed) {
      localStorage.setItem('token', token);
      setUser(parsed);
      persistProfile(parsed);
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    document.body.dataset.theme = siteTheme;
    return () => {
      document.body.removeAttribute('data-theme');
    };
  }, [siteTheme]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');

    if (!redirect) return;

    const normalized = redirect.startsWith('/') ? redirect : `/${redirect}`;
    const cleanPath = normalized.split('?')[0];

    if (cleanPath && cleanPath !== location.pathname) {
      navigate(cleanPath + (window.location.hash || ''), { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleLoginSuccess = (newToken, authUser = null) => {
    setToken(newToken);
    const decoded = authUser || parseJwt(newToken);
    if (decoded) {
      persistProfile(decoded);
    }
    setActivePage(location.pathname === '/events' ? 'events' : 'dashboard');
  };

  const handleLogout = () => {
    setToken('');
    setProfile(null);
    try {
      localStorage.removeItem('profile');
    } catch (e) {}
    setActivePage('landing');
  };

  const renderContent = () => {
    if ((activePage === 'admin' || activePage === 'account') && !user) {
      return <Login setActivePage={setActivePage} onLogin={handleLoginSuccess} />;
    }

    switch (activePage) {
      case 'landing':
        return <Landing setActivePage={setActivePage} user={user} />;
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} user={user} token={token} profile={profile} />;
      case 'magazine':
        return <Magazine />;
      case 'skymap':
        return <SkyMap />;
      case 'workshops':
        return <Workshops />;
      case 'admin':
        return user?.is_admin ? <AdminPanel token={token} /> : <Dashboard setActivePage={setActivePage} user={user} token={token} profile={profile} />;
      case 'events':
        return <Events token={token} setActivePage={setActivePage} user={user} />;
      case 'committee':
        return <Committee setActivePage={setActivePage} user={user} />;
      case 'astrogames':
        return <AstroGames user={user} profile={profile} setActivePage={setActivePage} />;
      case 'login':
        return <Login setActivePage={setActivePage} onLogin={handleLoginSuccess} />;
      case 'register':
        return <Register setActivePage={setActivePage} onLogin={handleLoginSuccess} />;
      case 'account':
        return <Account user={user} profile={profile} updateProfile={updateProfile} onLogout={handleLogout} setActivePage={setActivePage} />;
      default:
        return <Dashboard setActivePage={setActivePage} user={user} token={token} profile={profile} />;
    }
  };

  const noShellPages = ['landing', 'committee', 'login', 'register'];
  const requiresAuth = ['admin', 'account'];
  const showShell = !noShellPages.includes(activePage) && !(requiresAuth.includes(activePage) && !user);

  return (
    <>
      <Starfield />
      <div className="ambient-glow"></div>

      {showShell ? (
        <div className="shell">
          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            activePage={activePage}
            setActivePage={setActivePage}
            user={user}
            profile={profile}
          />
          {!collapsed && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setCollapsed(true)} />}

          <main className={`main ${collapsed ? 'expanded' : ''}`} id="main-content">
            <Topbar
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              activePage={activePage}
              setActivePage={setActivePage}
              user={user}
              theme={siteTheme}
              setTheme={setSiteTheme}
            />
            <Tour />
            {renderContent()}
          </main>
        </div>
      ) : (
        <>{renderContent()}</>
      )}
    </>
  );
}

export default App;
