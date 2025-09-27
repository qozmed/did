// api/send-code.ts
export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { email, code } = await request.json();

  if (!email || !code) {
    return new Response(JSON.stringify({ error: 'Email and code are required' }), { status: 400 });
  }

  try {
    // Отправляем напрямую в Resend API через fetch
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Auth <onboarding@resend.dev>',
        to: email,
        subject: 'Ваш код подтверждения — DID Auth',
        text: `Ваш код: ${code}\n\nЭтот код подтверждает владение email. Он не хранится на сервере.`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge Function error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}