import { sendEmail } from './sendEmail'; // your nodemailer util

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `http://localhost:3000/set-password?token=${token}`;
  const html = `<p>Hello, please <a href="${link}">click here</a> to set your password. This link is valid for i month.</p>`;

  await sendEmail({
    to: email,
    subject: 'Set your AltaCoach Admin Password',
    html,
  });
}
