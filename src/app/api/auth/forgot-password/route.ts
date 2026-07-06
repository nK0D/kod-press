import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

async function setUserMeta(userId: number, key: string, value: string) {
  const existing = await db.userMeta.findFirst({
    where: { userId, key },
  });
  if (existing) {
    await db.userMeta.update({
      where: { id: existing.id },
      data: { value },
    });
  } else {
    await db.userMeta.create({
      data: { userId, key, value },
    });
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    // To prevent user enumeration, we always return success
    const successResponse = {
      success: true,
      message: 'If the email exists in our system, a password reset link has been sent.',
    };

    if (!user) {
      return NextResponse.json(successResponse);
    }

    // Generate secure token & expiry (1 hour)
    const token = crypto.randomUUID();
    const expires = Date.now() + 3600000;

    await setUserMeta(user.id, 'password_reset_token', token);
    await setUserMeta(user.id, 'password_reset_expires', String(expires));

    // Get site URL
    const origin = new URL(request.url).origin;
    const resetUrl = `${origin}/admin/login/reset?token=${token}&email=${encodeURIComponent(user.email)}`;

    // Log the link for local testing
    console.log('\n==================================================');
    console.log('🔑 PASSWORD RESET REQUESTED (DEPOT)');
    console.log(`User:  ${user.displayName} (${user.login})`);
    console.log(`Email: ${user.email}`);
    console.log(`Link:  ${resetUrl}`);
    console.log('==================================================\n');

    // Return the reset URL in dev mode for easy developer copying
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        ...successResponse,
        devLink: resetUrl,
      });
    }

    return NextResponse.json(successResponse);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred during password reset.' },
      { status: 500 }
    );
  }
}
