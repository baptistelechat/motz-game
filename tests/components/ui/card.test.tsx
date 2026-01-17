import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { describe, it, expect } from 'vitest';

describe('Card Component', () => {
  it('renders card with all subcomponents', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Content Area</CardContent>
        <CardFooter>Footer Area</CardFooter>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Content Area')).toBeInTheDocument();
    expect(screen.getByText('Footer Area')).toBeInTheDocument();
  });

  it('applies Pixel-Pop design tokens', () => {
    render(<Card>Pixel Pop</Card>);
    const card = screen.getByText('Pixel Pop').closest('div');
    
    // Check for rounded-none (Zero-Radius) and other base classes
    expect(card).toHaveClass('rounded-none');
    expect(card).toHaveClass('border-4');
    expect(card).toHaveClass('bg-card');
  });
});
