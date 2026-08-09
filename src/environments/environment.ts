export interface FalinaEnvironment {
  production: boolean;
  appName: string;
  tagline: string;
  /** Base URL for the Falina API (`/api/v1`). */
  apiBaseUrl: string;
  /** Default AI provider hint (must match falina-api AI_PROVIDER). */
  aiProvider: string;
}

export const environment: FalinaEnvironment = {
  production: true,
  appName: 'Falina',
  tagline: 'Your Personal Oracle',
  apiBaseUrl: '/api/v1',
  aiProvider: 'mock',
};
