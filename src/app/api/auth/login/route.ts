import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // adjust if needed
import bcrypt from 'bcryptjs'; // if your passwords are hashed

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 401 });
  }

  // use bcrypt if passwords are hashed
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
    },
  });
}
