import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { describe, it, expect } from 'vitest';

describe('Button', () => {
  it('renders with default pixel-pop styles', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('rounded-none');
    expect(button).toHaveClass('border-4');
  });

  it('renders with shadow-hard class', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('shadow-hard');
  });
});
