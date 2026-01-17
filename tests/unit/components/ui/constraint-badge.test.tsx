import { render, screen } from '@testing-library/react';
import { ConstraintBadge } from '@/components/ui/constraint-badge';
import { describe, it, expect } from 'vitest';

describe('ConstraintBadge', () => {
  it('renders with default pixel-pop styles', () => {
    render(<ConstraintBadge>TEST</ConstraintBadge>);
    const badge = screen.getByText('TEST');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('border-4');
    expect(badge).toHaveClass('border-black');
    expect(badge).toHaveClass('rounded-none');
    expect(badge).toHaveClass('font-pixel');
  });

  it('renders with success variant', () => {
    render(<ConstraintBadge variant="success">EASY</ConstraintBadge>);
    const badge = screen.getByText('EASY');
    expect(badge).toHaveClass('bg-primary');
    expect(badge).toHaveClass('text-primary-foreground');
  });

  it('renders with forbidden variant', () => {
    render(<ConstraintBadge variant="forbidden">HARD</ConstraintBadge>);
    const badge = screen.getByText('HARD');
    expect(badge).toHaveClass('bg-destructive');
    expect(badge).toHaveClass('text-destructive-foreground');
  });
});
