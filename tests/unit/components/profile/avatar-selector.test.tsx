import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

// Mock @nsmr/pixelart-react before imports
vi.mock("@nsmr/pixelart-react", () => ({
  User: () => <div data-testid="pixelart-user" />,
  Check: () => <div data-testid="pixelart-check" />,
  ChevronDown: () => <div data-testid="pixelart-chevron-down" />,
  ChevronUp: () => <div data-testid="pixelart-chevron-up" />,
}));

import { AvatarSelector } from "@/components/profile/avatar-selector";
import { AVATAR_COLORS } from "@/lib/constants/avatar";
import { ANIMALS } from "@/lib/utils/random-pseudo";

describe("AvatarSelector", () => {
  beforeAll(() => {
    // Mock scrollIntoView for Radix UI Select
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("renders animals and colors", () => {
    const mockOnChange = vi.fn();
    const value = { animal: ANIMALS[0], color: AVATAR_COLORS[0] };

    render(<AvatarSelector value={value} onChange={mockOnChange} />);

    expect(screen.getByText("Couleur")).toBeInTheDocument();
    expect(screen.getByText("Avatar")).toBeInTheDocument();

    // Check if current animal is rendered
    expect(screen.getByText(value.animal)).toBeInTheDocument();

    // Check if colors buttons exist (by aria-label)
    AVATAR_COLORS.forEach((color) => {
      expect(
        screen.getByLabelText(`Choisir la couleur ${color}`),
      ).toBeInTheDocument();
    });
  });

  it("calls onChange when selecting a color", () => {
    const mockOnChange = vi.fn();
    const value = { animal: ANIMALS[0], color: AVATAR_COLORS[0] };
    const nextColor = AVATAR_COLORS[1];

    render(<AvatarSelector value={value} onChange={mockOnChange} />);

    fireEvent.click(screen.getByLabelText(`Choisir la couleur ${nextColor}`));

    expect(mockOnChange).toHaveBeenCalledWith({ ...value, color: nextColor });
  });

  it("calls onChange when selecting an animal", async () => {
    const mockOnChange = vi.fn();
    const value = { animal: ANIMALS[0], color: AVATAR_COLORS[0] };
    const nextAnimal = ANIMALS[1];

    render(<AvatarSelector value={value} onChange={mockOnChange} />);

    // Open the select
    // We can find the trigger by the current animal text which is displayed
    const trigger = screen.getByText(value.animal);
    fireEvent.click(trigger);

    // Wait for the option to appear and click it
    // Radix UI renders options in a Portal, findByText searches the whole document body
    const option = await screen.findByText(nextAnimal);
    fireEvent.click(option);

    expect(mockOnChange).toHaveBeenCalledWith({ ...value, animal: nextAnimal });
  });
});
