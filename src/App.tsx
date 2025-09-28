import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createDIDKeyPair } from './lib/did';
import { LiquidGlass } from './components/LiquidGlass';

type Page = 'email' | 'verify' | 'success';

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
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-4 font-sans">
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(0, 240, 255, 0.03) 0%, transparent 40%),
            radial-gradient(circle at 70% 80%, rgba(0, 240, 255, 0.02) 0%, transparent 50%)
          `,
        }}
      />

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
    className="w-full max-w-md"
  >
    <div className="text-center mb-8">
      <div className="w-14 h-14 mx-auto mb-4">
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#00f0ff', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#00a8ff', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            fill="none"
            stroke="url(#grad1)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
        Анонимный вход
      </h1>
      <p className="text-gray-400 mt-2 text-sm">
        Ваша личность остаётся при вас. Никаких следов.
      </p>
    </div>

    <LiquidGlass className="p-6">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@example.com"
        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        disabled={isSending}
      />
      <button
        onClick={onSend}
        disabled={!email || isSending}
        className={`w-full mt-4 py-3 font-medium rounded-xl transition-all duration-300 ${
          email && !isSending
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isSending ? 'Отправка...' : 'Получить код'}
      </button>
    </LiquidGlass>

    <p className="text-center text-gray-500 text-xs mt-6">
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
    className="w-full max-w-md"
  >
    <div className="text-center mb-8">
      <div className="w-14 h-14 mx-auto mb-4">
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <defs>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#00f0ff', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#00a8ff', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path
            d="M15 17h5l-5 5v-5zM9 7H4l5-5v5m0 8a6 6 0 100-12 6 6 0 000 12z"
            fill="none"
            stroke="url(#grad2)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
        Проверьте почту
      </h1>
      <p className="text-gray-400 mt-2 text-sm">
        Введите 6-значный код из письма
      </p>
    </div>

    <LiquidGlass className="p-6">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="000000"
        maxLength={6}
        className="w-full text-center text-2xl font-mono bg-white/5 border border-white/10 text-cyan-300 placeholder-gray-600 py-4 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
      />
      <button
        onClick={onVerify}
        disabled={code.length !== 6}
        className={`w-full mt-6 py-3 font-medium rounded-xl transition-all duration-300 ${
          code.length === 6
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
        }`}
      >
        Подтвердить
      </button>
      <button
        onClick={onBack}
        className="w-full mt-4 text-gray-400 hover:text-cyan-400 text-sm transition-colors"
      >
        ← Вернуться к email
      </button>
    </LiquidGlass>
  </motion.div>
);

const SuccessPage = ({ did }: { did: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.4 }}
    className="w-full max-w-md text-center"
  >
    <div className="w-16 h-16 mx-auto mb-6">
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <defs>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#00f0ff', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#00a8ff', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <path
          d="M5 13l4 4L19 7"
          fill="none"
          stroke="url(#grad3)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>

    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
      Успешно!
    </h1>
    <p className="text-gray-400 mb-6 text-sm">
      Ваш децентрализованный идентификатор создан
    </p>

    <LiquidGlass className="p-5">
      <p className="text-xs text-cyan-400/80 mb-2">DID</p>
      <div className="text-sm font-mono text-cyan-300 break-all bg-black/20 p-3 rounded-lg border border-cyan-500/20">
        {did}
      </div>
    </LiquidGlass>

    <div className="mt-8 text-gray-500 text-xs leading-relaxed">
      <p>Этот идентификатор принадлежит только вам.</p>
      <p className="mt-1">Никакие серверы не хранят ваши данные.</p>
      <p className="mt-1">Вы — хозяин своей цифровой личности.</p>
    </div>
  </motion.div>
);