import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow:wght@300;400;600;700;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0a0c0e;
    --dark:     #0d1014;
    --cyan:     #00c8e0;
    --cyan-dim: rgba(0,200,224,0.10);
    --border:   rgba(0,200,224,0.18);
    --text:     #e4eef2;
    --muted:    #4a6070;
    --input-bg: #0d1217;
  }

  body { margin: 0; background: var(--bg); }

  .nx-body {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
    font-family: 'Barlow', sans-serif;
    color: var(--text);
    overflow: hidden;
    position: relative;
  }

  .nx-body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,200,224,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,200,224,0.025) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    z-index: 0;
  }

  .nx-wrapper {
    position: relative;
    width: 920px;
    max-width: 98vw;
    height: 580px;
    background: var(--dark);
    border: 1px solid var(--border);
    overflow: hidden;
    box-shadow: 0 0 0 1px rgba(0,200,224,0.08), 0 40px 80px rgba(0,0,0,0.7), 0 0 60px rgba(0,200,224,0.05);
    animation: wrapIn 0.6s cubic-bezier(0.4,0,0.2,1) both;
    z-index: 1;
  }

  @keyframes wrapIn {
    from { opacity: 0; transform: scale(0.96) translateY(20px); }
    to   { opacity: 1; transform: none; }
  }

  .nx-wrapper::before, .nx-wrapper::after {
    content: '';
    position: absolute;
    width: 18px; height: 18px;
    border-color: var(--cyan);
    border-style: solid;
    opacity: 0.5;
    z-index: 20;
    pointer-events: none;
  }
  .nx-wrapper::before { top: 0; left: 0; border-width: 2px 0 0 2px; }
  .nx-wrapper::after  { bottom: 0; right: 0; border-width: 0 2px 2px 0; }

  .nx-scanline {
    position: absolute;
    left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(0,200,224,0.12), transparent);
    animation: scan 8s linear infinite;
    pointer-events: none;
    z-index: 30;
  }
  @keyframes scan {
    from { top: -2px; }
    to   { top: 100%; }
  }

  /* ── FORMS ── */
  .nx-forms {
    position: absolute;
    left: 0; top: 0;
    width: 55%;
    height: 100%;
    z-index: 2;
    transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* This moves the form area to the right when signup is active */
  .nx-forms.shifted {
    transform: translateX(81.8%); /* Moves the form out from under the panel */
  }
  .nx-form-panel {
    position: absolute;
    inset: 0;
    padding: 44px 52px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.4,0,0.2,1);
  }

  .nx-form-panel.hidden {
    opacity: 0;
    pointer-events: none;
    transform: translateY(18px);
  }

  .nx-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--border);
    padding: 4px 12px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    color: var(--cyan);
    background: var(--cyan-dim);
    margin-bottom: 18px;
    width: fit-content;
  }

  .nx-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--cyan);
    box-shadow: 0 0 6px var(--cyan);
    animation: blink 2s ease-in-out infinite;
  }
  @keyframes blink {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.25; }
  }

  .nx-title {
    font-size: 34px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #fff;
    line-height: 1.1;
    margin-bottom: 6px;
    position: relative;
  }

  .nx-title::after {
    content: attr(data-text);
    position: absolute;
    left: 2px; top: 0;
    color: var(--cyan);
    opacity: 0;
    clip-path: polygon(0 25%, 100% 25%, 100% 50%, 0 50%);
    animation: glitch 7s infinite;
  }
  @keyframes glitch {
    0%,93%,100% { opacity: 0; transform: none; }
    94% { opacity: 0.5; transform: translateX(-4px); }
    96% { opacity: 0.5; transform: translateX(4px); }
    98% { opacity: 0; }
  }

  .nx-sub {
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 22px;
    font-weight: 300;
  }

  .nx-field { margin-bottom: 14px; }

  .nx-field-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 5px;
  }

  .nx-input-wrap {
    position: relative;
  }

  .nx-input-wrap::before, .nx-input-wrap::after {
    content: '';
    position: absolute;
    width: 8px; height: 8px;
    border-color: var(--cyan);
    border-style: solid;
    opacity: 0.5;
    pointer-events: none;
    z-index: 2;
    transition: opacity 0.3s;
  }
  .nx-input-wrap::before { top: 0; left: 0; border-width: 1.5px 0 0 1.5px; }
  .nx-input-wrap::after  { bottom: 0; right: 0; border-width: 0 1.5px 1.5px 0; }
  .nx-input-wrap:focus-within::before,
  .nx-input-wrap:focus-within::after { opacity: 1; }

  .nx-input {
    width: 100%;
    background: var(--input-bg);
    border: 1px solid rgba(0,200,224,0.14);
    padding: 11px 40px 11px 14px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 13px;
    color: var(--text);
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
    letter-spacing: 0.04em;
  }
  .nx-input::placeholder { color: var(--muted); opacity: 0.5; }
  .nx-input:focus {
    border-color: rgba(0,200,224,0.45);
    box-shadow: 0 0 0 1px rgba(0,200,224,0.08), inset 0 0 16px rgba(0,200,224,0.03);
  }

  .nx-input-icon {
    position: absolute;
    right: 13px; top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    display: flex;
    pointer-events: none;
  }

  .nx-row-opts {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .nx-remember {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--muted);
    cursor: pointer;
    user-select: none;
  }

  .nx-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 14px; height: 14px;
    border: 1px solid var(--border);
    background: var(--input-bg);
    cursor: pointer;
    position: relative;
    transition: border-color 0.2s;
    flex-shrink: 0;
  }
  .nx-checkbox:checked {
    border-color: var(--cyan);
    background: var(--cyan-dim);
  }
  .nx-checkbox:checked::after {
    content: '✓';
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    color: var(--cyan);
  }

  .nx-forgot {
    font-size: 12px;
    color: var(--cyan);
    cursor: pointer;
    font-family: 'Share Tech Mono', monospace;
    letter-spacing: 0.05em;
    background: none;
    border: none;
    transition: opacity 0.2s;
  }
  .nx-forgot:hover { opacity: 0.6; }

  .nx-btn-auth {
    width: 100%;
    padding: 13px;
    background: var(--cyan);
    border: none;
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--bg);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: box-shadow 0.3s, transform 0.15s;
    clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
  }
  .nx-btn-auth::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .nx-btn-auth:hover {
    box-shadow: 0 0 28px rgba(0,200,224,0.55), 0 0 55px rgba(0,200,224,0.18);
  }
  .nx-btn-auth:hover::before { opacity: 1; }
  .nx-btn-auth:active { transform: scale(0.99); }

  .nx-or {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 14px 0;
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    color: var(--muted);
  }
  .nx-or::before, .nx-or::after {
    content: '';
    flex: 1; height: 1px;
    background: var(--border);
  }

  .nx-social-row { display: flex; gap: 10px; }

  .nx-btn-social {
    flex: 1;
    padding: 10px 14px;
    background: var(--input-bg);
    border: 1px solid var(--border);
    font-family: 'Barlow', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: var(--text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: border-color 0.3s, color 0.3s, background 0.3s;
    letter-spacing: 0.05em;
  }
  .nx-btn-social:hover {
    border-color: rgba(0,200,224,0.4);
    color: var(--cyan);
    background: var(--cyan-dim);
  }

  .nx-stats {
    display: flex;
    gap: 24px;
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid rgba(0,200,224,0.1);
  }

  .nx-stat-val {
    font-size: 13px;
    font-weight: 700;
    color: var(--cyan);
    font-family: 'Share Tech Mono', monospace;
  }
  .nx-stat-lbl {
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    color: var(--muted);
    text-transform: uppercase;
  }

  /* ── SLIDE PANEL ── */
  .nx-slide-panel {
    position: absolute;
    right: 0; top: 0;
    width: 45%;
    height: 100%;
    background: linear-gradient(160deg, #0a1520 0%, #060d12 100%);
    border-left: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 52px 44px;
    text-align: center;
    z-index: 10;
    transition: transform 0.65s cubic-bezier(0.4,0,0.2,1);
    overflow: hidden;
  }

  .nx-slide-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,200,224,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,200,224,0.04) 1px, transparent 1px);
    background-size: 32px 32px;
    pointer-events: none;
  }
  .nx-slide-panel::after {
    content: '';
    position: absolute;
    left: 0; top: 10%; bottom: 10%;
    width: 1px;
    background: linear-gradient(to bottom, transparent, var(--cyan), transparent);
    opacity: 0.3;
  }

  .nx-slide-panel.shifted {
    transform: translateX(-122.2%);
  }

  .nx-ring-wrap {
    position: relative;
    width: 80px; height: 80px;
    margin-bottom: 28px;
    flex-shrink: 0;
    z-index: 1;
  }

  .nx-ring-outer {
    position: absolute; inset: 0;
    animation: spinCW 16s linear infinite;
    transform-origin: center;
  }
  .nx-ring-inner {
    position: absolute; inset: 0;
    animation: spinCCW 10s linear infinite;
    transform-origin: center;
  }
  .nx-ring-static { position: absolute; inset: 0; }

  @keyframes spinCW  { from { transform: rotate(0deg);    } to { transform: rotate(360deg);  } }
  @keyframes spinCCW { from { transform: rotate(0deg);    } to { transform: rotate(-360deg); } }

  .nx-panel-title {
    font-size: 26px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #fff;
    line-height: 1.2;
    margin-bottom: 12px;
    position: relative;
    z-index: 1;
  }

  .nx-panel-text {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.7;
    margin-bottom: 30px;
    position: relative;
    z-index: 1;
    font-weight: 300;
  }

  .nx-btn-outline {
    padding: 12px 36px;
    border: 1px solid var(--cyan);
    background: transparent;
    font-family: 'Barlow', sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--cyan);
    cursor: pointer;
    position: relative;
    z-index: 1;
    transition: background 0.3s, color 0.3s, box-shadow 0.3s, transform 0.15s;
    clip-path: polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%);
  }
  .nx-btn-outline:hover {
    background: var(--cyan);
    color: var(--bg);
    box-shadow: 0 0 20px rgba(0,200,224,0.4);
  }
  .nx-btn-outline:active { transform: scale(0.99); }

  .nx-panel-dots {
    display: flex;
    gap: 8px;
    margin-top: 26px;
    position: relative;
    z-index: 1;
  }

  .nx-panel-dot {
    height: 3px;
    background: rgba(0,200,224,0.2);
    transition: background 0.3s, width 0.3s;
    width: 20px;
  }
  .nx-panel-dot.active {
    background: var(--cyan);
    box-shadow: 0 0 8px var(--cyan);
    width: 32px;
  }

  .nx-footer {
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.14em;
    color: rgba(74,96,112,0.35);
    white-space: nowrap;
    z-index: 5;
  }
