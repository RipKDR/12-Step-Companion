import type { AppState } from '@/types';
import { encrypt } from './crypto';

/**
 * Export app data as JSON
 */
export function exportJSON(data: AppState): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `recovery-companion-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Export app data as encrypted file
 */
export async function exportEncrypted(data: AppState, passphrase: string): Promise<void> {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = await encrypt(jsonString, passphrase);
    
    const blob = new Blob([encrypted], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `recovery-companion-backup-${new Date().toISOString().split('T')[0]}.enc`;
    link.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Failed to create encrypted backup');
  }
}

/**
 * Download step answers as JSON
 */
import type { StepAnswer } from '@/types';

export function exportStepAnswers(stepNumber: number, answers: StepAnswer[]): void {
  const data = {
    step: stepNumber,
    exportedAt: new Date().toISOString(),
    answers,
  };
  
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `step-${stepNumber}-answers-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}
