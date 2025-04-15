import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    
    if (!token || !password) {
      return Response.json({ success: false, error: 'Token and password are required' }, { status: 400 });
    }
    
    // Find user with this reset token and valid expiry
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });
    
    if (!user) {
      return Response.json({ success: false, error: 'Invalid or expired token' }, { status: 400 });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user with new password, mark as verified, and clear the token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        isVerified: true // Set to true when password is reset
      }
    });
    
    return Response.json({ 
      success: true,
      message: 'Password reset successful. Your account is now verified.'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return Response.json({ success: false, error: 'Failed to reset password' }, { status: 500 });
  }
}
