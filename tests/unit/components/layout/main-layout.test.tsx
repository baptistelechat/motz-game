import { render, screen } from '@testing-library/react';
import { MainLayout } from '@/components/layout/main-layout';
import { describe, it, expect } from 'vitest';

describe('MainLayout', () => {
  it('renders children correctly', () => {
    render(<MainLayout><div>Main Content</div></MainLayout>);
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('has correct minimum height using dvh', () => {
    render(<MainLayout>Content</MainLayout>);
    const main = screen.getByRole('main');
    expect(main).toHaveClass('min-h-[100dvh]');
  });

  it('renders as a main element', () => {
    render(<MainLayout>Content</MainLayout>);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
