import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createDIDKeyPair } from './lib/did';

type Page = 'email' | 'verify' | 'success';

// Правильная типизация через as const
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#e0e0e0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  gradientBg: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `
      radial-gradient(circle at 30% 20%, rgba(0, 240, 255, 0.03) 0%, transparent 40%),
      radial-gradient(circle at 70% 80%, rgba(0, 240, 255, 0.02) 0%, transparent 50%)
    `,
    pointerEvents: 'none' as const,
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    textAlign: 'center' as const,
  },
  header: {
    marginBottom: '32px',
  },
  icon: {
    width: '56px',
    height: '56px',
    margin: '0 auto 16px',
    display: 'block',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700' as const,
    background: 'linear-gradient(90deg, #00f0ff, #00a8ff)',
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
    backgroundClip: 'text' as const,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#a0a0a0',
  },
  liquidGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 0 30px rgba(0, 240, 255, 0.1)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  liquidOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.3,
    background: `
      radial-gradient(circle at 20% 30%, rgba(0, 240, 255, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(0, 240, 255, 0.1) 0%, transparent 50%)
    `,
    pointerEvents: 'none' as const,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '16px',
    color: '#fff',
    outline: 'none' as const,
  },
  inputCode: {
    width: '100%',
    textAlign: 'center' as const,
    fontSize: '24px',
    fontFamily: 'monospace' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    color: '#00f0ff',
    outline: 'none' as const,
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600' as const,
    borderRadius: '12px',
    border: 'none' as const,
    cursor: 'pointer' as const,
    marginTop: '16px',
    transition: 'all 0.2s ease',
  },
  buttonPrimary: {
    background: 'linear-gradient(90deg, #00f0ff, #00a8ff)',
    color: '#000',
    boxShadow: '0 4px 20px rgba(0, 240, 255, 0.2)',
  },
  buttonPrimaryHover: {
    boxShadow: '0 6px 25px rgba(0, 240, 255, 0.3)',
    transform: 'translateY(-2px)' as const,
  },
  buttonDisabled: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.4)',
    cursor: 'not-allowed' as const,
  },
  buttonLink: {
    background: 'none' as const,
    color: '#a0a0a0',
    fontSize: '14px',
    marginTop: '12px',
    border: 'none' as const,
    padding: 0,
  },
  buttonLinkHover: {
    color: '#00f0ff',
  },
  footer: {
    fontSize: '12px',
    color: '#777',
    marginTop: '24px',
  },
  didDisplay: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(0, 240, 255, 0.2)',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    fontFamily: 'monospace' as const,
    color: '#00f0ff',
    wordBreak: 'break-all' as const,
  },
  successText: {
    fontSize: '12px',
    color: '#777',
    lineHeight: 1.6,
    marginTop: '24px',
  },
};

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
        alert('Не удалось отправить письмо');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка сети');
    } finally {
      setStatus('idle');
    }
  };

  const handleVerify = () => {
    if (code !== localStorage.getItem('tempCode')) {
      alert('Неверный код');
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
    <div style={styles.container}>
      <div style={styles.gradientBg} />
      
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
        <svg viewBox="0 0 24 24" fill="none" stroke="url(#grad1)" strokeWidth="2">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#00a8ff" />
            </linearGradient>
          </defs>
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h1 style={styles.title}>Анонимный вход</h1>
      <p style={styles.subtitle}>Ваша личность остаётся при вас. Никаких следов.</p>
    </div>

    <div style={{ position: 'relative', ...styles.liquidGlass }}>
      <div style={styles.liquidOverlay} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
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
          {isSending ? 'Отправка...' : 'Получить код'}
        </button>
      </div>
    </div>

    <p style={styles.footer}>
      Мы не храним ваш email. Он используется только для подтверждения.
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
        <svg viewBox="0 0 24 24" fill="none" stroke="url(#grad2)" strokeWidth="2">
          <defs>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#00a8ff" />
            </linearGradient>
          </defs>
          <path d="M15 17h5l-5 5v-5zM9 7H4l5-5v5m0 8a6 6 0 100-12 6 6 0 000 12z" />
        </svg>
      </div>
      <h1 style={styles.title}>Проверьте почту</h1>
      <p style={styles.subtitle}>Введите 6-значный код из письма</p>
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
          Подтвердить
        </button>
        <button
          onClick={onBack}
          style={{ ...styles.button, ...styles.buttonLink }}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonLinkHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.buttonLink)}
        >
          ← Вернуться к email
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
      <svg viewBox="0 0 24 24" fill="none" stroke="url(#grad3)" strokeWidth="2">
        <defs>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#00a8ff" />
          </linearGradient>
        </defs>
        <path d="M5 13l4 4L19 7" />
      </svg>
    </div>

    <h1 style={styles.title}>Успешно!</h1>
    <p style={styles.subtitle}>Ваш децентрализованный идентификатор создан</p>

    <div style={{ position: 'relative', ...styles.liquidGlass, marginTop: '24px' }}>
      <div style={styles.liquidOverlay} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '12px', color: 'rgba(0, 240, 255, 0.8)', marginBottom: '8px' }}>DID</p>
        <div style={styles.didDisplay}>{did}</div>
      </div>
    </div>

    <div style={styles.successText}>
      <p>Этот идентификатор принадлежит только вам.</p>
      <p style={{ marginTop: '8px' }}>Никакие серверы не хранят ваши данные.</p>
      <p style={{ marginTop: '8px' }}>Вы — хозяин своей цифровой личности.</p>
    </div>
  </motion.div>
);