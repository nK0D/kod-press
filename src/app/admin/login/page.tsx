'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const errorParam = searchParams.get('error');

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === 'CredentialsSignin' ? 'Invalid credentials provided.' : null
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        login,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError('Invalid username, email, or password.');
      } else {
        router.push(callbackUrl);
        router.refresh();
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
        <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200">
          DEPOT
        </h1>
        <p className="mt-2 text-sm text-slate-400 font-medium">
          Sign in to your administration panel
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/40 backdrop-blur-xl py-8 px-6 shadow-2xl border border-slate-800/80 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-sm text-red-200 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                Username or Email Address
              </label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="admin"
                required
                disabled={isLoading}
                className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-200 placeholder-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-semibold text-slate-300">
                  Password
                </label>
                <Link
                  href="/admin/login/forgot"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="h-4.5 w-4.5 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs font-semibold text-slate-400 select-none cursor-pointer">
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/10 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 font-medium">
            Please log in with the administrator account configured during setup.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center bg-slate-950 text-slate-400 min-h-screen">
          <p className="text-sm font-semibold">Loading Login Panel...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
