import { joinGame } from "@/app/actions/game-actions";
import { createClient } from "@/lib/supabase/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("joinGame Server Action", () => {
  const mockInsert = vi.fn();
  const mockSingle = vi.fn();
  const mockEq = vi.fn();
  const mockSelect = vi.fn();
  const mockFrom = vi.fn();
  const mockGetUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock chainable Supabase methods
    mockInsert.mockResolvedValue({ error: null });
    mockSingle.mockResolvedValue({
      data: { id: "game-123", status: "LOBBY" },
      error: null,
    });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createClient as any).mockResolvedValue({
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom,
    });
  });

  it("should throw if user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: "Auth error",
    });

    await expect(joinGame("CODE123")).rejects.toThrow(
      "User must be authenticated",
    );
  });

  it("should throw if game does not exist", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "Not found" },
    });

    await expect(joinGame("CODE123")).rejects.toThrow("Game not found");
  });

  it("should throw if game is not in LOBBY status", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
    mockSingle.mockResolvedValue({
      data: { id: "game-123", status: "PLAYING" },
      error: null,
    });

    await expect(joinGame("CODE123")).rejects.toThrow(
      "Game is already started or finished",
    );
  });

  it("should join successfully if game is in LOBBY", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const result = await joinGame("CODE123");

    expect(mockFrom).toHaveBeenCalledWith("games");
    expect(mockSelect).toHaveBeenCalledWith("id, status");
    expect(mockEq).toHaveBeenCalledWith("code", "CODE123");

    expect(mockFrom).toHaveBeenCalledWith("game_players");
    expect(mockInsert).toHaveBeenCalledWith({
      game_id: "game-123",
      player_id: "user-123",
    });

    expect(result).toEqual({ success: true, gameId: "game-123" });
  });

  it("should handle already joined players gracefully (ignore duplicate key error)", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
    mockInsert.mockResolvedValue({
      error: { code: "23505", message: "duplicate" },
    }); // 23505 is unique violation

    const result = await joinGame("CODE123");

    expect(result).toEqual({ success: true, gameId: "game-123" });
  });
});
