export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

export interface AppSettings {
  currency: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  isOnboarded?: boolean;
}