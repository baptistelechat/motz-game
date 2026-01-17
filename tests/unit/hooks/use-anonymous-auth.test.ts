import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAnonymousAuth } from "@/hooks/use-anonymous-auth";
import { createClient } from "@/lib/supabase/client";

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

  it("should attempt to sign in anonymously if no user is present", async () => {
    // Mock getUser to return no user
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockSignInAnonymously.mockResolvedValue({ data: { user: { id: "123" } }, error: null });

    renderHook(() => useAnonymousAuth());

    await waitFor(() => {
      expect(mockSignInAnonymously).toHaveBeenCalled();
    });
  });

  it("should NOT sign in if user is already present", async () => {
    // Mock getUser to return a user
    mockGetUser.mockResolvedValue({ data: { user: { id: "existing-user" } }, error: null });

    renderHook(() => useAnonymousAuth());

    // Wait a bit to ensure effect runs
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockSignInAnonymously).not.toHaveBeenCalled();
  });

  it("should return loading state initially", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockSignInAnonymously.mockResolvedValue({ data: { user: { id: "123" } }, error: null });

    const { result } = renderHook(() => useAnonymousAuth());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
  
  it("should return the user after successful sign in", async () => {
     mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
     const mockUser = { id: "new-anon-user" };
     mockSignInAnonymously.mockResolvedValue({ data: { user: mockUser }, error: null });
     
     const { result } = renderHook(() => useAnonymousAuth());
     
     await waitFor(() => {
         expect(result.current.user).toEqual(mockUser);
     });
  });
});
