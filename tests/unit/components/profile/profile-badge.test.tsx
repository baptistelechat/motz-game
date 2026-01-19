import { ProfileBadge } from "@/components/profile/profile-badge";
import { ADJECTIVES, ANIMALS } from "@/lib/constants/pseudo";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@/components/profile/avatar-display", () => ({
  AvatarDisplay: () => <div data-testid="avatar-display" />,
}));

vi.mock("@nsmr/pixelart-react", () => ({
  Lightbulb: () => <div data-testid="lightbulb-icon" />,
}));

describe("ProfileBadge", () => {
  const mockProfile = {
    pseudo: "CustomUser",
    avatar_config: { animal: "fox", color: "green" },
  };
  const mockOnClick = vi.fn();

  it("renders profile pseudo", () => {
    render(<ProfileBadge profile={mockProfile} onClick={mockOnClick} />);
    expect(screen.getByText("CustomUser")).toBeInTheDocument();
  });

  it("calls onClick when button is clicked", () => {
    render(<ProfileBadge profile={mockProfile} onClick={mockOnClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockOnClick).toHaveBeenCalled();
  });

  it("does NOT show hint for custom pseudo", () => {
    render(<ProfileBadge profile={mockProfile} onClick={mockOnClick} />);
    expect(screen.queryByTestId("lightbulb-icon")).not.toBeInTheDocument();
  });

  it("shows hint for default pseudo", () => {
    // Construct a valid default pseudo
    // We assume 'Renard' and 'Rapide' are in the lists (verified in previous reads)
    // But let's use actual values from imports if possible, or just known ones
    // The component normalizes, so we should test that path

    // Let's rely on the fact that ANIMALS[0] and ADJECTIVES[0] are valid
    // In random-pseudo.ts: raw = `${randomAnimal}_${randomAdjective}`
    // And normalize removes accents.

    // We'll create a pseudo that matches the logic
    const animal = ANIMALS[0]; // e.g. "Renard"
    const adjective = ADJECTIVES[0]; // e.g. "Rapide"
    const normalize = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const defaultPseudo = `${normalize(animal)}_${normalize(adjective)}`;

    const defaultProfile = {
      ...mockProfile,
      pseudo: defaultPseudo,
    };

    render(<ProfileBadge profile={defaultProfile} onClick={mockOnClick} />);

    expect(screen.getByTestId("lightbulb-icon")).toBeInTheDocument();
  });
});
