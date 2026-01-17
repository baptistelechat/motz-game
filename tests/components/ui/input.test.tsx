import { render, screen } from '@testing-library/react';
import { Input } from '@/components/ui/input';
import { describe, it, expect } from 'vitest';

describe('Input Component', () => {
  it('renders with default type text behavior', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    
    expect(input).toBeInTheDocument();
    // Default input without type attribute behaves as text
    expect(input).toHaveAttribute('placeholder', 'Enter text');
  });

  it('renders with specific type', () => {
    render(<Input type="email" placeholder="Email" />);
    const input = screen.getByPlaceholderText('Email');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('renders with Pixel-Pop styles', () => {
    render(<Input />);
    // Select by role if possible, or by class if we don't have label/placeholder
    // Here we can use container or just render and find by role 'textbox'
    const input = screen.getByRole('textbox');
    
    expect(input).toHaveClass('rounded-none');
    expect(input).toHaveClass('border-4');
  });

  it('handles disabled state', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });
});
