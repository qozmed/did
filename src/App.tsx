// src/App.tsx
import { useState } from 'react';
import { createDIDKeyPair } from './lib/did';

function App() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'confirmed'>('idle');
  const [did, setDid] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      // 1. Генерируем DID и ключи
      const keypair = createDIDKeyPair();

      // 2. Генерируем 6-значный код
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // 3. Сохраняем временно в localStorage
      localStorage.setItem('tempDID', keypair.did);
      localStorage.setItem('tempPrivateKey', JSON.stringify(Array.from(keypair.privateKey)));
      localStorage.setItem('tempCode', code);
      localStorage.setItem('tempEmail', email);

      // 4. Отправляем код на email через релей
      const response = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (response.ok) {
        setStatus('sent');
      } else {
        const error = await response.text();
        throw new Error(error || 'Не удалось отправить письмо');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'));
      setStatus('idle');
    }
  };

  const handleConfirm = () => {
    const savedCode = localStorage.getItem('tempCode');
    const inputCode = prompt('Введите 6-значный код из письма:');
    
    if (inputCode && inputCode === savedCode) {
      const savedDID = localStorage.getItem('tempDID');
      if (savedDID) {
        setDid(savedDID);
        setStatus('confirmed');

        // Очистка временных данных
        localStorage.removeItem('tempCode');
        localStorage.removeItem('tempEmail');
        // Приватный ключ пока не удаляем — для будущего использования
      }
    } else {
      alert('Неверный код!');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>🔐 DID Auth (MVP)</h1>

      {status === 'confirmed' ? (
        <div style={{ backgroundColor: '#e6ffe6', padding: '20px', borderRadius: '8px' }}>
          <h2>✅ Успешно!</h2>
          <p><strong>Ваш децентрализованный идентификатор (DID):</strong></p>
          <div
            style={{
              backgroundColor: '#fff',
              padding: '10px',
              borderRadius: '4px',
              wordBreak: 'break-all',
              fontSize: '14px',
              border: '1px solid #ccc'
            }}
          >
            {did}
          </div>
          <p style={{ marginTop: '10px' }}>
            Этот DID принадлежит только вам. Он не привязан к серверу и не требует пароля.
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          {status === 'idle' && (
            <form onSubmit={handleRegister}>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                Введите email для подтверждения:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {status === 'sending' ? 'Отправка...' : 'Получить код'}
              </button>
            </form>
          )}

          {status === 'sent' && (
            <div>
              <p>📧 Код отправлен на: <strong>{email}</strong></p>
              <button
                onClick={handleConfirm}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px',
                }}
              >
                Ввести код подтверждения
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;