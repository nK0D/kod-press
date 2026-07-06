'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token || !email) {
      setError('Missing token or email parameter in URL.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 text-slate-100 min-h-screen">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200">
          DEPOT
        </h1>
        <p className="mt-2 text-sm text-slate-400 font-medium">
          Choose a new password for your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/40 backdrop-blur-xl py-8 px-6 shadow-2xl border border-slate-800/80 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-sm text-red-200 font-medium">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-sm text-emerald-200 font-medium">
                Password changed successfully! Redirecting you to sign in...
              </div>
              <div className="text-center">
                <Link
                  href="/admin/login"
                  className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Click here if you are not redirected
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-200 placeholder-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-200 placeholder-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm transition-all"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/10 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Resetting...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center bg-slate-950 text-slate-400 min-h-screen">
          <p className="text-sm font-semibold">Loading Reset Details...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
