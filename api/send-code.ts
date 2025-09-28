export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { email, code } = await request.json();

  if (!email || !code) {
    return new Response(JSON.stringify({ error: 'Email and code required' }), { status: 400 });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Auth <onboarding@resend.dev>',
        to: email,
        subject: 'Ваш код подтверждения',
        text: `Код: ${code}`,
      }),
    });

    if (response.ok) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: 'Email send failed' }), { status: 500 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}