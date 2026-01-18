import { render, screen } from '@testing-library/react';
import Home from '@/app/page';
import { describe, it, expect } from 'vitest';

describe('Home Page', () => {
  it('renders title with Press Start 2P font', () => {
    render(<Home />);
    const title = screen.getByRole('heading', { level: 1, name: /motz-game/i });
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('font-display');
  });

  it('renders create game button', () => {
    render(<Home />);
    const button = screen.getByRole('button', { name: /créer partie/i });
    expect(button).toBeInTheDocument();
  });

  it('renders join game button or input', () => {
    render(<Home />);
    // Check for either button or input section
    const joinSection = screen.getByText(/rejoindre/i);
    expect(joinSection).toBeInTheDocument();
  });
});
