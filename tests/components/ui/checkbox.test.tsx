import { render, screen } from '@testing-library/react';
import { Checkbox } from '@/components/ui/checkbox';
import { describe, it, expect } from 'vitest';

describe('Checkbox Component', () => {
  it('renders with Pixel-Pop styles', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveClass('rounded-none');
    expect(checkbox).toHaveClass('border-4');
  });

  it('supports disabled state', () => {
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });
});
