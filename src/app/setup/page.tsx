import { redirect } from 'next/navigation';
import SetupWizard from './SetupWizard';
import { getSiteInfo } from '@/lib/site';

// Install state is read from disk on every request; never prerender this page at build time.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'KodPress Setup Wizard',
  description: 'Setup and configuration wizard for KodPress CMS.',
};

export default async function SetupPage() {
  if ((await getSiteInfo()).installed) {
    redirect('/admin');
  }

  return <SetupWizard />;
}
