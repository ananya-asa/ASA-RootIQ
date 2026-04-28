
import { ShieldCheck, Trophy, Medal, User, Info } from 'lucide-react';

export function Leaderboard({ sessions, user }) {
  const myXP = sessions.length * 50 + sessions.filter(s => s.mode === 'learn').length * 50;
  const myLevel = Math.floor(myXP / 500) + 1;

  const mockUsers = [
    { name: 'Riya S.', xp: 4200, level: 9, bugs: 84 },
    { name: 'Arjun M.', xp: 3800, level: 8, bugs: 76 },
    { name: 'Priya K.', xp: 3200, level: 7, bugs: 64 },
  ];

  const me = {
    name: user?.displayName?.split(' ')[0] + ' (You)',
    xp: myXP,
    level: myLevel,
    bugs: sessions.length,
    isMe: true
  };

  const allUsers = [...mockUsers, me].sort((a, b) => b.xp - a.xp);

  return (
    <div style={lb.wrap}>
      <header style={lb.header}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <h2 style={lb.title}>Network Rankings</h2>
          <span style={lb.betaBadge}>BETA ACCESS</span>
        </div>
        <p style={lb.sub}>Global developer standing based on diagnostic velocity.</p>
      </header>

      <div style={lb.myStatusCard}>
        <div style={lb.profileSection}>
          <img src={user?.photoURL} alt="" style={lb.avatar} />
          <div>
            <div style={lb.profileName}>{user?.displayName}</div>
            <div style={lb.profileTier}><ShieldCheck size={12} /> VERIFIED DEVELOPER</div>
          </div>
        </div>
        <div style={lb.statGrid}>
          <div style={lb.statItem}>
            <div style={lb.statLabel}>RANK</div>
            <div style={lb.statValue}>#{allUsers.findIndex(u => u.isMe) + 1}</div>
          </div>
          <div style={lb.statItem}>
            <div style={lb.statLabel}>XP</div>
            <div style={lb.statValue}>{myXP}</div>
          </div>
        </div>
      </div>

      <div style={lb.table}>
        <div style={lb.tableHead}>
          <span style={{ width: 60 }}>RANK</span>
          <span style={{ flex: 1 }}>OPERATOR</span>
          <span style={{ width: 100, textAlign: 'right' }}>TRACES</span>
          <span style={{ width: 100, textAlign: 'right' }}>XP</span>
        </div>
        {allUsers.map((u, i) => (
          <div key={i} style={{ ...lb.row, ...(u.isMe ? lb.myRow : {}) }}>
            <span style={lb.rankNum}>{i + 1 === 1 ? <Trophy size={16} color="#ffa94d" /> : i + 1}</span>
            <span style={{ ...lb.userName, color: u.isMe ? '#7c6af7' : '#fff' }}>{u.name}</span>
            <span style={lb.userStat}>{u.bugs}</span>
            <span style={{ ...lb.userStat, color: '#fff' }}>{u.xp}</span>
          </div>
        ))}
      </div>

      <div style={lb.footerNote}>
        <Info size={14} />
        <span>Rankings synchronize every 24 hours. Competitive data is currently in encrypted beta.</span>
      </div>
    </div>
  );
}

const lb = {
  wrap: { padding: '40px' },
  header: { marginBottom: '32px' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#fff' },
  betaBadge: { background: '#7c6af715', color: '#7c6af7', fontSize: '0.65rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px' },
  sub: { fontSize: '0.9rem', color: '#555', marginTop: '8px' },
  myStatusCard: { background: 'linear-gradient(135deg, #0a0a12, #12121f)', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  profileSection: { display: 'flex', alignItems: 'center', gap: '16px' },
  avatar: { width: '48px', height: '48px', borderRadius: '8px', border: '2px solid #7c6af7' },
  profileName: { fontSize: '1.1rem', fontWeight: 700, color: '#fff' },
  profileTier: { fontSize: '0.65rem', fontWeight: 800, color: '#7c6af7', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' },
  statGrid: { display: 'flex', gap: '48px' },
  statItem: { textAlign: 'right' },
  statLabel: { fontSize: '0.6rem', fontWeight: 800, color: '#444', letterSpacing: '0.1em' },
  statValue: { fontSize: '1.8rem', fontWeight: 700, color: '#fff', fontFamily: 'monospace' },
  table: { background: '#0a0a12', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' },
  tableHead: { display: 'flex', padding: '16px 24px', background: '#050508', borderBottom: '1px solid #1e1e2e', fontSize: '0.65rem', fontWeight: 800, color: '#444', letterSpacing: '0.1em' },
  row: { display: 'flex', padding: '16px 24px', borderBottom: '1px solid #1e1e2e', alignItems: 'center' },
  myRow: { background: '#7c6af708' },
  rankNum: { width: 60, fontSize: '0.9rem', fontWeight: 700, color: '#444' },
  userName: { flex: 1, fontSize: '0.9rem', fontWeight: 600 },
  userStat: { width: 100, textAlign: 'right', fontSize: '0.85rem', color: '#555', fontFamily: 'monospace' },
  footerNote: { marginTop: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: '#333', fontSize: '0.75rem', padding: '16px', background: '#0a0a12', border: '1px solid #1e1e2e', borderRadius: '8px' }
};