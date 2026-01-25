import { usePlayerProfile } from "@/hooks/use-player-profile";
import { createClient } from "@/lib/supabase/client";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

// Mock dependencies
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/use-anonymous-auth", () => ({
  useAnonymousAuth: vi.fn(),
}));

import { useAuth } from "@/components/providers/auth-provider";

describe("usePlayerProfile", () => {
  const mockSelect = vi.fn();
  const mockSingle = vi.fn();
  const mockUpsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useAuth
    (useAuth as Mock).mockReturnValue({
      user: null,
      isLoading: false,
    });

    // Setup Supabase mock chain
    mockSingle.mockResolvedValue({ data: null, error: null });
    mockSelect.mockReturnValue({ single: mockSingle });
    mockUpsert.mockResolvedValue({ data: null, error: null });
    mockUpdate.mockResolvedValue({ data: null, error: null });
    // For select: from('players').select('*').eq('id', userId).single()
    // For upsert: from('players').upsert({...}).select()

    // We need to handle the chain properly.
    // select('*') returns an object with eq() which returns single()
    const selectChain = { eq: vi.fn().mockReturnValue({ single: mockSingle }) };
    mockSelect.mockReturnValue(selectChain);

    // upsert() returns select() (usually to get returned data) or just promise
    const upsertChain = {
      select: vi.fn().mockReturnValue({ single: mockSingle }),
    };
    mockUpsert.mockReturnValue(upsertChain);

    // update() returns eq() then promise
    const updateChain = {
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockUpdate.mockReturnValue(updateChain);

    mockFrom.mockReturnValue({
      select: mockSelect,
      upsert: mockUpsert,
      update: mockUpdate,
    });

    (createClient as Mock).mockReturnValue({
      from: mockFrom,
    });

    // Default auth state: no user
    (useAuth as Mock).mockReturnValue({
      user: null,
      isLoading: false,
    });
  });

  it("should do nothing if no user", async () => {
    const { result } = renderHook(() => usePlayerProfile());
    expect(result.current.profile).toBeNull();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("should fetch profile when user exists", async () => {
    (useAuth as Mock).mockReturnValue({
      user: { id: "user-123" },
      isLoading: false,
    });

    const mockProfile = {
      id: "user-123",
      pseudo: "TestUser",
      avatar_config: { animal: "Fox", color: "Green" },
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
    };

    mockSingle.mockResolvedValue({ data: mockProfile, error: null });

    const { result } = renderHook(() => usePlayerProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFrom).toHaveBeenCalledWith("players");
    expect(mockSelect).toHaveBeenCalledWith(
      "id, pseudo, avatar_config, updated_at, created_at, last_sign_in_at",
    );
    expect(result.current.profile).toEqual(mockProfile);

    // Check background update
    expect(mockUpdate).toHaveBeenCalledWith({
      last_sign_in_at: expect.any(String),
    });
  });

  it("should update profile", async () => {
    (useAuth as Mock).mockReturnValue({
      user: { id: "user-123" },
      isLoading: false,
    });

    // Mock initial fetch empty to avoid complexity
    mockSingle.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => usePlayerProfile());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const newProfile = {
      pseudo: "NewName",
      avatar_config: { animal: "Bear", color: "Red" },
    };

    // Update mock for upsert return
    const updatedRecord = {
      id: "user-123",
      ...newProfile,
      updated_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
    };
    mockSingle.mockResolvedValue({ data: updatedRecord, error: null });

    await act(async () => {
      await result.current.updateProfile(newProfile);
    });

    expect(mockFrom).toHaveBeenCalledWith("players");
    expect(mockUpsert).toHaveBeenCalledWith({
      id: "user-123",
      ...newProfile,
      updated_at: expect.any(String),
      last_sign_in_at: expect.any(String),
    });
  });
});
