


import { useState, useEffect } from 'react';
import { auth, provider, db } from './firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';

// NEW: Professional Icon Imports
import { 
  LayoutDashboard, 
  History, 
  BrainCircuit, 
  Trophy, 
  Settings as SettingsIcon, 
  LogOut, 
  Zap, 
  Bug, 
  GraduationCap, 
  Sparkles, 
  ChevronRight,
  Terminal,
  Search
} from 'lucide-react';

import { ConceptMastery } from './ConceptMastery';
import { Leaderboard } from './Leaderboard';
import { Settings } from './Settings';

// ─── Helpers ────────────────────────────────────────────────────────────────
function classifyError(errorStr = '') {
  const e = errorStr.toLowerCase();
  if (e.includes('syntax')) return 'Syntax';
  if (e.includes('name') || e.includes('undefined')) return 'NameError';
  if (e.includes('type')) return 'TypeError';
  if (e.includes('index') || e.includes('range')) return 'IndexError';
  if (e.includes('attribute')) return 'AttributeError';
  if (e.includes('import') || e.includes('module')) return 'ImportError';
  return 'Other';
}

function timeAgo(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function CountUp({ end, duration = 1200 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <>{val}</>;
}

// ─── Login Page ──────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  return (
    <div style={s.loginWrap}>
      <div style={s.loginGlow} />
      <div style={s.loginCard}>
        <div style={s.loginLogo}>
          <Zap size={32} color="#7c6af7" fill="#7c6af7" />
          <span style={s.logoText}>ASA RootIQ</span>
        </div>
        <p style={s.loginTagline}>Engineered for Debugging.<br />Built for Growth.</p>
        <p style={s.loginSub}>The intelligent mentor for modern developers. Track mastery, solve bottlenecks, and scale your technical intuition.</p>
        <button style={s.loginBtn} onClick={onLogin}>
          <span>Continue with Google</span>
          <ChevronRight size={18} />
        </button>
        <p style={s.loginHint}>VS Code Extension Required</p>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'home', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { id: 'sessions', icon: <History size={18} />, label: 'Sessions' },
  { id: 'concepts', icon: <BrainCircuit size={18} />, label: 'Concepts' },
  { id: 'leaderboard', icon: <Trophy size={18} />, label: 'Leaderboard' },
  { id: 'settings', icon: <SettingsIcon size={18} />, label: 'Settings' },
];

function Sidebar({ active, setActive, user, onLogout }) {
  return (
    <aside style={s.sidebar}>
      <div style={s.sidebarLogo}>
        <Zap size={20} color="#7c6af7" fill="#7c6af7" />
        <span style={s.sidebarLogoText}>ASA RootIQ</span>
      </div>
      <nav style={s.nav}>
        {NAV.map(n => (
          <button
            key={n.id}
            style={{ ...s.navItem, ...(active === n.id ? s.navActive : {}) }}
            onClick={() => setActive(n.id)}
          >
            <span style={s.navIcon}>{n.icon}</span>
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
      <div style={s.sidebarFooter}>
        {user && (
          <>
            <img src={user.photoURL} alt="" style={s.avatar} referrerPolicy="no-referrer" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={s.footerName}>{user.displayName}</div>
              <div style={s.footerEmail}>Pro Tier</div>
            </div>
            <button style={s.logoutBtn} onClick={onLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KPICard({ icon, label, value, sub, accent }) {
  return (
    <div style={{ ...s.kpiCard, borderTop: `2px solid ${accent}` }}>
      <div style={s.kpiHeader}>
        <div style={{ color: accent }}>{icon}</div>
        <div style={s.kpiLabel}>{label.toUpperCase()}</div>
      </div>
      <div style={s.kpiNum}><CountUp end={value} /></div>
      {sub && <div style={s.kpiSub}>{sub}</div>}
    </div>
  );
}

// ─── Session Card ────────────────────────────────────────────────────────────
function SessionCard({ session }) {
  const type = classifyError(session.error);
  const modeColor = session.mode === 'learn' ? '#7c6af7' : '#ffa94d';
  return (
    <div style={s.sessionCard}>
      <div style={s.sessionTop}>
        <span style={{ ...s.pill, background: modeColor + '15', color: modeColor }}>
          {session.mode === 'learn' ? <GraduationCap size={12} style={{marginRight: 4}} /> : <Zap size={12} style={{marginRight: 4}} />}
          {session.mode === 'learn' ? 'Learn' : 'Quick Fix'}
        </span>
        <span style={{ ...s.pill, background: '#12121f', color: '#888', border: '1px solid #2a2a3e' }}>{type}</span>
        <span style={s.sessionTime}>{timeAgo(session.timestamp)}</span>
      </div>
      <div style={s.sessionError}>
        <Terminal size={14} style={{marginRight: 8, color: '#ef4444'}} />
        {session.error || 'Unknown Exception'}
      </div>
      {session.code && (
        <div style={s.sessionCode}>{session.code.slice(0, 100)}...</div>
      )}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState('home');

  const login = async () => {
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
    fetchSessions();
  };

  const logout = () => { signOut(auth); setUser(null); setSessions([]); };

  const fetchSessions = async () => {
    setLoading(true);
    const q = query(collection(db, 'sessions'), orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);
    setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  if (!user) return <LoginPage onLogin={login} />;

  const total = sessions.length;
  const learnCount = sessions.filter(s => s.mode === 'learn').length;
  const quickCount = sessions.filter(s => s.mode === 'quick').length;
  const streak = Math.min(total, 7);
  const xp = total * 50 + learnCount * 50;
  const level = Math.floor(xp / 500) + 1;
  const xpInLevel = xp % 500;

  const barData = Object.entries(sessions.reduce((acc, s) => {
    const t = classifyError(s.error);
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {})).map(([name, count]) => ({ name, count }));

  return (
    <div style={s.app}>
      <Sidebar active={page} setActive={setPage} user={user} onLogout={logout} />

      <main style={s.main}>
        {page === 'home' && (
          <>
            <div style={s.hero}>
              <div style={s.heroLeft}>
                <h1 style={s.heroTitle}>Systems Online, {user.displayName?.split(' ')[0]}</h1>
                <p style={s.heroSub}>Your debugging efficiency is up 12% this week. Keep iterating.</p>
                <div style={s.xpStrip}>
                  <span style={s.levelBadge}>LVL {level}</span>
                  <div style={s.xpBar}><div style={{ ...s.xpFill, width: `${(xpInLevel / 500) * 100}%` }} /></div>
                  <span style={s.xpText}>{xpInLevel}/500 XP</span>
                </div>
              </div>
              <div style={s.heroRight}>
                <div style={s.streakBox}>
                  <Zap size={24} color="#ffa94d" fill="#ffa94d" />
                  <span style={s.streakNum}>{streak}</span>
                  <span style={s.streakLabel}>DAY STREAK</span>
                </div>
                <button style={s.ctaBtn} onClick={() => setPage('sessions')}>
                  Analyze History <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div style={s.kpiRow}>
              <KPICard icon={<Bug size={20} />} label="Total Exceptions" value={total} sub="Across all environments" accent="#7c6af7" />
              <KPICard icon={<GraduationCap size={20} />} label="Deep Analysis" value={learnCount} sub="Logic-heavy sessions" accent="#69db7c" />
              <KPICard icon={<Zap size={20} />} label="Rapid Patches" value={quickCount} sub="Time-sensitive fixes" accent="#ffa94d" />
              <KPICard icon={<Sparkles size={20} />} label="System Rank" value={xp} sub="Global developer percentile" accent="#da77f2" />
            </div>

            <div style={s.chartsRow}>
              <div style={s.chartCard}>
                <h3 style={s.chartTitle}>ERROR DISTRIBUTION</h3>
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData}>
                      <XAxis dataKey="name" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#2a2a3e'}} contentStyle={{ background: '#0a0a12', border: '1px solid #2a2a3e', borderRadius: 8 }} />
                      <Bar dataKey="count" fill="#7c6af7" radius={[4, 4, 4, 4]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div style={s.emptySmall}>No Data Points</div>}
              </div>
              <div style={s.chartCard}>
                <h3 style={s.chartTitle}>VELOCITY (7D)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={[{l: 'M', c: 2}, {l: 'T', c: 5}, {l: 'W', c: 3}]}> {/* Placeholder logic */}
                    <CartesianGrid stroke="#1e1e2e" vertical={false} />
                    <XAxis dataKey="l" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} />
                    <Line type="monotone" dataKey="c" stroke="#7c6af7" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={s.section}>
              <h3 style={s.sectionTitle}>LATEST TRACES</h3>
              <div style={s.sessionGrid}>
                {sessions.slice(0, 6).map(s => <SessionCard key={s.id} session={s} />)}
              </div>
            </div>
          </>
        )}
        {page === 'sessions' && <div style={s.section}><h2 style={s.pageTitle}>Audit Log</h2><div style={s.sessionGrid}>{sessions.map(s => <SessionCard key={s.id} session={s} />)}</div></div>}
        {page === 'concepts' && <ConceptMastery sessions={sessions} />}
        {page === 'leaderboard' && <Leaderboard sessions={sessions} user={user} />}
        {page === 'settings' && <Settings user={user} />}
      </main>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = {
  app: { display: 'flex', minHeight: '100vh', background: '#050508', color: '#e0e0e0', fontFamily: "'Inter', sans-serif" },
  
  // Login
  loginWrap: { minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  loginGlow: { position: 'absolute', width: 500, height: 500, background: 'radial-gradient(circle, #7c6af715 0%, transparent 70%)' },
  loginCard: { background: '#0a0a12', border: '1px solid #1e1e2e', borderRadius: 16, padding: '60px 40px', maxWidth: 400, textAlign: 'center', zIndex: 1 },
  logoText: { fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginLeft: 10 },
  loginTagline: { fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: '24px 0 12px' },
  loginSub: { color: '#666', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 32 },
  loginBtn: { background: '#fff', color: '#000', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center' },
  loginHint: { color: '#333', fontSize: '0.75rem', marginTop: 16, textTransform: 'uppercase', letterSpacing: '0.1em' },

  // Sidebar
  sidebar: { width: 240, background: '#050508', borderRight: '1px solid #1e1e2e', display: 'flex', flexDirection: 'column', height: '100vh', sticky: 'top' },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: 10, padding: '32px 24px' },
  sidebarLogoText: { fontWeight: 800, fontSize: '1.1rem', color: '#fff' },
  nav: { flex: 1, padding: '0 12px' },
  navItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, width: '100%', marginBottom: 4, transition: '0.2s' },
  navActive: { background: '#12121f', color: '#7c6af7', boxShadow: 'inset 2px 0 0 #7c6af7' },
  sidebarFooter: { padding: '20px', borderTop: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', gap: 12 },
  avatar: { width: 32, height: 32, borderRadius: 6, border: '1px solid #2a2a3e' },
  footerName: { fontSize: '0.8rem', fontWeight: 600, color: '#fff' },
  footerEmail: { fontSize: '0.7rem', color: '#444' },
  logoutBtn: { background: 'transparent', border: 'none', color: '#444', cursor: 'pointer' },

  // Main
  main: { flex: 1, overflow: 'auto' },
  hero: { padding: '48px 40px', borderBottom: '1px solid #1e1e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, #0a0a12, #050508)' },
  heroTitle: { fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 8 },
  heroSub: { color: '#555', fontSize: '0.9rem' },
  xpStrip: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 },
  levelBadge: { fontSize: '0.65rem', fontWeight: 800, color: '#7c6af7', background: '#7c6af715', padding: '4px 8px', borderRadius: 4 },
  xpBar: { width: 120, height: 4, background: '#1e1e2e', borderRadius: 2 },
  xpFill: { height: '100%', background: '#7c6af7', borderRadius: 2 },
  xpText: { fontSize: '0.7rem', color: '#444' },
  heroRight: { textAlign: 'right' },
  streakBox: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 16 },
  streakNum: { fontSize: '1.8rem', fontWeight: 800, color: '#fff' },
  streakLabel: { fontSize: '0.6rem', color: '#444', letterSpacing: '0.1em' },
  ctaBtn: { background: 'transparent', border: '1px solid #2a2a3e', color: '#fff', padding: '8px 16px', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },

  // KPI
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '32px 40px' },
  kpiCard: { background: '#0a0a12', borderRadius: 12, padding: '24px', border: '1px solid #1e1e2e' },
  kpiHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
  kpiLabel: { fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', color: '#444' },
  kpiNum: { fontSize: '1.6rem', fontWeight: 700, color: '#fff', fontFamily: 'monospace' },
  kpiSub: { fontSize: '0.7rem', color: '#333', marginTop: 8 },

  // Charts
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '0 40px 40px' },
  chartCard: { background: '#0a0a12', borderRadius: 12, padding: '24px', border: '1px solid #1e1e2e' },
  chartTitle: { fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', color: '#444', marginBottom: 20 },

  // Sessions
  section: { padding: '0 40px' },
  sectionTitle: { fontSize: '0.7rem', fontWeight: 800, color: '#444', letterSpacing: '0.1em', marginBottom: 20 },
  sessionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  sessionCard: { background: '#0a0a12', borderRadius: 12, padding: '20px', border: '1px solid #1e1e2e' },
  sessionTop: { display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' },
  pill: { fontSize: '0.7rem', fontWeight: 600, padding: '4px 10px', borderRadius: 4, display: 'flex', alignItems: 'center' },
  sessionTime: { marginLeft: 'auto', fontSize: '0.7rem', color: '#444' },
  sessionError: { fontSize: '0.85rem', color: '#fff', fontWeight: 500, display: 'flex', alignItems: 'center', marginBottom: 12, fontFamily: 'monospace' },
  sessionCode: { fontSize: '0.75rem', color: '#444', background: '#050508', padding: '12px', borderRadius: 6, fontFamily: 'monospace' },
  emptySmall: { height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '0.8rem' }
};