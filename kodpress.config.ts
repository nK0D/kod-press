/**
 * KodPress CMS Configuration File
 */
export interface KodPressConfig {
  name: string;
  version: string;
  uploadDir: string;
  pluginsDir: string;
  themesDir: string;
}

export const config: KodPressConfig = {
  name: 'KodPress',
  version: '1.0.0',
  uploadDir: process.env.KODPRESS_UPLOAD_DIR || 'public/uploads',
  pluginsDir: 'plugins',
  themesDir: 'themes',
};

export default config;
