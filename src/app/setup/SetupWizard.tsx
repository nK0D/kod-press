'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [dbProvider, setDbProvider] = useState('sqlite');
  const [dbUrl, setDbUrl] = useState('file:./dev.db');
  
  const [siteName, setSiteName] = useState('My Depot Site');
  const [siteTagline, setSiteTagline] = useState('Just another Depot site');
  const [siteEmail, setSiteEmail] = useState('admin@example.com');
  
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Database Connection Test
  const handleTestConnection = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/setup/test-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: dbProvider, databaseUrl: dbUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to database.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Run Installation
  const handleInstall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (adminPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/setup/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: dbProvider,
          databaseUrl: dbUrl,
          siteName,
          siteTagline,
          siteEmail,
          adminUsername,
          adminPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(5); // Complete screen
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Installation failed.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setError(null);
    setSuccessMsg(null);
    setStep(prev => prev + 1);
  };
  const prevStep = () => {
    setError(null);
    setSuccessMsg(null);
    setStep(prev => prev - 1);
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-slate-100 min-h-screen">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200">
          DEPOT
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Modern CMS Setup Wizard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-900/50 backdrop-blur-xl py-8 px-6 shadow-2xl border border-slate-800/80 rounded-2xl sm:px-10">
          
          {/* Progress Indicators */}
          {step < 5 && (
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                <span>PROGRESS</span>
                <span>STEP {step} OF 4</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-300 ease-out" 
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-4 gap-1 text-[10px] text-center text-slate-500 mt-2 font-medium">
                <span className={step >= 1 ? 'text-indigo-400' : ''}>WELCOME</span>
                <span className={step >= 2 ? 'text-indigo-400' : ''}>DATABASE</span>
                <span className={step >= 3 ? 'text-indigo-400' : ''}>SITE INFO</span>
                <span className={step >= 4 ? 'text-indigo-400' : ''}>ADMIN</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-sm text-red-200 flex items-start gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-sm text-emerald-200">
              {successMsg}
            </div>
          )}

          {/* STEP 1: Welcome */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-900/40 border border-indigo-700/30 text-indigo-400 mb-2">
                  🚀
                </div>
                <h2 className="text-2xl font-bold text-slate-100">Welcome to Depot!</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Depot is a modern, lightweight, WordPress-inspired Content Management System built on Next.js, React, and TypeScript.
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We'll help you connect your database, customize your site's core properties, and create your administrator profile in just a few clicks.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={nextStep}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Let's Go!
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Database Config */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Database Connection Settings</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Configure your database provider and path. SQLite is recommended for initial setup.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Database Provider
                  </label>
                  <select
                    value={dbProvider}
                    onChange={(e) => {
                      setDbProvider(e.target.value);
                      if (e.target.value === 'sqlite') {
                        setDbUrl('file:./dev.db');
                      } else {
                        setDbUrl('');
                      }
                    }}
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="sqlite">SQLite (File-based)</option>
                    <option value="mysql">MySQL (Phase 2)</option>
                    <option value="postgresql">PostgreSQL (Phase 2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Connection String / File Path
                  </label>
                  <input
                    type="text"
                    value={dbUrl}
                    onChange={(e) => setDbUrl(e.target.value)}
                    placeholder={dbProvider === 'sqlite' ? 'file:./dev.db' : 'mysql://user:pass@host:port/dbname'}
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={prevStep}
                  className="flex-1 py-3 px-4 border border-slate-800 rounded-xl shadow-sm text-sm font-semibold text-slate-400 bg-slate-950 hover:bg-slate-900 focus:outline-none"
                >
                  Back
                </button>
                <button
                  onClick={handleTestConnection}
                  disabled={loading}
                  className="flex-1 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-900/50 border-indigo-700/30 hover:bg-indigo-900/70 focus:outline-none"
                >
                  {loading ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  onClick={nextStep}
                  className="flex-1 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Site Info */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Site Information</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Enter basic metadata for your Depot website.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Site Title
                  </label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={siteTagline}
                    onChange={(e) => setSiteTagline(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Site Support Email Address
                  </label>
                  <input
                    type="email"
                    value={siteEmail}
                    onChange={(e) => setSiteEmail(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={prevStep}
                  className="flex-1 py-3 px-4 border border-slate-800 rounded-xl shadow-sm text-sm font-semibold text-slate-400 bg-slate-950 hover:bg-slate-900 focus:outline-none"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  className="flex-1 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Admin Account */}
          {step === 4 && (
            <form onSubmit={handleInstall} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Create Administrator Profile</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Choose your superuser credentials. Keep these safe.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Administrator Username
                  </label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Administrator Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3 px-4 border border-slate-800 rounded-xl shadow-sm text-sm font-semibold text-slate-400 bg-slate-950 hover:bg-slate-900 focus:outline-none"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? 'Installing...' : 'Run Install'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: Complete */}
          {step === 5 && (
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-900/40 border border-emerald-700/30 text-emerald-400 mb-2">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-slate-100">Installation Successful!</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Depot has been successfully configured and installed! Your database schema is set up, site settings have been stored, and your administrator user is active.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => router.push('/admin/login')}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Log In to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
