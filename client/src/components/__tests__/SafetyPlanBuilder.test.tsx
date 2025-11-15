import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SafetyPlanBuilder from '../safety-plan/SafetyPlanBuilder';
import { useAppStore } from '@/store/useAppStore';

// Mock the store
vi.mock('@/store/useAppStore', () => ({
  useAppStore: vi.fn(),
}));

// Mock crisis resources
vi.mock('@/lib/crisis-resources', () => ({
  getCrisisResourcesForRegion: vi.fn(() => [
    {
      id: 'test-resource',
      name: 'Test Crisis Line',
      phone: '1234567890',
      region: 'US',
    },
  ]),
  detectRegionFromTimezone: vi.fn(() => 'US'),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('SafetyPlanBuilder', () => {
  const mockCreateSafetyPlan = vi.fn();
  const mockGetContacts = vi.fn(() => []);

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockImplementation((selector: any) => {
      const state = {
        profile: { timezone: 'America/New_York' },
        getContacts: mockGetContacts,
        createSafetyPlan: mockCreateSafetyPlan,
      };
      return selector(state);
    });
  });

  it('should render step 1 (People to Contact)', () => {
    const onComplete = vi.fn();
    render(<SafetyPlanBuilder onComplete={onComplete} />);

    expect(screen.getByText(/People to Contact/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Contact/i)).toBeInTheDocument();
  });

  it('should allow adding contacts', async () => {
    const onComplete = vi.fn();
    render(<SafetyPlanBuilder onComplete={onComplete} />);

    const addButton = screen.getByText(/Add Contact/i);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    });
  });

  it('should validate contact information before proceeding', async () => {
    const onComplete = vi.fn();
    render(<SafetyPlanBuilder onComplete={onComplete} />);

    const addButton = screen.getByText(/Add Contact/i);
    fireEvent.click(addButton);

    await waitFor(() => {
      const nextButton = screen.getByText(/Next/i);
      expect(nextButton).toBeDisabled();
    });
  });

  it('should show progress indicator', () => {
    const onComplete = vi.fn();
    render(<SafetyPlanBuilder onComplete={onComplete} />);

    expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();
  });
});

