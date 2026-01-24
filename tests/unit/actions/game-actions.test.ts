import { joinGame, startGame, toggleReady } from "@/app/actions/game-actions";
import { createClient } from "@/lib/supabase/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Mock revalidatePath and redirect
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("Game Actions", () => {
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockSingle = vi.fn();
  const mockEq = vi.fn();
  const mockSelect = vi.fn();
  const mockFrom = vi.fn();
  const mockGetUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock chainable Supabase methods
    mockInsert.mockResolvedValue({ error: null });
    
    // Default promise result for the chain
    const defaultPromise = Promise.resolve({ error: null });
    
    // mockEq needs to be chainable AND awaitable
    mockEq.mockImplementation(() => ({
        eq: mockEq,
        single: mockSingle,
        update: mockUpdate,
        select: mockSelect,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        then: (resolve: any, reject: any) => defaultPromise.then(resolve, reject)
    }));
    
    mockUpdate.mockReturnValue({ eq: mockEq });
    
    mockSingle.mockResolvedValue({
      data: { id: "game-123", status: "LOBBY" },
      error: null,
    });
    
    mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle });
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createClient as any).mockResolvedValue({
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom,
    });
  });

  describe("joinGame", () => {
    it("should throw if user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: "Auth error",
      });

      await expect(joinGame("CODE123")).rejects.toThrow(
        "Vous devez être connecté pour rejoindre une partie.",
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

      await expect(joinGame("CODE123")).rejects.toThrow("Partie introuvable.");
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
        "La partie a déjà commencé ou est terminée.",
      );
    });

    it("should join successfully if game is in LOBBY", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });
      
      // Mock finding game
      mockSingle
        .mockResolvedValueOnce({ data: { id: "game-123", status: "LOBBY" }, error: null }) // finding game
        .mockResolvedValueOnce({ data: null, error: null }); // check existing player

      const result = await joinGame("CODE123");

      expect(mockFrom).toHaveBeenCalledWith("games");
      expect(mockSelect).toHaveBeenCalledWith("id, status");
      expect(mockEq).toHaveBeenCalledWith("code", "CODE123");

      expect(mockFrom).toHaveBeenCalledWith("game_players");
      expect(mockInsert).toHaveBeenCalledWith({
        game_id: "game-123",
        player_id: "user-123",
      });

      expect(result).toEqual({ success: true });
    });

    it("should handle already joined players gracefully", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });
      
      // Mock finding game
      mockSingle
        .mockResolvedValueOnce({ data: { id: "game-123", status: "LOBBY" }, error: null }) // finding game
        .mockResolvedValueOnce({ data: { game_id: "game-123" }, error: null }); // check existing player

      const result = await joinGame("CODE123");

      expect(result).toEqual({ success: true, message: "Déjà dans la partie" });
    });
  });

  describe("toggleReady", () => {
    it("should throw if user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: "Auth error",
      });

      await expect(toggleReady("game-123", true)).rejects.toThrow(
        "User must be authenticated",
      );
    });

    it("should update ready status successfully", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });
      // Do not override mockUpdate implementation here as it needs to return the chain
      
      const result = await toggleReady("game-123", true);

      expect(mockFrom).toHaveBeenCalledWith("game_players");
      expect(mockUpdate).toHaveBeenCalledWith({ is_ready: true });
      expect(mockEq).toHaveBeenCalledWith("game_id", "game-123");
      expect(mockEq).toHaveBeenCalledWith("player_id", "user-123");
      expect(result).toEqual({ success: true });
    });
  });

  describe("startGame", () => {
    it("should throw if user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: "Auth error",
      });

      await expect(startGame("game-123")).rejects.toThrow(
        "User must be authenticated",
      );
    });

    it("should throw if game not found", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });
      mockSingle.mockResolvedValue({ data: null, error: { message: "Not found" } });

      await expect(startGame("game-123")).rejects.toThrow("Game not found");
    });

    it("should throw if user is not host", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });
      mockSingle.mockResolvedValue({
        data: { host_id: "host-456" },
        error: null,
      });

      await expect(startGame("game-123")).rejects.toThrow(
        "Only the host can start the game",
      );
    });

    it("should throw if not all players are ready", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "host-123" } },
        error: null,
      });
      
      // Mock game (host check)
      mockSingle.mockResolvedValueOnce({
        data: { host_id: "host-123" },
        error: null,
      });

      // Mock players (ready check)
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockResolvedValue({
        data: [
            { is_ready: true },
            { is_ready: false }
        ],
        error: null
      });

      // We need to fix the mock chain for players query which is select().eq()
      // In the beforeEach, select() returns an object with eq.
      // But here we need eq() to return the data promise.
      // Let's adjust mockEq behavior for this specific call or generally.
      
      // Resetting mock implementation for this test to be more specific
      const mockEqForPlayers = vi.fn().mockResolvedValue({
         data: [{ is_ready: true }, { is_ready: false }],
         error: null
      });
      
      // Re-setup the chain for this specific test flow
      // 1. game fetch: from('games').select('host_id').eq('id', gameId).single()
      const mockSingleGame = vi.fn().mockResolvedValue({ data: { host_id: "host-123" }, error: null });
      const mockEqGame = vi.fn().mockReturnValue({ single: mockSingleGame });
      
      // 2. players fetch: from('game_players').select('is_ready').eq('game_id', gameId)
      // This returns a promise directly in the code: await supabase...eq(...)
      
      mockFrom.mockImplementation((table) => {
        if (table === 'games') {
            return {
                select: () => ({
                    eq: mockEqGame
                }),
                update: mockUpdate // for start game update
            }
        }
        if (table === 'game_players') {
            return {
                select: () => ({
                    eq: mockEqForPlayers
                })
            }
        }
        return {};
      });

      await expect(startGame("game-123")).rejects.toThrow("Not all players are ready");
    });

    it("should start game successfully if all conditions met", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "host-123" } },
        error: null,
      });
      
      const mockSingleGame = vi.fn().mockResolvedValue({ data: { host_id: "host-123" }, error: null });
      const mockEqGame = vi.fn().mockReturnValue({ single: mockSingleGame });
      
      const mockEqForPlayers = vi.fn().mockResolvedValue({
         data: [{ is_ready: true }, { is_ready: true }],
         error: null
      });

      const mockUpdateGame = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });

      mockFrom.mockImplementation((table) => {
        if (table === 'games') {
            return {
                select: () => ({
                    eq: mockEqGame
                }),
                update: mockUpdateGame
            }
        }
        if (table === 'game_players') {
            return {
                select: () => ({
                    eq: mockEqForPlayers
                })
            }
        }
        return {};
      });

      const result = await startGame("game-123");

      expect(mockUpdateGame).toHaveBeenCalledWith({
        status: "PLAYING",
        started_at: expect.any(String),
      });
      expect(result).toEqual({ success: true });
    });
  });
});

