import { User, Shield, Terminal, Bell, ExternalLink, Moon } from 'lucide-react';
import { useMemo, useState } from 'react';

export function Settings({ user }) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [diagnosticNotifications, setDiagnosticNotifications] = useState(false);
  const [anonymousAnalytics, setAnonymousAnalytics] = useState(true);

  const apiKey = useMemo(() => {
    // Placeholder until this is wired to a real backend/secret store.
    return user?.uid ? `asa_${String(user.uid).slice(0, 8)}_••••••••` : 'asa_demo_••••••••';
  }, [user?.uid]);

  const SettingSection = ({ title, children, icon: Icon }) => (
    <div style={st.section}>
      <div style={st.sectionHeader}>
        <Icon size={16} color="#7c6af7" />
        <h3 style={st.sectionTitle}>{title}</h3>
      </div>
      <div style={st.sectionContent}>{children}</div>
    </div>
  );

  return (
    <div style={st.wrap}>
      <header style={st.header}>
        <h2 style={st.title}>System Settings</h2>
        <p style={st.sub}>Manage your diagnostic environment and account preferences.</p>
      </header>

      <div style={st.container}>
        {/* Profile Section */}
        <SettingSection title="Operator Profile" icon={User}>
          <div style={st.profileRow}>
            <img src={user?.photoURL} alt="" style={st.avatar} />
            <div>
              <div style={st.profileName}>{user?.displayName}</div>
              <div style={st.profileEmail}>{user?.email}</div>
              <span style={st.tierBadge}>PRO TIER ACTIVE</span>
            </div>
          </div>
        </SettingSection>

        {/* Extension Settings */}
        <SettingSection title="VS Code Integration" icon={Terminal}>
          <div style={st.inputGroup}>
            <label style={st.label}>API Key</label>
            <div style={st.apiKeyWrapper}>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                readOnly
                style={st.input}
              />
              <button
                type="button"
                style={st.secondaryBtn}
                onClick={() => setShowApiKey(v => !v)}
              >
                {showApiKey ? 'Hide' : 'Reveal'}
              </button>
            </div>
            <p style={st.hint}>Use this key in the ASA RootIQ extension settings to sync traces.</p>
          </div>
        </SettingSection>

        {/* Preferences */}
        <SettingSection title="Preferences" icon={Bell}>
          <div style={st.toggleRow}>
            <span>Diagnostic Notifications</span>
            <button
              type="button"
              style={diagnosticNotifications ? st.toggleActive : st.toggle}
              onClick={() => setDiagnosticNotifications(v => !v)}
              aria-pressed={diagnosticNotifications}
              aria-label="Toggle diagnostic notifications"
            >
              <div style={diagnosticNotifications ? st.toggleKnobActive : st.toggleKnob} />
            </button>
          </div>
          <div style={st.toggleRow}>
            <span>Anonymous Analytics</span>
            <button
              type="button"
              style={anonymousAnalytics ? st.toggleActive : st.toggle}
              onClick={() => setAnonymousAnalytics(v => !v)}
              aria-pressed={anonymousAnalytics}
              aria-label="Toggle anonymous analytics"
            >
              <div style={anonymousAnalytics ? st.toggleKnobActive : st.toggleKnob} />
            </button>
          </div>
        </SettingSection>
        
        <button
          type="button"
          style={st.dangerBtn}
          onClick={() => {
            const ok = window.confirm('Delete local account data from this device? This cannot be undone.');
            if (ok) window.alert('Not wired yet. Hook this up to your backend delete endpoint.');
          }}
        >
          Delete Account Data
        </button>
      </div>
    </div>
  );
}

const st = {
  wrap: { padding: '40px' },
  header: { marginBottom: '32px' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#fff' },
  sub: { fontSize: '0.9rem', color: '#555', marginTop: '8px' },
  container: { maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '32px' },
  
  section: { background: '#0a0a12', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '24px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #1e1e2e', paddingBottom: '12px' },
  sectionTitle: { fontSize: '0.75rem', fontWeight: 800, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' },
  
  profileRow: { display: 'flex', alignItems: 'center', gap: '20px' },
  avatar: { width: '64px', height: '64px', borderRadius: '12px', border: '1px solid #7c6af733' },
  profileName: { fontSize: '1.1rem', fontWeight: 700, color: '#fff' },
  profileEmail: { fontSize: '0.85rem', color: '#555', marginTop: '4px' },
  tierBadge: { display: 'inline-block', marginTop: '12px', fontSize: '0.6rem', fontWeight: 800, background: '#7c6af715', color: '#7c6af7', padding: '4px 8px', borderRadius: '4px' },
  
  label: { display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#444', marginBottom: '8px', textTransform: 'uppercase' },
  input: { background: '#050508', border: '1px solid #1e1e2e', color: '#fff', padding: '10px', borderRadius: '6px', flex: 1, fontSize: '0.9rem', fontFamily: 'monospace' },
  apiKeyWrapper: { display: 'flex', gap: '12px' },
  secondaryBtn: { background: '#1e1e2e', border: 'none', color: '#fff', padding: '0 16px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' },
  
  toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#e0e0e0', fontSize: '0.9rem', marginBottom: '16px' },
  toggle: { width: '36px', height: '20px', background: '#1e1e2e', borderRadius: '10px', position: 'relative', cursor: 'pointer', border: 'none', padding: 0 },
  toggleActive: { width: '36px', height: '20px', background: '#7c6af7', borderRadius: '10px', position: 'relative', cursor: 'pointer', border: 'none', padding: 0 },
  toggleKnob: { width: '14px', height: '14px', background: '#444', borderRadius: '50%', position: 'absolute', top: '3px', left: '3px' },
  toggleKnobActive: { width: '14px', height: '14px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', right: '3px' },
  
  dangerBtn: { background: 'transparent', border: '1px solid #ef444433', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginTop: '20px' }
};