// api/send-code.ts
import { Resend } from 'resend';

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
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Auth <onboarding@resend.dev>', // используем verified domain от Resend
      to: email,
      subject: 'Ваш код подтверждения — DID Auth',
      text: `Ваш код: ${code}\n\nЭтот код подтверждает владение email. Он не хранится на сервере.`,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Email error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
  }
}