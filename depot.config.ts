/**
 * Depot CMS Configuration File
 */
export interface DepotConfig {
  name: string;
  version: string;
  uploadDir: string;
  pluginsDir: string;
  themesDir: string;
}

export const config: DepotConfig = {
  name: 'Depot',
  version: '1.0.0',
  uploadDir: process.env.DEPOT_UPLOAD_DIR || 'public/uploads',
  pluginsDir: 'plugins',
  themesDir: 'themes',
};

export default config;
