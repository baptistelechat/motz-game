import { render, screen } from '@testing-library/react';
import { Label } from '@/components/ui/label';
import { describe, it, expect } from 'vitest';

describe('Label Component', () => {
  it('renders label text correctly', () => {
    render(<Label htmlFor="email">Email Address</Label>);
    const label = screen.getByText('Email Address');
    
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', 'email');
  });

  it('applies base styles', () => {
    render(<Label>Styled Label</Label>);
    const label = screen.getByText('Styled Label');
    
    expect(label).toHaveClass('text-sm');
    expect(label).toHaveClass('font-medium');
  });
});
