// Secure data handling utilities for non-payment sensitive data
import { supabase } from './supabase';

export class SecurityService {
  // Hash sensitive non-payment data for secure storage
  private static async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Secure user profile data (non-payment)
  static async secureUserData(userData: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  }) {
    try {
      // Only hash phone if provided (for privacy)
      const securedData = {
        ...userData,
        phone: userData.phone ? await this.hashData(userData.phone) : null
      };

      return securedData;
    } catch (error) {
      console.error('Error securing user data:', error);
      throw error;
    }
  }

  // Validate data integrity
  static async validateDataIntegrity(originalData: string, hashedData: string): Promise<boolean> {
    try {
      const newHash = await this.hashData(originalData);
      return newHash === hashedData;
    } catch (error) {
      console.error('Error validating data integrity:', error);
      return false;
    }
  }

  // Secure session management
  static async createSecureSession(userId: string) {
    try {
      const sessionToken = window.crypto.getRandomValues(new Uint8Array(32));
      const sessionId = Array.from(sessionToken, byte => byte.toString(16).padStart(2, '0')).join('');
      
      // Store session securely (example implementation)
      sessionStorage.setItem('secure_session', sessionId);
      
      return sessionId;
    } catch (error) {
      console.error('Error creating secure session:', error);
      throw error;
    }
  }

  // Clear sensitive data from memory
  static clearSensitiveData() {
    // Clear any temporary sensitive data from memory
    sessionStorage.removeItem('secure_session');
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }
}