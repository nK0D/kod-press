import { redirect } from 'next/navigation';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export const revalidate = 0; // Disable static cache for setup checking

export default async function Home() {
  let isInstalled = false;
  let siteName = 'KodPress';
  let siteTagline = 'Just another KodPress site';

  try {
    const configPath = path.resolve(process.cwd(), 'kodpress-config.json');
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (configData.installed === true) {
        isInstalled = true;
        siteName = configData.site?.title || siteName;
        siteTagline = configData.site?.tagline || siteTagline;
      }
    }
  } catch (e) {
    // Fail silently
  }

  if (!isInstalled) {
    redirect('/setup');
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans p-6 min-h-screen">
      <main className="w-full max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200">
            {siteName}
          </h1>
          <p className="text-xl text-slate-400 font-medium">
            {siteTagline}
          </p>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent my-8" />

        <div className="space-y-6">
          <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
            Welcome to your new KodPress website! You can log in to your dashboard to start writing posts, creating pages, customizing your theme, and installing plugins.
          </p>
          
          <div className="flex justify-center gap-4">
            <Link
              href="/admin"
              className="py-3 px-6 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
