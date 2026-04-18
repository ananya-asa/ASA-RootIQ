import { useState, useEffect } from 'react';
import { auth, provider, db } from './firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#ff6b6b', '#ffa94d', '#69db7c', '#74c0fc'];

export default function App() {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
    fetchSessions();
  };

  const logout = () => {
    signOut(auth);
    setUser(null);
    setSessions([]);
  };

  const fetchSessions = async () => {
    setLoading(true);
    const q = query(collection(db, 'sessions'), orderBy('timestamp', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSessions(data);
    setLoading(false);
  };

  // Error category breakdown for chart
  const categories = sessions.reduce((acc, s) => {
    const type = s.error?.includes('Syntax') ? 'Syntax' :
                 s.error?.includes('Name') ? 'NameError' :
                 s.error?.includes('Type') ? 'TypeError' : 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(categories).map(([name, value]) => ({ name, value }));

  if (!user) return (
    <div style={styles.loginPage}>
      <div style={styles.loginBox}>
        <h1 style={styles.logo}>🎓 ASA RootIQ</h1>
        <p style={styles.tagline}>Don't just fix bugs. Understand them.</p>
        <button style={styles.loginBtn} onClick={login}>
          Sign in with Google
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.app}>
      <nav style={styles.nav}>
        <h1 style={styles.logo}>🎓 ASA RootIQ</h1>
        <div style={styles.navRight}>
          <span style={styles.username}>{user.displayName}</span>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>
        {/* Stats Row */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <h2 style={styles.statNum}>{sessions.length}</h2>
            <p style={styles.statLabel}>Bugs Analyzed</p>
          </div>
          <div style={styles.statCard}>
            <h2 style={styles.statNum}>
              {sessions.filter(s => s.mode === 'learn').length}
            </h2>
            <p style={styles.statLabel}>Learn Sessions</p>
          </div>
          <div style={styles.statCard}>
            <h2 style={styles.statNum}>
              {sessions.filter(s => s.mode === 'quick').length}
            </h2>
            <p style={styles.statLabel}>Quick Fixes</p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div style={styles.chartBox}>
            <h3 style={styles.sectionTitle}>Error Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sessions List */}
        <h3 style={styles.sectionTitle}>Recent Sessions</h3>
        {loading ? <p style={{color:'#888'}}>Loading...</p> : sessions.map(s => (
          <div key={s.id} style={styles.sessionCard}>
            <div style={styles.sessionHeader}>
              <span style={s.mode === 'quick' ? styles.badgeQuick : styles.badgeLearn}>
                {s.mode === 'quick' ? '⚡ Quick Fix' : '🎓 Learn Mode'}
              </span>
              <span style={styles.sessionTime}>
                {s.timestamp?.toDate().toLocaleDateString()}
              </span>
            </div>
            <p style={styles.sessionError}>❌ {s.error}</p>
            <p style={styles.sessionCode}>{s.code?.slice(0, 100)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  app: { background: '#0f0f1a', minHeight: '100vh', color: '#e0e0e0', fontFamily: 'Segoe UI, sans-serif' },
  loginPage: { background: '#0f0f1a', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  loginBox: { textAlign: 'center', padding: '40px', background: '#1e1e2e', borderRadius: '16px', border: '1px solid #2a2a3e' },
  logo: { color: '#7c6af7', fontSize: '2em', marginBottom: '10px' },
  tagline: { color: '#888', marginBottom: '30px' },
  loginBtn: { background: '#7c6af7', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', cursor: 'pointer', fontSize: '1em' },
  nav: { background: '#1e1e2e', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2a2a3e' },
  navRight: { display: 'flex', alignItems: 'center', gap: '15px' },
  username: { color: '#888' },
  logoutBtn: { background: 'transparent', color: '#ff6b6b', border: '1px solid #ff6b6b', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer' },
  container: { padding: '30px', maxWidth: '900px', margin: '0 auto' },
  statsRow: { display: 'flex', gap: '20px', marginBottom: '30px' },
  statCard: { flex: 1, background: '#1e1e2e', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #2a2a3e' },
  statNum: { color: '#7c6af7', fontSize: '2em' },
  statLabel: { color: '#888', marginTop: '5px' },
  chartBox: { background: '#1e1e2e', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #2a2a3e' },
  sectionTitle: { color: '#7c6af7', marginBottom: '15px' },
  sessionCard: { background: '#1e1e2e', padding: '20px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #2a2a3e' },
  sessionHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  badgeQuick: { background: '#ffa94d22', color: '#ffa94d', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85em' },
  badgeLearn: { background: '#7c6af722', color: '#7c6af7', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85em' },
  sessionTime: { color: '#555', fontSize: '0.85em' },
  sessionError: { color: '#ff6b6b', marginBottom: '8px', fontSize: '0.9em' },
  sessionCode: { color: '#555', fontFamily: 'monospace', fontSize: '0.85em' },
};