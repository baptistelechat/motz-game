import { render, screen } from '@testing-library/react';
import { MainLayout } from '@/components/layout/main-layout';
import { describe, it, expect, vi } from 'vitest';

// Mock ProfileBadge to avoid hook dependencies
vi.mock('@/components/profile/profile-badge', () => ({
  ProfileBadge: () => <div data-testid="profile-badge">ProfileBadge</div>
}));

describe('MainLayout', () => {
  it('renders children correctly', () => {
    render(<MainLayout><div>Main Content</div></MainLayout>);
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('renders profile badge', () => {
    render(<MainLayout>Content</MainLayout>);
    expect(screen.getByTestId('profile-badge')).toBeInTheDocument();
  });

  it('has correct minimum height using dvh', () => {
    render(<MainLayout>Content</MainLayout>);
    const main = screen.getByRole('main');
    expect(main).toHaveClass('min-h-dvh');
  });

  it('renders as a main element', () => {
    render(<MainLayout>Content</MainLayout>);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
