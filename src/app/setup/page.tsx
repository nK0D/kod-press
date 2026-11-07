import { redirect } from 'next/navigation';
import SetupWizard from './SetupWizard';
import fs from 'fs';
import path from 'path';

export const metadata = {
  title: 'KodPress Setup Wizard',
  description: 'Setup and configuration wizard for KodPress CMS.',
};

export default async function SetupPage() {
  try {
    const configPath = path.resolve(process.cwd(), 'kodpress-config.json');
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (configData.installed === true) {
        redirect('/admin');
      }
    }
  } catch (e) {
    // Configuration file does not exist, meaning we are not installed yet.
  }

  return <SetupWizard />;
}
