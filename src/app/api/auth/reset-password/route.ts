import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, token, password } = await request.json();

    if (!email || !token || !password) {
      return NextResponse.json(
        { success: false, error: 'Email, token, and new password are required.' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { meta: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid user or token.' },
        { status: 400 }
      );
    }

    const tokenMeta = user.meta.find((m) => m.key === 'password_reset_token');
    const expiresMeta = user.meta.find((m) => m.key === 'password_reset_expires');

    if (!tokenMeta || !expiresMeta) {
      return NextResponse.json(
        { success: false, error: 'No active password reset request exists for this account.' },
        { status: 400 }
      );
    }

    if (tokenMeta.value !== token) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token.' },
        { status: 400 }
      );
    }

    const expiresTime = parseInt(expiresMeta.value, 10);
    if (Date.now() > expiresTime) {
      return NextResponse.json(
        { success: false, error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password inside user table
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete token and expiry meta entries
    await db.userMeta.deleteMany({
      where: {
        userId: user.id,
        key: {
          in: ['password_reset_token', 'password_reset_expires'],
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. You can now log in.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred during password reset.' },
      { status: 500 }
    );
  }
}
