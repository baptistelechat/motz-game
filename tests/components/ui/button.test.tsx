import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { describe, it, expect } from 'vitest';

describe('Button Component', () => {
  it('renders with Pixel-Pop default styles', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    // Check for core design system classes
    expect(button).toHaveClass('rounded-none');
    expect(button).toHaveClass('border-4');
  });

  it('renders destructive variant correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button', { name: /delete/i });
    
    expect(button).toHaveClass('bg-destructive');
  });
});
