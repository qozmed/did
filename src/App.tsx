import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createDIDKeyPair, hashEmail } from './lib/did';
import { saveEmailDIDBinding } from './lib/ceramic';

type Page = 'email' | 'verify' | 'success';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#121212',
    color: '#e0e0e0',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    textAlign: 'center' as const,
  },
  header: {
    marginBottom: '32px',
  },
  icon: {
    width: '52px',
    height: '52px',
    margin: '0 auto 16px',
    display: 'block',
    opacity: 0.9,
  },
  title: {
    fontSize: '26px',
    fontWeight: '700' as const,
    lineHeight: 1.2,
    marginBottom: '8px',
    background: 'linear-gradient(120deg, #e0e0e0, #a0a0a0)',
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
    backgroundClip: 'text' as const,
  },
  subtitle: {
    fontSize: '15px',
    color: '#a0a0a0',
    lineHeight: 1.5,
  },
  liquidGlass: {
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '18px',
    padding: '28px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  liquidOverlay: {
    position: 'absolute' as const,
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: `
      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.12) 0%, transparent 20%),
      radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 25%)
    `,
    pointerEvents: 'none' as const,
    animation: 'rotate 12s linear infinite',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '14px',
    padding: '14px 18px',
    fontSize: '16px',
    color: '#f0f0f0',
    outline: 'none' as const,
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  },
  inputCode: {
    width: '100%',
    textAlign: 'center' as const,
    fontSize: '26px',
    fontWeight: '600' as const,
    fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Fira Mono", monospace',
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '14px',
    padding: '18px',
    color: '#d0d0d0',
    outline: 'none' as const,
    boxSizing: 'border-box' as const,
  },
  button: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600' as const,
    borderRadius: '14px',
    border: 'none' as const,
    cursor: 'pointer' as const,
    marginTop: '18px',
    fontFamily: 'inherit',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    transition: 'all 0.3s ease',
  },
  buttonPrimary: {
    backgroundColor: '#1e1e1e',
    color: '#f0f0f0',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
  },
  buttonPrimaryHover: {
    backgroundColor: '#252525',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.35), 0 0 15px rgba(100, 100, 100, 0.1)',
    transform: 'translateY(-2px)' as const,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    color: 'rgba(255, 255, 255, 0.4)',
    cursor: 'not-allowed' as const,
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  buttonLink: {
    background: 'none' as const,
    color: '#a0a0a0',
    fontSize: '15px',
    marginTop: '14px',
    border: 'none' as const,
    padding: 0,
    textDecoration: 'none' as const,
  },
  buttonLinkHover: {
    color: '#d0d0d0',
    textShadow: '0 0 8px rgba(200, 200, 200, 0.2)',
  },
  footer: {
    fontSize: '13px',
    color: '#888',
    marginTop: '26px',
    lineHeight: 1.5,
  },
  didDisplay: {
    backgroundColor: 'rgba(15, 15, 15, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    fontSize: '14px',
    fontFamily: '"SF Mono", "Monaco", monospace',
    color: '#c0c0c0',
    wordBreak: 'break-all' as const,
    lineHeight: 1.5,
  },
  successText: {
    fontSize: '14px',
    color: '#999',
    lineHeight: 1.6,
    marginTop: '28px',
  },
};

const GlobalStyles = () => (
  <style>{`
    @keyframes rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    body {
      margin: 0;
      overflow-x: hidden;
    }
    input::placeholder {
      color: #777;
      opacity: 1;
    }
    * {
      scrollbar-width: thin;
      scrollbar-color: #333 #121212;
    }
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #121212;
    }
    ::-webkit-scrollbar-thumb {
      background-color: #333;
      border-radius: 3px;
    }
  `}</style>
);

