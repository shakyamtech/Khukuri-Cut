import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';

const ADMIN_PASSWORD = 'admin123';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate auth delay
    await new Promise((r) => setTimeout(r, 800));

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('kc_admin_auth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Galat password! Pheri try gara.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Animated background grid */}
      <div style={styles.gridOverlay} />

      {/* Glowing orbs */}
      <div style={{ ...styles.orb, top: '15%', left: '10%', width: 400, height: 400, animationDelay: '0s' }} />
      <div style={{ ...styles.orb, bottom: '10%', right: '8%', width: 300, height: 300, animationDelay: '2s' }} />

      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoCircle}>
            <Scissors size={32} color="#191514" />
          </div>
          <div>
            <div style={styles.logoTitle}>KHUKURI CUT</div>
            <div style={styles.logoSub}>Admin Portal</div>
          </div>
        </div>

        {/* Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Shield size={20} color="#d5a353" />
            <span style={styles.cardHeaderText}>SECURE ACCESS</span>
          </div>

          <h1 style={styles.heading}>Welcome Back</h1>
          <p style={styles.subheading}>Enter your admin password to continue</p>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Admin Password</label>
              <div style={styles.inputWrap}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter password..."
                  style={{
                    ...styles.input,
                    borderColor: error ? '#ff4444' : password ? '#d5a353' : 'rgba(213,163,83,0.25)',
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? <EyeOff size={18} color="#d5a353" /> : <Eye size={18} color="#d5a353" />}
                </button>
              </div>
              {error && (
                <div style={styles.errorMsg}>
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              style={{
                ...styles.loginBtn,
                opacity: loading || !password ? 0.6 : 1,
                cursor: loading || !password ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span style={styles.spinner} />
              ) : null}
              {loading ? 'Authenticating...' : 'LOGIN TO DASHBOARD'}
            </button>
          </form>

          <div style={styles.hint}>
            <span style={{ color: '#666', fontSize: '0.78rem' }}>Hint: </span>
            <span style={{ color: '#d5a353', fontSize: '0.78rem' }}>admin123</span>
          </div>
        </div>

        <p style={styles.footer}>
          © 2025 Khukuri Cut Barbershop · Durbar Marg, Kathmandu
        </p>
      </div>

      <style>{`
        @keyframes pulse-orb {
          0%, 100% { transform: scale(1); opacity: 0.12; }
          50% { transform: scale(1.15); opacity: 0.2; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0d0b0a 0%, #191514 50%, #1f1a17 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Outfit', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(213,163,83,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(213,163,83,0.04) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(213,163,83,0.18) 0%, transparent 70%)',
    animation: 'pulse-orb 6s ease-in-out infinite',
    pointerEvents: 'none',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '28px',
    width: '100%',
    maxWidth: '420px',
    padding: '20px',
    position: 'relative',
    zIndex: 2,
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #d5a353, #c4893f)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 30px rgba(213,163,83,0.4)',
  },
  logoTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#d5a353',
    letterSpacing: '0.15em',
    lineHeight: 1.1,
  },
  logoSub: {
    fontSize: '0.72rem',
    color: '#8a7a6a',
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
  },
  card: {
    width: '100%',
    background: 'linear-gradient(145deg, rgba(30,25,20,0.95), rgba(25,21,20,0.98))',
    border: '1px solid rgba(213,163,83,0.2)',
    borderRadius: '20px',
    padding: '40px 36px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 25px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(213,163,83,0.15)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
    padding: '8px 14px',
    background: 'rgba(213,163,83,0.08)',
    borderRadius: '8px',
    border: '1px solid rgba(213,163,83,0.15)',
    width: 'fit-content',
  },
  cardHeaderText: {
    color: '#d5a353',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.2em',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#f9f6f2',
    margin: '0 0 8px 0',
  },
  subheading: {
    fontSize: '0.9rem',
    color: '#7a6a5a',
    margin: '0 0 32px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#a89070',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  inputWrap: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '14px 50px 14px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid rgba(213,163,83,0.25)',
    borderRadius: '10px',
    color: '#f9f6f2',
    fontSize: '1rem',
    fontFamily: "'Outfit', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
  },
  errorMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#ff6b6b',
    fontSize: '0.82rem',
    marginTop: '4px',
  },
  loginBtn: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #d5a353, #c4893f)',
    color: '#191514',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.88rem',
    fontWeight: 800,
    letterSpacing: '0.15em',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s',
    boxShadow: '0 8px 25px rgba(213,163,83,0.3)',
    fontFamily: "'Outfit', sans-serif",
  },
  spinner: {
    width: 16,
    height: 16,
    border: '2px solid rgba(25,21,20,0.3)',
    borderTop: '2px solid #191514',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
  hint: {
    textAlign: 'center' as const,
    marginTop: '20px',
  },
  footer: {
    color: '#4a3a2a',
    fontSize: '0.72rem',
    textAlign: 'center' as const,
    letterSpacing: '0.05em',
  },
};
