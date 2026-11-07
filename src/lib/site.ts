import fs from 'fs';
import path from 'path';
import { getOption } from './options';

export interface SiteInfo {
  installed: boolean;
  title: string;
  tagline: string;
}

/**
 * Whether the site is installed, plus its title and tagline. Install state
 * comes from kodpress-config.json; title and tagline come from the options
 * table (what Settings will edit), falling back to the install config.
 */
export async function getSiteInfo(): Promise<SiteInfo> {
  let config: { installed?: boolean; site?: { title?: string; tagline?: string } } = {};
  try {
    const configPath = path.resolve(process.cwd(), 'kodpress-config.json');
    if (fs.existsSync(configPath)) config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch {
    // An unreadable config means "not installed yet".
  }

  const installed = config.installed === true;
  if (!installed) return { installed, title: 'KodPress', tagline: '' };

  const [title, tagline] = await Promise.all([getOption('blogname'), getOption('blogdescription')]);
  return {
    installed,
    title: title || config.site?.title || 'KodPress',
    tagline: tagline ?? config.site?.tagline ?? '',
  };
}
