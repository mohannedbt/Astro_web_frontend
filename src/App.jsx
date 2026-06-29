import React, { useState } from 'react';
import Starfield from './components/Starfield';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import Magazine from './components/Magazine';
import SkyMap from './components/SkyMap';
import Workshops from './components/Workshops';
import Login from './components/Login';
import Account from './components/Account';
import Events from './components/Events';
import Landing from './components/Landing';
import './App.css';

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('landing');

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'magazine':
        return <Magazine />;
      case 'skymap':
        return <SkyMap />;
      case 'workshops':
        return <Workshops />;
      case 'events':
        return <Events />;
      case 'login':
        return <Login setActivePage={setActivePage} />;
      case 'account':
        return <Account setActivePage={setActivePage} />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <>
      <Starfield />
      <div className="ambient-glow"></div>

      {activePage === 'landing' ? (
        <Landing setActivePage={setActivePage} />
      ) : (
        <div className="shell">
          <Sidebar
            collapsed={collapsed}
            activePage={activePage}
            setActivePage={setActivePage}
          />

          <main className={`main ${collapsed ? 'expanded' : ''}`} id="main-content">
            <Topbar
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              activePage={activePage}
            />
            {renderContent()}
          </main>
        </div>
      )}
    </>
  );
}

export default App;
