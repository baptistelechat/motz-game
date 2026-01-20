import { useAnonymousAuth } from "@/hooks/use-anonymous-auth";
import { createClient } from "@/lib/supabase/client";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

describe("useAnonymousAuth", () => {
  const mockSignInAnonymously = vi.fn();
  const mockGetUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createClient as any).mockReturnValue({
      auth: {
        getUser: mockGetUser,
        signInAnonymously: mockSignInAnonymously,
      },
    });
  });

  it("should attempt to sign in anonymously when signIn is called with a token", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const mockUser = { id: "new-anon-user" };
    mockSignInAnonymously.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { result } = renderHook(() => useAnonymousAuth());

    // Initially loading state might be true due to getUser check, or false if that finishes quickly.
    // We assume the hook checks for existing user on mount.

    await act(async () => {
      await result.current.signIn("valid-captcha-token");
    });

    expect(mockSignInAnonymously).toHaveBeenCalledWith({
      options: { captchaToken: "valid-captcha-token" },
    });
    expect(result.current.user).toEqual(mockUser);
  });

  it("should NOT sign in automatically if user is not present", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const { result } = renderHook(() => useAnonymousAuth());

    // Wait for initial effect to settle
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockSignInAnonymously).not.toHaveBeenCalled();
  });

  it("should NOT sign in if user is already present", async () => {
    // Mock getUser to return a user
    mockGetUser.mockResolvedValue({
      data: { user: { id: "existing-user" } },
      error: null,
    });

    const { result } = renderHook(() => useAnonymousAuth());

    // Wait for loading to finish to ensure effect has run
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockSignInAnonymously).not.toHaveBeenCalled();
    expect(result.current.user).toEqual({ id: "existing-user" });
  });

  it("should return loading state initially", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    // mockSignInAnonymously won't be called automatically, so this mock is irrelevant for this test's initial state check
    // but we keep it valid just in case.
    mockSignInAnonymously.mockResolvedValue({
      data: { user: { id: "123" } },
      error: null,
    });

    const { result } = renderHook(() => useAnonymousAuth());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
