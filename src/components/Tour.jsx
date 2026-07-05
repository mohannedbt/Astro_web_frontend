import React, { useEffect, useState } from 'react';

const steps = [
  { id: 'sidebar', title: 'Navigation', text: 'Use the sidebar to switch between Dashboard, Sky Map, Workshops and Events. Admin only items appear when you are logged in as admin.' },
  { id: 'topbar', title: 'Topbar', text: 'Topbar contains quick actions and search controls for the current page.' },
  { id: 'dashboard', title: 'Dashboard', text: 'This is the main hub: news, upcoming events and quick links to workshops.' },
  { id: 'workshops', title: 'Workshops', text: 'Browse and register for hands-on sessions. Admins can add/modify workshops from the Admin panel.' },
  { id: 'events', title: 'Events', text: 'Events lists local meetups and Facebook-imported events.' },
  { id: 'account', title: 'Account', text: 'Use the Account page to update your user profile and preferences.' },
];

const Tour = () => {
  const [visible, setVisible] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    function show() {
      setIdx(0);
      setVisible(true);
    }
    window.addEventListener('showTour', show);
    return () => window.removeEventListener('showTour', show);
  }, []);

  if (!visible) return null;

  const step = steps[idx];
  return (
    <div className="tour-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 520, background: 'var(--bg-surface)', padding: 24, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
        <h3 style={{ margin: 0 }}>{step.title}</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{step.text}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <div>
            <button onClick={() => { setVisible(false); localStorage.setItem('seen_tour', '1'); }}>Close</button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>Prev</button>
            {idx < steps.length - 1 ? (
              <button onClick={() => setIdx(idx + 1)}>Next</button>
            ) : (
              <button onClick={() => { setVisible(false); localStorage.setItem('seen_tour', '1'); }}>Finish</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tour;
