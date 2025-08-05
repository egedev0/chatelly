import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  exp: number;
  iat: number;
}

export class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes in milliseconds

  static setTokens(token: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static isTokenValid(token: string): boolean {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now();
      const expiryTime = decoded.exp * 1000; // Convert to milliseconds
      
      return expiryTime > currentTime + this.TOKEN_EXPIRY_BUFFER;
    } catch (error) {
      console.error('Invalid token:', error);
      return false;
    }
  }

  static isTokenExpiringSoon(token: string): boolean {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now();
      const expiryTime = decoded.exp * 1000;
      const timeUntilExpiry = expiryTime - currentTime;
      
      // Return true if token expires within 10 minutes
      return timeUntilExpiry < 10 * 60 * 1000;
    } catch (error) {
      return true; // Assume expiring if we can't decode
    }
  }

  static getUserFromToken(token: string): Partial<JWTPayload> | null {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      return {
        sub: decoded.sub,
        email: decoded.email,
        name: decoded.name,
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  static hasValidToken(): boolean {
    const token = this.getToken();
    return token ? this.isTokenValid(token) : false;
  }
}

export class AuthGuard {
  static isAuthenticated(): boolean {
    return TokenManager.hasValidToken();
  }

  static requireAuth(): boolean {
    if (!this.isAuthenticated()) {
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return false;
    }
    return true;
  }

  static redirectIfAuthenticated(redirectTo: string = '/dashboard'): void {
    if (this.isAuthenticated() && typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  }
}

export class AuthStorage {
  private static readonly USER_PREFERENCES_KEY = 'user_preferences';
  private static readonly REMEMBER_ME_KEY = 'remember_me';

  static setRememberMe(remember: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.REMEMBER_ME_KEY, remember.toString());
  }

  static getRememberMe(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(this.REMEMBER_ME_KEY) === 'true';
  }

  static setUserPreferences(preferences: Record<string, any>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_PREFERENCES_KEY, JSON.stringify(preferences));
  }

  static getUserPreferences(): Record<string, any> {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(this.USER_PREFERENCES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to parse user preferences:', error);
      return {};
    }
  }

  static clearUserData(): void {
    if (typeof window === 'undefined') return;
    
    TokenManager.clearTokens();
    localStorage.removeItem(this.USER_PREFERENCES_KEY);
    localStorage.removeItem(this.REMEMBER_ME_KEY);
  }
}

// Utility functions for form validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};