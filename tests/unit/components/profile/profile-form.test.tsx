import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

// Mock @nsmr/pixelart-react before imports
vi.mock("@nsmr/pixelart-react", () => ({
  User: () => <div data-testid="pixelart-user" />,
  Dice: () => <div data-testid="pixelart-dice" />,
  Check: () => <div data-testid="pixelart-check" />,
  ChevronDown: () => <div data-testid="pixelart-chevron-down" />,
  ChevronUp: () => <div data-testid="pixelart-chevron-up" />,
}));

import { ProfileForm } from "@/components/profile/profile-form";
import { usePlayerProfile } from "@/hooks/use-player-profile";
import { AVATAR_COLORS } from "@/lib/constants/avatar";
import { ANIMALS } from "@/lib/utils/random-pseudo";

// Mock the hook
vi.mock("@/hooks/use-player-profile", () => ({
  usePlayerProfile: vi.fn(),
}));

describe("ProfileForm", () => {
  const mockUpdateProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (usePlayerProfile as Mock).mockReturnValue({
      profile: null,
      updateProfile: mockUpdateProfile,
      isLoading: false,
      isInitialized: true,
    });
  });

  it("renders with default random pseudo if no profile", () => {
    render(<ProfileForm />);
    const input = screen.getByLabelText(/Ton Pseudo/i);
    expect(input).toHaveValue(); // Should have some value
    expect((input as HTMLInputElement).value).not.toBe("");
  });

  it("renders with profile data if profile exists", () => {
    const mockProfile = {
      pseudo: "ExistingUser",
      avatar_config: { animal: ANIMALS[2], color: AVATAR_COLORS[2] },
    };
    (usePlayerProfile as Mock).mockReturnValue({
      profile: mockProfile,
      updateProfile: mockUpdateProfile,
      isLoading: false,
      isInitialized: true,
    });

    render(<ProfileForm />);
    const input = screen.getByLabelText(/Ton Pseudo/i);
    expect(input).toHaveValue("ExistingUser");
  });

  it("calls updateProfile on submit", async () => {
    render(<ProfileForm />);

    // Wait for pseudo to be generated
    await waitFor(() => {
      expect(screen.getByLabelText(/Ton Pseudo/i)).not.toHaveValue("");
    });

    const button = screen.getByRole("button", { name: /C'EST PARTI/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalled();
    });
  });

  it("validates short pseudo", async () => {
    render(<ProfileForm />);
    const input = screen.getByLabelText(/Ton Pseudo/i);

    fireEvent.change(input, { target: { value: "Ab" } }); // Too short
    const button = screen.getByRole("button", { name: /C'EST PARTI/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/Le pseudo doit contenir au moins 3 caractères/i),
      ).toBeInTheDocument();
    });
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });
});
