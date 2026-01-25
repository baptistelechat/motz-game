import Home from "@/app/page";
import { AVATAR_COLORS } from "@/lib/constants/avatar";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("@nsmr/pixelart-react", () => ({
  User: () => <div data-testid="pixelart-user" />,
  Download: () => <div data-testid="pixelart-download" />,
  Upload: () => <div data-testid="pixelart-upload" />,
  Close: () => <div data-testid="pixelart-close" />,
  Check: () => <div data-testid="pixelart-check" />,
  ChevronDown: () => <div data-testid="pixelart-chevron-down" />,
  ChevronUp: () => <div data-testid="pixelart-chevron-up" />,
  Dice: () => <div data-testid="pixelart-dice" />,
  InfoBox: () => <div data-testid="pixelart-infobox" />,
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: vi.fn(),
}));

// Mock usePlayerProfile
vi.mock("@/hooks/use-player-profile", () => ({
  usePlayerProfile: vi.fn(),
}));

// Mock child components to avoid deep rendering and potential loops
vi.mock("@/components/layout/main-layout", () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}));
vi.mock("@/components/game/join-game-dialog", () => ({
  JoinGameDialog: () => <div data-testid="join-game-dialog" />,
}));
vi.mock("@/components/info/attributes-dialog", () => ({
  AttributesDialog: () => <div data-testid="attributes-dialog" />,
}));
vi.mock("@/components/layout/sticky-action-zone", () => ({
  StickyActionZone: () => <div data-testid="sticky-action-zone" />,
}));
vi.mock("@/components/pwa/install-app", () => ({
  InstallApp: () => <div data-testid="install-app" />,
}));
vi.mock("@/components/ui/loading-screen", () => ({
  LoadingScreen: () => <div data-testid="loading-screen" />,
}));
vi.mock("@/components/ui/error-card", () => ({
  ErrorCard: () => <div data-testid="error-card" />,
}));

import { usePlayerProfile } from "@/hooks/use-player-profile";
import { useAuth } from "@/components/providers/auth-provider";

describe("Home Page", () => {
  const mockUpdateProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useAuth
    (useAuth as Mock).mockReturnValue({
      user: { id: "test-user-id" },
      isLoading: false,
    });

    // Default mock: Profile exists, so Main Menu renders
    (usePlayerProfile as Mock).mockReturnValue({
      profile: {
        pseudo: "TestUser",
        avatar_config: { animal: "chat", color: AVATAR_COLORS[2] },
      },
      isLoading: false,
      isInitialized: true,
      updateProfile: mockUpdateProfile,
      user: { id: "test-user-id" },
    });
  });

  it("renders title with Press Start 2P font", () => {
    render(<Home />);
    const title = screen.getByRole("heading", { level: 1, name: /motz-game/i });
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass("font-display");
  });

  it("renders create game button", () => {
    render(<Home />);
    const button = screen.getByRole("button", { name: /créer une partie/i });
    expect(button).toBeInTheDocument();
  });

  it("renders join game button or input", () => {
    render(<Home />);
    // Check for either button or input section
    const joinSection = screen.getByText(/rejoindre/i);
    expect(joinSection).toBeInTheDocument();
  });

  it("triggers silent profile creation when user is auth but no profile", async () => {
    // Simulate state update behavior
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentProfile: any = null;
    
    const mockUpdateProfile = vi.fn().mockImplementation(() => {
      currentProfile = { 
        pseudo: "TestUser",
        avatar_config: { animal: "chat", color: AVATAR_COLORS[2] }
      };
      return Promise.resolve();
    });

    (usePlayerProfile as Mock).mockImplementation(() => ({
      profile: currentProfile,
      isLoading: false,
      updateProfile: mockUpdateProfile,
      user: { id: "test-user-id" },
      isInitialized: true,
    }));

    render(<Home />);

    // Should call updateProfile
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalled();
    });
  });
});