`;

// ── Icons ──
const IconMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconGithub = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const IconGoogle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// ── Sub-components ──

function StatusBadge({ label }) {
  return (
    <div className="nx-badge">
      <span className="nx-dot" />
      {label}
    </div>
  );
}

function InputField({ label, type = "text", placeholder, icon }) {
  return (
    <div className="nx-field">
      <div className="nx-field-label">{label}</div>
      <div className="nx-input-wrap">
        <input className="nx-input" type={type} placeholder={placeholder} />
        <span className="nx-input-icon">{icon}</span>
      </div>
    </div>
  );
}

function LoginForm({ onSwitch }) {
  return (
    <div className="nx-form-panel">
      <StatusBadge label="SYSTEM ONLINE" />
      <h2 className="nx-title" data-text="ACCESS LOGIN">ACCESS LOGIN</h2>
      <p className="nx-sub">Enter your credentials to continue</p>

      <InputField label="Email Address" type="email" placeholder="user@nexus.sys" icon={<IconMail />} />
      <InputField label="Password" type="password" placeholder="••••••••" icon={<IconLock />} />

      <div className="nx-row-opts">
        <label className="nx-remember">
          <input type="checkbox" className="nx-checkbox" />
          Remember me
        </label>
        <button className="nx-forgot">Forgot password?</button>
      </div>

      <button className="nx-btn-auth">Authenticate</button>

      <div className="nx-or">OR CONTINUE WITH</div>

      <div className="nx-social-row">
        <button className="nx-btn-social"><IconGithub /> GitHub</button>
        <button className="nx-btn-social"><IconGoogle /> Google</button>
      </div>

      <div className="nx-stats">
        {[["256-BIT", "Encryption"], ["99.99%", "Uptime"], ["24/7", "Support"]].map(([val, lbl]) => (
          <div key={lbl}>
            <div className="nx-stat-val">{val}</div>
            <div className="nx-stat-lbl">{lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SignupForm({ onSwitch }) {
  return (
    <div className="nx-form-panel hidden">
      <StatusBadge label="NEW REGISTRATION" />
      <h2 className="nx-title" data-text="CREATE ACCOUNT">CREATE ACCOUNT</h2>
      <p className="nx-sub">Initialize your access credentials</p>

      <InputField label="Full Name"        type="text"     placeholder="Agent Name"       icon={<IconUser />}   />
      <InputField label="Email Address"    type="email"    placeholder="user@nexus.sys"    icon={<IconMail />}   />
      <InputField label="Password"         type="password" placeholder="Min. 8 characters" icon={<IconLock />}   />
      <InputField label="Confirm Password" type="password" placeholder="Repeat password"   icon={<IconShield />} />

      <button className="nx-btn-auth" style={{ marginTop: 10 }}>Initialize Account</button>
    </div>
  );
}

function RingAnimation() {
  return (
    <div className="nx-ring-wrap">
      <svg viewBox="0 0 80 80" className="nx-ring-outer">
        <circle cx="40" cy="40" r="36" fill="none" stroke="#00c8e0" strokeWidth="0.8" strokeDasharray="6 4" opacity="0.5"/>
      </svg>
      <svg viewBox="0 0 80 80" className="nx-ring-inner">
        <circle cx="40" cy="40" r="24" fill="none" stroke="#00c8e0" strokeWidth="0.8" strokeDasharray="3 6" opacity="0.3"/>
      </svg>
      <svg viewBox="0 0 80 80" className="nx-ring-static">
        <circle cx="40" cy="40" r="4" fill="#00c8e0"/>
        <line x1="40" y1="4"  x2="40" y2="20" stroke="#00c8e0" strokeWidth="1" opacity="0.8"/>
        <line x1="40" y1="60" x2="40" y2="76" stroke="#00c8e0" strokeWidth="1" opacity="0.4"/>
        <line x1="4"  y1="40" x2="20" y2="40" stroke="#00c8e0" strokeWidth="1" opacity="0.4"/>
        <line x1="60" y1="40" x2="76" y2="40" stroke="#00c8e0" strokeWidth="1" opacity="0.8"/>
      </svg>
    </div>
  );
}

// ── Main Component ──
export default function GGAuth() {
  const [isSignup, setIsSignup] = useState(false);

  const panelContent = isSignup
    ? {
        title: "WELCOME\nBACK",
        text: "Already have credentials? Authenticate to re-enter the system.",
        btnLabel: "Sign In",
      }
    : {
        title: "HELLO,\nAGENT",
        text: "New to the system? Register your access credentials and join the network.",
        btnLabel: "Register Access",
      };

  return (
    <>
      <style>{styles}</style>
      <div className="nx-body">
        <div className="nx-wrapper">
          <div className="nx-scanline" />

          {/* Forms */}
          <div className={`nx-forms ${isSignup ? "shifted" : ""}`}>
            {/* Login */}
            <div className={`nx-form-panel${isSignup ? " hidden" : ""}`}>
              <StatusBadge label="SYSTEM ONLINE" />
              <h2 className="nx-title" data-text="ACCESS LOGIN">ACCESS LOGIN</h2>
              <p className="nx-sub">Enter your credentials to continue</p>
              <InputField label="Email Address" type="email"    placeholder="user@nexus.sys" icon={<IconMail />} />
              <InputField label="Password"      type="password" placeholder="••••••••"       icon={<IconLock />} />
              <div className="nx-row-opts">
                <label className="nx-remember">
                  <input type="checkbox" className="nx-checkbox" />
                  Remember me
                </label>
                <button className="nx-forgot">Forgot password?</button>
              </div>
              <button className="nx-btn-auth">Authenticate</button>
              <div className="nx-or">OR CONTINUE WITH</div>
              <div className="nx-social-row">
                <button className="nx-btn-social"><IconGithub /> GitHub</button>
                <button className="nx-btn-social"><IconGoogle /> Google</button>
              </div>
              <div className="nx-stats">
                {[["256-BIT","Encryption"],["99.99%","Uptime"],["24/7","Support"]].map(([v,l])=>(
                  <div key={l}><div className="nx-stat-val">{v}</div><div className="nx-stat-lbl">{l}</div></div>
                ))}
              </div>
            </div>

            {/* Signup */}
            <div className={`nx-form-panel${isSignup ? "" : " hidden"}`}>
              <StatusBadge label="NEW REGISTRATION" />
              <h2 className="nx-title" data-text="CREATE ACCOUNT">CREATE ACCOUNT</h2>
              <p className="nx-sub">Initialize your access credentials</p>
              <InputField label="Full Name"        type="text"     placeholder="Agent Name"        icon={<IconUser />}   />
              <InputField label="Email Address"    type="email"    placeholder="user@nexus.sys"     icon={<IconMail />}   />
              <InputField label="Password"         type="password" placeholder="Min. 8 characters"  icon={<IconLock />}   />
              <InputField label="Confirm Password" type="password" placeholder="Repeat password"    icon={<IconShield />} />
              <button className="nx-btn-auth" style={{ marginTop: 10 }}>Initialize Account</button>
            </div>
          </div>

          {/* Sliding Panel */}
          <div className={`nx-slide-panel${isSignup ? " shifted" : ""}`}>
            <RingAnimation />
            <h3 className="nx-panel-title" style={{ whiteSpace: "pre-line" }}>
              {panelContent.title}
            </h3>
            <p className="nx-panel-text">{panelContent.text}</p>
            <button className="nx-btn-outline" onClick={() => setIsSignup(!isSignup)}>
              {panelContent.btnLabel}
            </button>
            <div className="nx-panel-dots">
              <div className={`nx-panel-dot${!isSignup ? " active" : ""}`} />
              <div className={`nx-panel-dot${isSignup  ? " active" : ""}`} />
            </div>
          </div>

          <div className="nx-footer">PROTECTED BY NEXUS SECURITY PROTOCOL v4.2</div>
        </div>
      </div>
    </>
  );
}

