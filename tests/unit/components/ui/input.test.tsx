import { render, screen } from '@testing-library/react';
import { Input } from '@/components/ui/input';
import { describe, it, expect } from 'vitest';

describe('Input', () => {
  it('renders with pixel-pop styles', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('rounded-none');
    expect(input).toHaveClass('border-4');
  });

  it('renders with correct font and size', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toHaveClass('font-sans');
    expect(input).toHaveClass('text-3xl');
  });

  it('renders with border-black', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toHaveClass('border-black');
  });
});
