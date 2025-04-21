import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email/sendPasswordResetEmail';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Find user with this email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Even if user is not found, return success to prevent email enumeration attacks
    if (!user) {
      return Response.json({
        success: true,
        message: 'If your email exists in our system, you will receive password reset instructions.'
      });
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Set token expiry to 24 hours from now
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 24);

    // Update user with reset token and expiry
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Send email with reset link
    await sendPasswordResetEmail(user.email, resetToken);

    // For development, also log the token
    console.log(`Reset token for ${email}: ${resetToken}`);

    return Response.json({
      success: true,
      message: 'If your email exists in our system, you will receive password reset instructions.'
    });
  } catch (error) {
    console.error('Error sending password reset:', error);
    return Response.json({ success: false, error: 'Failed to send reset email' }, { status: 500 });
  }
}