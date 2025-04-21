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
      user: 'altacoach1@gmail.com',
      pass: 'rfuy eygx zdir vjbl',
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