export default function App() {
  const [page, setPage] = useState<Page>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [did, setDid] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'verifying'>('idle');

  const handleSendCode = async () => {
    if (!email || status !== 'idle') return;
    setStatus('sending');

    try {
      const keypair = createDIDKeyPair();
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const emailHash = await hashEmail(email);

      // Сохраняем в Ceramic
      const streamId = await saveEmailDIDBinding(emailHash, keypair.did);
      console.log('✅ Saved to Ceramic:', streamId);

      // Сохраняем локально (временно)
      localStorage.setItem('tempDID', keypair.did);
      localStorage.setItem('tempCode', verificationCode);
      localStorage.setItem('tempEmail', email);

      const res = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      if (res.ok) {
        setPage('verify');
      } else {
        alert('Failed to send email');
      }
    } catch (err) {
      console.error('Ceramic error:', err);
      alert('Registration failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setStatus('idle');
    }
  };

  const handleVerify = () => {
    if (code !== localStorage.getItem('tempCode')) {
      alert('Invalid code');
      return;
    }

    const savedDID = localStorage.getItem('tempDID');
    if (savedDID) {
      setDid(savedDID);
      setPage('success');
      localStorage.removeItem('tempCode');
      localStorage.removeItem('tempEmail');
    }
  };

  return (
    <>
      <GlobalStyles />
      <div style={styles.container}>
        <AnimatePresence mode="wait">
          {page === 'email' && (
            <EmailPage
              key="email"
              email={email}
              setEmail={setEmail}
              onSend={handleSendCode}
              isSending={status === 'sending'}
            />
          )}

          {page === 'verify' && (
            <VerifyPage
              key="verify"
              code={code}
              setCode={setCode}
              onVerify={handleVerify}
              onBack={() => setPage('email')}
            />
          )}

          {page === 'success' && (
            <SuccessPage key="success" did={did!} />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

const EmailPage = ({ email, setEmail, onSend, isSending }: {
  email: string;
  setEmail: (e: string) => void;
  onSend: () => void;
  isSending: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
    style={styles.card}
  >
    <div style={styles.header}>
      <div style={styles.icon}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" strokeWidth="1.8">
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h1 style={styles.title}>Anonymous Sign In</h1>
      <p style={styles.subtitle}>Your identity stays with you. No traces left behind.</p>
    </div>

    <div style={{ position: 'relative', ...styles.liquidGlass }}>
      <div style={styles.liquidOverlay} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={styles.input}
          disabled={isSending}
        />
        <button
          onClick={onSend}
          disabled={!email || isSending}
          style={{
            ...styles.button,
            ...(email && !isSending
              ? { ...styles.buttonPrimary }
              : styles.buttonDisabled
            ),
          }}
          onMouseEnter={(e) => {
            if (email && !isSending) {
              Object.assign(e.currentTarget.style, styles.buttonPrimaryHover);
            }
          }}
          onMouseLeave={(e) => {
            if (email && !isSending) {
              Object.assign(e.currentTarget.style, styles.buttonPrimary);
            }
          }}
        >
          {isSending ? 'Sending...' : 'Get Verification Code'}
        </button>
      </div>
    </div>

    <p style={styles.footer}>
      We never store your email. It's used only for verification.
    </p>
  </motion.div>
);

const VerifyPage = ({ code, setCode, onVerify, onBack }: {
  code: string;
  setCode: (c: string) => void;
  onVerify: () => void;
  onBack: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
    style={styles.card}
  >
    <div style={styles.header}>
      <div style={styles.icon}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" strokeWidth="1.8">
          <path d="M15 17h5l-5 5v-5zM9 7H4l5-5v5m0 8a6 6 0 100-12 6 6 0 000 12z" />
        </svg>
      </div>
      <h1 style={styles.title}>Check Your Email</h1>
      <p style={styles.subtitle}>Enter the 6-digit code from the email</p>
    </div>

    <div style={{ position: 'relative', ...styles.liquidGlass }}>
      <div style={styles.liquidOverlay} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          maxLength={6}
          style={styles.inputCode}
        />
        <button
          onClick={onVerify}
          disabled={code.length !== 6}
          style={{
            ...styles.button,
            ...(code.length === 6
              ? { ...styles.buttonPrimary }
              : styles.buttonDisabled
            ),
          }}
          onMouseEnter={(e) => {
            if (code.length === 6) {
              Object.assign(e.currentTarget.style, styles.buttonPrimaryHover);
            }
          }}
          onMouseLeave={(e) => {
            if (code.length === 6) {
              Object.assign(e.currentTarget.style, styles.buttonPrimary);
            }
          }}
        >
          Verify Code
        </button>
        <button
          onClick={onBack}
          style={{ ...styles.button, ...styles.buttonLink }}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonLinkHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.buttonLink)}
        >
          ← Back to email
        </button>
      </div>
    </div>
  </motion.div>
);

const SuccessPage = ({ did }: { did: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.4 }}
    style={styles.card}
  >
    <div style={styles.icon}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" strokeWidth="1.8">
        <path d="M5 13l4 4L19 7" />
      </svg>
    </div>

    <h1 style={styles.title}>Success!</h1>
    <p style={styles.subtitle}>Your decentralized identifier has been created</p>

    <div style={{ position: 'relative', ...styles.liquidGlass, marginTop: '28px' }}>
      <div style={styles.liquidOverlay} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '10px', fontWeight: '600' }}>DID</p>
        <div style={styles.didDisplay}>{did}</div>
      </div>
    </div>

    <div style={styles.successText}>
      <p>This identifier belongs to you alone.</p>
      <p style={{ marginTop: '10px' }}>No servers store your data.</p>
      <p style={{ marginTop: '10px' }}>You are the owner of your digital identity.</p>
    </div>
  </motion.div>
);