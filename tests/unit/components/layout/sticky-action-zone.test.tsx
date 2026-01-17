import { render, screen } from '@testing-library/react';
import { StickyActionZone } from '@/components/layout/sticky-action-zone';
import { describe, it, expect } from 'vitest';

describe('StickyActionZone', () => {
  it('renders children correctly', () => {
    render(<StickyActionZone><div>Action Zone</div></StickyActionZone>);
    expect(screen.getByText('Action Zone')).toBeInTheDocument();
  });

  it('has sticky positioning and correct z-index', () => {
    render(<StickyActionZone>Content</StickyActionZone>);
    const zone = screen.getByRole('contentinfo');
    expect(zone).toHaveClass('sticky');
    expect(zone).toHaveClass('bottom-0');
    expect(zone).toHaveClass('z-50');
  });

  it('has pixel-pop border top', () => {
    render(<StickyActionZone>Content</StickyActionZone>);
    const zone = screen.getByRole('contentinfo');
    expect(zone).toHaveClass('border-t-4');
    expect(zone).toHaveClass('border-black');
  });
});
