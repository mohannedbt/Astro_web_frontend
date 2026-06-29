import React from 'react';
import { ArrowRight, Compass, Calendar, BookOpen, Star } from 'lucide-react';

const Landing = ({ setActivePage }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Landing Hero Section */}
      <div style={{
        maxWidth: '800px',
        textAlign: 'center',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--border)',
          padding: '8px 16px',
          borderRadius: '30px',
          fontSize: '14px',
          color: 'var(--text-primary)',
          backdropFilter: 'blur(10px)'
        }}>
          <Star size={14} style={{ color: '#eab308' }} /> Astro Club INSAT Portal
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 8vw, 64px)',
          fontWeight: '700',
          lineHeight: '1.1',
          color: 'var(--text-primary)',
          margin: 0
        }}>
          Unveil the Secrets <br />
          <span style={{
            background: 'linear-gradient(135deg, #a78bfa, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>of the Cosmos</span>
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 3vw, 18px)',
          lineHeight: '1.6',
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Join INSAT's primary gathering place for amateur astronomers, deep-sky astrophotographers, and physics enthusiasts. Explore simulated live sky tracking, academic workshops, and space publications.
        </p>

        <div style={{
          display: 'flex',
          gap: '16px',
          marginTop: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button 
            onClick={() => setActivePage('dashboard')} 
            className="btn btn-primary"
            style={{
              padding: '14px 28px',
              fontSize: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Enter Dashboard <Compass size={18} />
          </button>
          
          <button 
            onClick={() => setActivePage('login')} 
            className="btn btn-secondary"
            style={{
              padding: '14px 28px',
              fontSize: '16px'
            }}
          >
            Sign In / Test Auth
          </button>
        </div>
      </div>

      {/* Feature grid on Landing */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
        maxWidth: '1000px',
        width: '100%',
        marginTop: '80px',
        zIndex: 10
      }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          backdropFilter: 'blur(10px)'
        }}>
          <Compass style={{ color: '#a78bfa', marginBottom: '16px' }} size={28} />
          <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)' }}>ACI Dashboard</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.4' }}>Access live stats, latest discoveries, and upcoming observational sync points.</p>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          backdropFilter: 'blur(10px)'
        }}>
          <Calendar style={{ color: '#6366f1', marginBottom: '16px' }} size={28} />
          <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)' }}>Astronomy Events</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.4' }}>Track meteor watches, celestial alignments, and physical telescope gatherings.</p>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          backdropFilter: 'blur(10px)'
        }}>
          <BookOpen style={{ color: '#f43f5e', marginBottom: '16px' }} size={28} />
          <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)' }}>Astro Magazine</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.4' }}>Read cosmic articles and review stacking workflows written by club leads.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
