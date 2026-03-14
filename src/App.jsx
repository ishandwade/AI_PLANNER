import React, { useState, useEffect, useCallback } from 'react';
import AppShell from './components/layout/AppShell';
import OrbViewer from './components/orb/OrbViewer';
import CalendarView from './components/calendar/CalendarView';

const API_BASE = 'http://localhost:8002';

// --- Google Sign-In Button ---
function GoogleSignInButton({ onClick, loading }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: loading ? '#e8e8e8' : hovered ? '#f5f5f5' : '#ffffff',
        border: 'none',
        borderRadius: '4px',
        padding: '11px 24px 11px 12px',
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: hovered && !loading
          ? '0 4px 12px rgba(0,0,0,0.4)'
          : '0 2px 4px rgba(0,0,0,0.25)',
        transition: 'all 0.2s ease',
        fontFamily: 'Roboto, sans-serif',
        fontSize: '15px',
        fontWeight: 500,
        color: 'rgba(0,0,0,0.54)',
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        opacity: loading ? 0.75 : 1,
      }}
    >
      {loading ? (
        <div style={{
          width: 18, height: 18,
          border: '2px solid #ddd',
          borderTopColor: '#4285F4',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          flexShrink: 0,
        }} />
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
          <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
        </svg>
      )}
      {loading ? 'Redirecting to Google...' : 'Sign in with Google'}
    </button>
  );
}

// --- Auth Overlay ---
function AuthOverlay({ hasCredentials, onRefresh }) {
  const [signingIn, setSigningIn] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);

  const handleSignIn = () => {
    setSigningIn(true);
    window.location.href = `${API_BASE}/auth/login`;
  };

  const handleRefresh = async () => {
    setChecking(true);
    setCheckFailed(false);
    await onRefresh();
    // Give React a tick to re-render; if still on step 1, show feedback
    setTimeout(() => {
      setChecking(false);
      setCheckFailed(true);
    }, 600);
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(12px)',
        gap: '2rem',
        animation: 'fadeUp 0.3s ease',
      }}>

        {/* Branding */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            color: '#fff',
            fontSize: '1.4rem',
            fontWeight: 600,
            margin: '0 0 0.35rem',
            letterSpacing: '0.05em',
          }}>
            ADHD Planner
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', margin: 0 }}>
            {hasCredentials
              ? 'Sign in to connect your Google Calendar'
              : 'A quick one-time setup is needed'}
          </p>
        </div>

        {hasCredentials ? (
          // ── Step 2: Google Sign-In ──
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
            <GoogleSignInButton onClick={handleSignIn} loading={signingIn} />
            <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.7rem', margin: 0 }}>
              You'll be redirected to Google and back automatically.
            </p>
          </div>
        ) : (
          // ── Step 1: env vars / credentials missing ──
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px',
            padding: '1.75rem',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
          }}>
            {/* Icon */}
            <div style={{
              width: 46, height: 46, borderRadius: '50%',
              background: 'rgba(0,255,255,0.08)',
              border: '1px solid var(--neon-cyan)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.1rem',
              fontSize: '1.3rem',
            }}>
              🔑
            </div>

            <p style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
              Google credentials not found
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', lineHeight: 1.8, margin: '0 0 1.25rem' }}>
              Make sure your <code style={{
                color: 'var(--neon-cyan)',
                background: 'rgba(0,255,255,0.08)',
                padding: '1px 6px', borderRadius: '3px',
              }}>GOOGLE_CLIENT_ID</code> and{' '}
              <code style={{
                color: 'var(--neon-cyan)',
                background: 'rgba(0,255,255,0.08)',
                padding: '1px 6px', borderRadius: '3px',
              }}>GOOGLE_CLIENT_SECRET</code>{' '}
              are set in your <code style={{ color: 'rgba(255,255,255,0.5)' }}>.env</code> file,
              then restart the backend and click below.
            </p>

            {checkFailed && (
              <p style={{
                color: '#ff6b6b',
                fontSize: '0.75rem',
                margin: '0 0 0.75rem',
              }}>
                Still not found — double-check your .env and restart the server.
              </p>
            )}

            <button
              onClick={handleRefresh}
              disabled={checking}
              style={{
                background: checking ? 'rgba(0,255,255,0.04)' : 'rgba(0,255,255,0.1)',
                border: '1px solid var(--neon-cyan)',
                borderRadius: '6px',
                color: 'var(--neon-cyan)',
                padding: '8px 22px',
                fontSize: '0.82rem',
                cursor: checking ? 'not-allowed' : 'pointer',
                opacity: checking ? 0.6 : 1,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto',
              }}
            >
              {checking && (
                <div style={{
                  width: 12, height: 12,
                  border: '2px solid rgba(0,255,255,0.3)',
                  borderTopColor: 'var(--neon-cyan)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              )}
              {checking ? 'Checking...' : "I've set the env vars"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// --- Connected Pill (auto-hides after 4s) ---
function ConnectedPill() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes pillFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        border: '1px solid #39ff14',
        borderRadius: '20px',
        padding: '0.4rem 1.1rem',
        backdropFilter: 'blur(8px)',
        fontSize: '0.78rem',
        color: '#39ff14',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        animation: 'pillFadeIn 0.3s ease',
        whiteSpace: 'nowrap',
      }}>
        <span style={{ fontSize: '0.6rem' }}>●</span>
        Google Calendar connected
      </div>
    </>
  );
}

// --- App ---
function App() {
  const [activeTab, setActiveTab] = useState('orb');
  const [voiceActivity, setVoiceActivity] = useState(0);
  const [orbColor, setOrbColor] = useState('orange');
  const [setupStatus, setSetupStatus] = useState(null); // null = loading

  const checkSetup = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/setup-status`);
      const data = await res.json();
      setSetupStatus(data);
    } catch {
      // Backend unreachable
      setSetupStatus({ step: 1, is_authenticated: false, has_credentials: false });
    }
  }, []);

  useEffect(() => {
    // Handle redirect back from Google OAuth
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      window.history.replaceState({}, '', '/');
    }
    checkSetup();
  }, [checkSetup]);

  // Cycle orb color
  useEffect(() => {
    const colors = ['orange', 'cyan', 'pink', 'green'];
    let idx = 0;
    const id = setInterval(() => {
      idx = (idx + 1) % colors.length;
      setOrbColor(colors[idx]);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Decay voice activity
  useEffect(() => {
    if (voiceActivity <= 0) return;
    const t = setTimeout(() => setVoiceActivity(v => Math.max(0, v - 0.1)), 50);
    return () => clearTimeout(t);
  }, [voiceActivity]);

  const isFullySetup = setupStatus?.step === 'done';

  // Don't render until we know auth state (prevents overlay flash)
  if (setupStatus === null) return null;

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <AppShell
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onVoiceActivity={setVoiceActivity}
        orbColor={orbColor}
      >
        {!isFullySetup && (
          <AuthOverlay
            hasCredentials={setupStatus.has_credentials}
            onRefresh={checkSetup}
          />
        )}

        {isFullySetup && <ConnectedPill />}

        {activeTab === 'orb' && (
          <OrbViewer voiceActivity={voiceActivity} color={orbColor} />
        )}
        {activeTab === 'calendar' && (
          <CalendarView />
        )}
      </AppShell>
    </>
  );
}

export default App;