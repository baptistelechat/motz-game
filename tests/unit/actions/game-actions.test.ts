import { joinGame, startGame, toggleReady } from "@/app/actions/game-actions";
import { createClient } from "@/lib/supabase/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Mock server dictionary
vi.mock("@/lib/game/server-dictionary", () => ({
  getServerDictionary: vi
    .fn()
    .mockResolvedValue(["TEST", "MOTZ", "VALIDE", "TARTE", "YETI"]),
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
  const mockOrder = vi.fn();
  const mockLimit = vi.fn();
  const mockDelete = vi.fn();

  // Helper to create a chainable mock that resolves to specific data
  // Must be defined here to access the spies
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createChain = (data: any = { error: null }) => {
    // We create a generic chain object first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chain: any = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      then: (resolve: any) => Promise.resolve(data).then(resolve),
    };

    // Assign the global spies to the chain methods
    // This ensures that when the code calls .eq(), it calls the global mockEq spy
    chain.eq = mockEq;
    chain.single = mockSingle;
    chain.update = mockUpdate;
    chain.select = mockSelect;
    chain.insert = mockInsert;
    chain.order = mockOrder;
    chain.limit = mockLimit;
    chain.delete = mockDelete;

    return chain;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default chain behavior
    // By default, all spies return a chain that resolves to { error: null }
    const defaultChain = createChain({ error: null });

    mockInsert.mockReturnValue(defaultChain);
    mockUpdate.mockReturnValue(defaultChain);
    mockSingle.mockReturnValue(defaultChain);
    mockEq.mockReturnValue(defaultChain);
    mockSelect.mockReturnValue(defaultChain);
    mockOrder.mockReturnValue(defaultChain);
    mockLimit.mockReturnValue(defaultChain);
    mockDelete.mockReturnValue(defaultChain);

    // mockFrom returns an object with methods that return the chain
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    });

    const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createClient as any).mockResolvedValue({
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom,
      rpc: mockRpc,
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

      // Override mockSingle to return error
      // Note: joinGame calls .eq().single()
      // eq() returns defaultChain (which uses mockSingle)
      // We need mockSingle to return a chain that resolves to error
      mockSingle.mockReturnValue(
        createChain({
          data: null,
          error: { message: "Not found" },
        }),
      );

      await expect(joinGame("CODE123")).rejects.toThrow("Partie introuvable.");
    });

    it("should throw if game is not in LOBBY status", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      // Mock finding game with wrong status
      mockSingle.mockReturnValue(
        createChain({
          data: { id: "game-123", status: "PLAYING" },
          error: null,
        }),
      );

      // The actual code checks if (gameError || !game) -> throw "Partie introuvable."
      // Then if (game.status !== "LOBBY") -> does nothing currently?
      // Let's verify what the code does.
      // If the code has an empty block for status check, this test will fail expecting a throw.
      // I'll update the test expectation based on current code behavior or fix the code.
      // Current code I read earlier:
      // if (game.status !== "LOBBY") {
      //   // Optional: Allow re-joining if already in?
      //   // For now, simple check.
      // }
      // It DOES NOT throw!
      // I should update the code to throw, or update the test.
      // Assuming I should FIX the code to prevent joining started games.
      // But for this test pass, I'll assume I should update the test to NOT expect throw if code allows it.
      // OR better, I should implement the check in game-actions.ts!
      // I will implement the check in game-actions.ts after fixing tests structure.
      // For now, I will expect it to NOT throw or just comment out this test case until I fix the code?
      // No, I'll make the test expect "Partie introuvable" if I change the logic?
      // Let's skip this test for a moment or better, Fix the code in game-actions.ts to throw!

      // For now, let's assume I will fix game-actions.ts to throw.
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
      // We need mockSingle to return different values on sequential calls?
      // joinGame calls:
      // 1. games.select.eq.single -> find game
      // 2. game_players.select.eq.eq.single -> check existing

      // Both use mockSingle!

      mockSingle
        .mockReturnValueOnce(
          createChain({
            data: { id: "game-123", status: "LOBBY" },
            error: null,
          }),
        ) // finding game
        .mockReturnValueOnce(createChain({ data: null, error: null })); // check existing player

      await joinGame("CODE123"); // It redirects, so void return

      expect(mockFrom).toHaveBeenCalledWith("games");
      expect(mockSelect).toHaveBeenCalledWith("id, status");
      expect(mockEq).toHaveBeenCalledWith("code", "CODE123");

      expect(mockFrom).toHaveBeenCalledWith("game_players");
      expect(mockInsert).toHaveBeenCalledWith({
        game_id: "game-123",
        player_id: "user-123",
      });
    });
  });

  describe("toggleReady", () => {
    it("should throw if user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: "Auth error",
      });

      await expect(toggleReady("game-123", true)).rejects.toThrow(
        "Unauthorized",
      );
    });

    it("should update ready status successfully", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      await toggleReady("game-123", true);

      expect(mockFrom).toHaveBeenCalledWith("game_players");
      expect(mockUpdate).toHaveBeenCalledWith({ is_ready: true });
      expect(mockEq).toHaveBeenCalledWith("game_id", "game-123");
      expect(mockEq).toHaveBeenCalledWith("player_id", "user-123");
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

      mockSingle.mockReturnValue(
        createChain({
          data: null,
          error: { message: "Not found" },
        }),
      );

      await expect(startGame("game-123")).rejects.toThrow("Game not found");
    });

    it("should throw if user is not host", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      mockSingle.mockReturnValue(
        createChain({
          data: { host_id: "host-456" },
          error: null,
        }),
      );

      await expect(startGame("game-123")).rejects.toThrow(
        "Only the host can start the game",
      );
    });

    it("should throw if not all players are ready", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "host-123" } },
        error: null,
      });

      // 1. game fetch (host check) -> uses .single()
      mockSingle.mockReturnValueOnce(
        createChain({
          data: { host_id: "host-123" },
          error: null,
        }),
      );

      // 2. players fetch (ready check) -> uses .eq().eq() and await (no single)
      // So we need the chain returned by the last .eq() to resolve to data
      // The chain is always the same object in our mock structure (methods return 'chain')
      // So we need mockEq to return a chain that resolves to the count.

      // But mockEq is called multiple times.
      // 1st call: eq('game_id')
      // 2nd call: eq('is_ready')

      // We want the result AFTER the 2nd call to resolve to data.
      // Since they return the SAME chain object, we can just make mockEq return a chain with data?
      // BUT `mockSingle` above sets the return of `mockSingle`.
      // `mockEq` returns `defaultChain` by default.

      // We need `mockEq` to return `playersChain` for this test.
      const playersChain = createChain({ count: 1 });

      // But wait, `startGame` calls `select().eq().eq()`.
      // It ALSO calls `games.select().eq().single()`.
      // So `mockEq` is called for the game fetch too!

      // Calls sequence:
      // 1. games.select
      // 2. games.eq (gameId) -> returns chain that has .single()
      // 3. chain.single() -> mocked above to return host-123

      // 4. players.select
      // 5. players.eq (gameId)
      // 6. players.eq (isReady)
      // 7. await result

      // If we change mockEq return value, it affects step 2 as well.
      // But step 2 calls .single() on the result of eq.
      // If step 2 returns `playersChain`, `playersChain.single()` calls `mockSingle`.
      // And `mockSingle` is mocked to return host-123.
      // So step 3 is fine regardless of what chain eq returns, AS LONG AS the chain has .single = mockSingle.

      // So if we make `mockEq` return `playersChain`, then:
      // Step 2 returns `playersChain`.
      // Step 3 calls `playersChain.single()`. `mockSingle` returns chain with host-123. OK.

      // Step 5 returns `playersChain`.
      // Step 6 returns `playersChain`.
      // Step 7 awaits `playersChain`. `playersChain` resolves to count: 1. OK.

      // So yes, we can set mockEq to return playersChain!
      mockEq.mockReturnValue(playersChain);

      await expect(startGame("game-123")).rejects.toThrow(
        "Not all players are ready",
      );
    });

    it("should start game successfully if all conditions met", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "host-123" } },
        error: null,
      });

      // Game fetch
      mockSingle.mockReturnValueOnce(
        createChain({
          data: { host_id: "host-123", code: "CODE123" },
          error: null,
        }),
      );

      // Players fetch (all ready)
      const playersChain = createChain({ count: 0 });
      mockEq.mockReturnValue(playersChain);

      // Update game
      // update().eq()
      // mockUpdate returns defaultChain.
      // defaultChain.eq returns defaultChain.
      // defaultChain resolves to error: null. OK.

      await startGame("game-123");

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "PLAYING",
        }),
      );
      
      // Verify round creation (replaces RPC check)
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          game_id: "game-123",
          status: "PLAYING",
          round_number: 1,
        })
      );
    });
  });
});
