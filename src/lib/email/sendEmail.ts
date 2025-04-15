// src/lib/email/sendEmail.ts
import nodemailer from 'nodemailer';

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'vinod.sharma@brickwin.net',
      pass: 'lavs onuj xpkr whmn',
    },
  });

  const info = await transporter.sendMail({
    from: '"AltaCoach" <yourgmail@gmail.com>',
    to,
    subject,
    html,
  });

  console.log('📬 Gmail message sent: %s', info.messageId);
}
