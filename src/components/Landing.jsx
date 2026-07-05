import React from 'react';
import { ArrowRight, BookOpen, Calendar, Compass, Map, Mic, Sparkles, Star, Telescope, Users } from 'lucide-react';

const Landing = ({ setActivePage }) => {
  return (
    <div style={{ minHeight: '100vh', width: '100%', overflowY: 'auto', padding: '24px 20px 80px', background: 'radial-gradient(circle at top, rgba(167, 139, 250, 0.12), transparent 35%)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0 28px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', display: 'grid', placeItems: 'center' }}>
              <Star size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>Astro Club INSAT</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Community portal</div>
            </div>
          </div>
          <button onClick={() => setActivePage('login')} className="btn btn-secondary" style={{ padding: '10px 18px' }}>
            Sign In
          </button>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '34px', alignItems: 'center', padding: '44px 0 36px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '999px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', fontSize: '13px' }}>
              <Sparkles size={14} color="#a78bfa" /> Welcome to the club portal
            </div>
            <h1 style={{ fontSize: 'clamp(38px, 5vw, 62px)', lineHeight: 1.06, color: 'var(--text-primary)', margin: '18px 0 16px', fontWeight: 800 }}>
              Discover the night sky with a real astronomy community.
            </h1>
            <p style={{ fontSize: '17px', lineHeight: 1.8, color: 'var(--text-secondary)', maxWidth: '640px' }}>
              Explore public content about club events, workshops, astronomy news, live sky resources, and community activities before joining the full experience.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '24px' }}>
              <button onClick={() => setActivePage('login')} className="btn btn-primary" style={{ padding: '14px 24px', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Join the Club <ArrowRight size={16} />
              </button>
              <button onClick={() => setActivePage('dashboard')} className="btn btn-secondary" style={{ padding: '14px 24px', fontSize: '16px' }}>
                Browse the Dashboard
              </button>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '24px', padding: '24px', display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a78bfa', fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              <Telescope size={14} /> What you’ll find
            </div>
            <HighlightBox icon={<Calendar size={18} />} title="Upcoming events" description="Find astronomy meetups, observation nights, and club gatherings." />
            <HighlightBox icon={<BookOpen size={18} />} title="Space insights" description="Read recent news, stories, and discoveries curated for members." />
            <HighlightBox icon={<Mic size={18} />} title="Workshops" description="Discover lectures, labs, and hands-on sessions led by the club." />
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '16px' }}>
          <InfoCard icon={<Compass size={22} />} title="Explore the community" description="See what makes the club active, welcoming, and centered on curiosity." />
          <InfoCard icon={<Map size={22} />} title="Sky tools" description="Use live sky resources and observation guidance from the club hub." />
          <InfoCard icon={<Users size={22} />} title="Member experience" description="Sign in later to access deeper club tools and personalized features." />
          <InfoCard icon={<Star size={22} />} title="Built for astronomy lovers" description="From beginners to enthusiasts, the portal is shaped for everyone." />
        </section>

        <section style={{ marginTop: '42px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '24px', padding: '28px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{ color: '#a78bfa', fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Why people use it</div>
              <h2 style={{ fontSize: '28px', margin: '12px 0 10px', color: 'var(--text-primary)' }}>A simple way to discover and join club life.</h2>
              <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                This landing page is the front door to the Astro Club experience: quick introduction, visible highlights, and a clear path into the main portal.
              </p>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              <StepItem title="1. Discover" text="Browse the club’s mission, upcoming events, and public resources." />
              <StepItem title="2. Connect" text="Join the member experience with sign-in and access to more tools." />
              <StepItem title="3. Grow" text="Take part in workshops, astronomy content, and community activities." />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const HighlightBox = ({ icon, title, description }) => (
  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '16px', padding: '12px 14px' }}>
    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center', color: 'var(--text-primary)', flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{description}</div>
    </div>
  </div>
);

const InfoCard = ({ icon, title, description }) => (
  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '22px', minHeight: '170px' }}>
    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center', color: 'var(--text-primary)', marginBottom: '12px' }}>{icon}</div>
    <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</div>
    <div style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{description}</div>
  </div>
);

const StepItem = ({ title, text }) => (
  <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '16px', padding: '12px 14px' }}>
    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</div>
    <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{text}</div>
  </div>
);

export default Landing;
