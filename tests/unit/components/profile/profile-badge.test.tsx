import { ProfileBadge } from "@/components/profile/profile-badge";
import { ADJECTIVES, ANIMALS } from "@/lib/constants/pseudo";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, Mock } from "vitest";
import { usePlayerProfile } from "@/hooks/use-player-profile";

// Mock dependencies
vi.mock("@/components/profile/avatar-display", () => ({
  AvatarDisplay: () => <div data-testid="avatar-display" />,
}));

vi.mock("@nsmr/pixelart-react", () => ({
  Lightbulb: () => <div data-testid="lightbulb-icon" />,
}));

vi.mock("@/components/profile/components/profile-dialog", () => ({
  ProfileDialog: ({ open }: { open: boolean }) => (
    open ? <div data-testid="profile-dialog">Dialog Open</div> : null
  ),
}));

vi.mock("@/hooks/use-player-profile", () => ({
  usePlayerProfile: vi.fn(),
}));

describe("ProfileBadge", () => {
  const mockProfile = {
    pseudo: "CustomUser",
    avatar_config: { animal: "fox", color: "green" },
  };

  it("renders nothing if profile is null", () => {
    (usePlayerProfile as Mock).mockReturnValue({ profile: null });
    const { container } = render(<ProfileBadge />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders profile pseudo when profile exists", () => {
    (usePlayerProfile as Mock).mockReturnValue({ profile: mockProfile });
    render(<ProfileBadge />);
    expect(screen.getByText("CustomUser")).toBeInTheDocument();
  });

  it("opens dialog when clicked", () => {
    (usePlayerProfile as Mock).mockReturnValue({ profile: mockProfile });
    render(<ProfileBadge />);
    
    expect(screen.queryByTestId("profile-dialog")).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByRole("button"));
    
    expect(screen.getByTestId("profile-dialog")).toBeInTheDocument();
  });

  it("shows hint for default pseudo", () => {
    const normalize = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const animal = ANIMALS[0];
    const adjective = ADJECTIVES[0];
    const defaultPseudo = `${normalize(animal)}_${normalize(adjective)}`;

    const defaultProfile = {
      ...mockProfile,
      pseudo: defaultPseudo,
    };

    (usePlayerProfile as Mock).mockReturnValue({ profile: defaultProfile });
    render(<ProfileBadge />);

    expect(screen.getByTestId("lightbulb-icon")).toBeInTheDocument();
  });
});
