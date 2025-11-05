import type { AppState } from '@/types';
import { decrypt } from './crypto';

/**
 * Import JSON file
 */
export async function importJSON(file: File): Promise<Partial<AppState>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Import encrypted file
 */
export async function importEncrypted(file: File, passphrase: string): Promise<Partial<AppState>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const decrypted = await decrypt(content, passphrase);
        const data = JSON.parse(decrypted);
        resolve(data);
      } catch (error) {
        reject(new Error('Failed to decrypt file. Check your passphrase.'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Validate imported data structure
 */
export function validateImportedData(data: any): data is Partial<AppState> {
  // Basic validation - check for expected top-level properties
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  
  // If it has a version, validate it
  if ('version' in data && typeof data.version !== 'number') {
    return false;
  }
  
  // If it has profile, validate basic structure
  if ('profile' in data && data.profile !== undefined) {
    if (typeof data.profile !== 'object' || !data.profile.cleanDate) {
      return false;
    }
  }
  
  return true;
}
