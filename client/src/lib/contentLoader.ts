import type { StepContent, WorksheetTemplate } from '@/types';

const stepContentCache = new Map<number, StepContent>();
const worksheetCache = new Map<string, WorksheetTemplate>();

/**
 * Load step content from JSON file
 */
export async function loadStepContent(stepNumber: number): Promise<StepContent | null> {
  // Check cache first
  if (stepContentCache.has(stepNumber)) {
    return stepContentCache.get(stepNumber)!;
  }

  try {
    const response = await fetch(`/content/steps/${stepNumber}.json`);
    if (!response.ok) {
      console.warn(`Step ${stepNumber} content not found`);
      return null;
    }

    const content: StepContent = await response.json();
    stepContentCache.set(stepNumber, content);
    return content;
  } catch (error) {
    console.error(`Failed to load step ${stepNumber} content:`, error);
    return null;
  }
}

/**
 * Load all step content files (1-12)
 */
export async function loadAllSteps(): Promise<Map<number, StepContent>> {
  const promises = Array.from({ length: 12 }, (_, i) => loadStepContent(i + 1));
  await Promise.all(promises);
  return stepContentCache;
}

/**
 * Load worksheet template from JSON file
 */
export async function loadWorksheetTemplate(id: string): Promise<WorksheetTemplate | null> {
  // Check cache first
  if (worksheetCache.has(id)) {
    return worksheetCache.get(id)!;
  }

  try {
    const response = await fetch(`/content/worksheets/${id}.json`);
    if (!response.ok) {
      console.warn(`Worksheet template ${id} not found`);
      return null;
    }

    const template: WorksheetTemplate = await response.json();
    worksheetCache.set(id, template);
    return template;
  } catch (error) {
    console.error(`Failed to load worksheet template ${id}:`, error);
    return null;
  }
}

/**
 * Get available worksheet templates
 */
export function getAvailableWorksheets(): string[] {
  return ['demo-triggers', 'demo-halt'];
}

/**
 * Clear content caches (useful for hot reload or content updates)
 */
export function clearContentCache(): void {
  stepContentCache.clear();
  worksheetCache.clear();
}
