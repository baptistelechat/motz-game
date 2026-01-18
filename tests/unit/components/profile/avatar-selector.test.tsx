import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock @nsmr/pixelart-react before imports
vi.mock('@nsmr/pixelart-react', () => ({
  User: () => <div data-testid="pixelart-user" />,
}));

import { AvatarSelector } from '@/components/profile/avatar-selector';
import { ANIMALS } from '@/lib/utils/random-pseudo';
import { AVATAR_COLORS } from '@/lib/constants/avatar';

describe('AvatarSelector', () => {
  it('renders animals and colors', () => {
    const mockOnChange = vi.fn();
    const value = { animal: ANIMALS[0], color: AVATAR_COLORS[0] };

    render(<AvatarSelector value={value} onChange={mockOnChange} />);

    expect(screen.getByText('Couleur')).toBeInTheDocument();
    expect(screen.getByText('Avatar')).toBeInTheDocument();
    
    // Check if animals are rendered
    ANIMALS.forEach(animal => {
        // We use getAllByText because some might be hidden or duplicate if using tooltip
        expect(screen.getAllByText(animal).length).toBeGreaterThan(0);
    });

    // Check if colors buttons exist (by aria-label)
    AVATAR_COLORS.forEach(color => {
        expect(screen.getByLabelText(`Choisir la couleur ${color}`)).toBeInTheDocument();
    });
  });

  it('calls onChange when selecting a color', () => {
    const mockOnChange = vi.fn();
    const value = { animal: ANIMALS[0], color: AVATAR_COLORS[0] };
    const nextColor = AVATAR_COLORS[1];

    render(<AvatarSelector value={value} onChange={mockOnChange} />);

    fireEvent.click(screen.getByLabelText(`Choisir la couleur ${nextColor}`));

    expect(mockOnChange).toHaveBeenCalledWith({ ...value, color: nextColor });
  });

  it('calls onChange when selecting an animal', () => {
    const mockOnChange = vi.fn();
    const value = { animal: ANIMALS[0], color: AVATAR_COLORS[0] };
    const nextAnimal = ANIMALS[1];

    render(<AvatarSelector value={value} onChange={mockOnChange} />);

    // Click on the animal button. Since the button contains the text, we can click the text.
    fireEvent.click(screen.getByText(nextAnimal));

    expect(mockOnChange).toHaveBeenCalledWith({ ...value, animal: nextAnimal });
  });
});
