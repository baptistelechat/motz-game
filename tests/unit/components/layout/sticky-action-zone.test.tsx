import { render, screen } from '@testing-library/react';
import { StickyActionZone } from '@/components/layout/sticky-action-zone';
import { describe, it, expect } from 'vitest';

describe('StickyActionZone', () => {
  it('renders children correctly', () => {
    render(<StickyActionZone><div>Action Zone</div></StickyActionZone>);
    expect(screen.getByText('Action Zone')).toBeInTheDocument();
  });

  it('has fixed positioning and correct z-index', () => {
    render(<StickyActionZone>Content</StickyActionZone>);
    const zone = screen.getByTestId('sticky-action-zone');
    expect(zone).toHaveClass('fixed');
    expect(zone).toHaveClass('bottom-6');
    expect(zone).toHaveClass('right-6');
    expect(zone).toHaveClass('z-50');
  });

});
