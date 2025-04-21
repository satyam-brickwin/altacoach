import { sendEmail } from './sendEmail'; // your nodemailer util

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `https://altacoach.passbytepm.com/set-password?token=${token}`;
  // const link = `http://localhost:3000/set-password?token=${token}`;
  const html = `<p>Hello, please <a href="${link}">click here</a> to set your password.</p>`;

  await sendEmail({
    to: email,
    subject: 'Set your AltaCoach Admin Password',
    html,
  });
}
