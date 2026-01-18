import { render, screen, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('@nsmr/pixelart-react', () => ({
  User: () => <div data-testid="pixelart-user" />,
  Download: () => <div data-testid="pixelart-download" />,
  Upload: () => <div data-testid="pixelart-upload" />,
}));

// Mock usePlayerProfile
vi.mock('@/hooks/use-player-profile', () => ({
  usePlayerProfile: vi.fn(),
}));

import { usePlayerProfile } from '@/hooks/use-player-profile';

describe('Home Page', () => {
  const mockUpdateProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: Profile exists, so Main Menu renders
    (usePlayerProfile as Mock).mockReturnValue({
      profile: {
        pseudo: 'TestUser',
        avatar_config: { animal: 'cat', color: '#ff0000' }
      },
      isLoading: false,
      updateProfile: mockUpdateProfile,
      user: { id: 'test-user-id' }
    });
  });

  it('renders title with Press Start 2P font', () => {
    render(<Home />);
    const title = screen.getByRole('heading', { level: 1, name: /motz-game/i });
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('font-display');
  });

  it('renders create game button', () => {
    render(<Home />);
    const button = screen.getByRole('button', { name: /créer partie/i });
    expect(button).toBeInTheDocument();
  });

  it('renders join game button or input', () => {
    render(<Home />);
    // Check for either button or input section
    const joinSection = screen.getByText(/rejoindre/i);
    expect(joinSection).toBeInTheDocument();
  });

  it('triggers silent profile creation when user is auth but no profile', async () => {
    const mockUpdateProfile = vi.fn().mockResolvedValue({});
    (usePlayerProfile as Mock).mockReturnValue({
      profile: null,
      isLoading: false,
      updateProfile: mockUpdateProfile,
      user: { id: 'test-user-id' }
    });

    render(<Home />);
    
    // Should show "CRÉATION DU PROFIL..."
    expect(screen.getByText(/CRÉATION DU PROFIL.../i)).toBeInTheDocument();
    
    // Should call updateProfile
    await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalled();
    });
  });
});
