import { 
    CheckCircle2, 
    CircleDot, 
    AlertCircle, 
    BookOpen, 
    Code2, 
    Variable, 
    Binary, 
    Layers, 
    Hammer, 
    Package, 
    HelpCircle,
    TrendingUp
  } from 'lucide-react';
  
  function classifyError(errorStr = '') {
    const e = String(errorStr).toLowerCase();
    if (e.includes('syntax')) return 'Syntax';
    if (e.includes('name') || e.includes('undefined') || e.includes('not defined')) return 'NameError';
    if (e.includes('type')) return 'TypeError';
    if (e.includes('index') || e.includes('range')) return 'IndexError';
    if (e.includes('attribute')) return 'AttributeError';
    if (e.includes('import') || e.includes('module')) return 'ImportError';
    return 'Other';
  }
  
  export function ConceptMastery({ sessions = [] }) {
    const concepts = [
      { key: 'Syntax', label: 'Syntax', icon: <Code2 size={18} />, color: '#ff6b6b' },
      { key: 'NameError', label: 'Name & Scope', icon: <Variable size={18} />, color: '#ffa94d' },
      { key: 'TypeError', label: 'Type Logic', icon: <Binary size={18} />, color: '#74c0fc' },
      { key: 'IndexError', label: 'Index & Range', icon: <Layers size={18} />, color: '#69db7c' },
      { key: 'AttributeError', label: 'Attributes', icon: <Hammer size={18} />, color: '#da77f2' },
      { key: 'ImportError', label: 'Dependencies', icon: <Package size={18} />, color: '#7c6af7' },
      { key: 'Other', label: 'Unclassified', icon: <HelpCircle size={18} />, color: '#888' },
    ];
  
    // Helper logic remains the same...
    const counts = sessions.reduce((acc, s) => {
      const t = classifyError(s.error);
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
  
    const learnCounts = sessions.filter(s => s.mode === 'learn').reduce((acc, s) => {
      const t = classifyError(s.error);
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
  
    function getMastery(key) {
      const learned = learnCounts[key] || 0;
      const all = counts[key] || 0;
      return all === 0 ? 0 : Math.min(Math.round((learned / all) * 100), 100);
    }
  
    function getStatus(mastery) {
      if (mastery === 0) return { label: 'PENDING', color: '#444', icon: <CircleDot size={12} /> };
      if (mastery < 80) return { label: 'EVOLVING', color: '#ffa94d', icon: <TrendingUp size={12} /> };
      return { label: 'MASTERED', color: '#69db7c', icon: <CheckCircle2 size={12} /> };
    }
  
    const mastered = concepts.filter(c => getMastery(c.key) >= 80).length;
    const inProgress = concepts.filter(c => {
      const m = getMastery(c.key);
      return m > 0 && m < 80;
    }).length;
  
    return (
      <div style={cm.wrap}>
        <header style={cm.header}>
          <div>
            <h2 style={cm.title}>Concept Mastery</h2>
            <p style={cm.sub}>Technical proficiency indexed by diagnostic depth.</p>
          </div>
        </header>
  
        <div style={cm.summaryRow}>
          <SummaryCard label="MASTERED" value={mastered} color="#69db7c" />
          <SummaryCard label="IN PROGRESS" value={inProgress} color="#ffa94d" />
          <SummaryCard label="NOT STARTED" value={concepts.length - mastered - inProgress} color="#444" />
        </div>
  
        <div style={cm.grid}>
          {concepts.map(c => {
            const mastery = getMastery(c.key);
            const status = getStatus(mastery);
            return (
              <div key={c.key} style={cm.card}>
                <div style={cm.cardTop}>
                  <div style={{ ...cm.iconBox, color: c.color }}>{c.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={cm.conceptName}>{c.label}</div>
                    <div style={{ ...cm.statusBadge, color: status.color }}>
                      {status.icon} <span style={{marginLeft: 4}}>{status.label}</span>
                    </div>
                  </div>
                  <div style={cm.masteryPercent}>{mastery}%</div>
                </div>
                <div style={cm.barContainer}>
                  <div style={{ ...cm.barFill, width: `${mastery}%`, background: c.color }} />
                </div>
                <div style={cm.cardStats}>
                  <span>{counts[c.key] || 0} TRACES</span>
                  <span>{learnCounts[c.key] || 0} ANALYSES</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  function SummaryCard({ label, value, color }) {
    return (
      <div style={cm.summaryCard}>
        <div style={{ ...cm.summaryValue, color }}>{value}</div>
        <div style={cm.summaryLabel}>{label}</div>
      </div>
    );
  }
  
  const cm = {
    wrap: { padding: '40px' },
    header: { marginBottom: '32px' },
    title: { fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '8px' },
    sub: { fontSize: '0.9rem', color: '#555' },
    summaryRow: { display: 'flex', gap: '16px', marginBottom: '32px' },
    summaryCard: { flex: 1, background: '#0a0a12', border: '1px solid #1e1e2e', padding: '24px', borderRadius: '12px' },
    summaryValue: { fontSize: '2rem', fontWeight: 800, fontFamily: 'monospace' },
    summaryLabel: { fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', color: '#444', marginTop: '4px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
    card: { background: '#0a0a12', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '24px' },
    cardTop: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' },
    iconBox: { width: '40px', height: '40px', background: '#12121f', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    conceptName: { fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '4px' },
    statusBadge: { fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center' },
    masteryPercent: { fontSize: '1.4rem', fontWeight: 700, color: '#fff', fontFamily: 'monospace' },
    barContainer: { height: '4px', background: '#1e1e2e', borderRadius: '2px', marginBottom: '12px', overflow: 'hidden' },
    barFill: { height: '100%', transition: 'width 1s ease' },
    cardStats: { display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 800, color: '#333', letterSpacing: '0.05em' }
  };