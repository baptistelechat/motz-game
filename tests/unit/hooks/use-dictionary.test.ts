import { resetDictionaryCache, useDictionary } from "@/hooks/use-dictionary";
import { renderHook, waitFor } from "@testing-library/react";
import { BloomFilter } from "bloom-filters";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe("useDictionary", () => {
  beforeEach(() => {
    fetchMock.mockClear();
    resetDictionaryCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetDictionaryCache();
  });

  it("should initialize with loading state", () => {
    // Create a minimal valid bloom filter JSON
    const filter = BloomFilter.create(10, 0.01);
    filter.add("MOT");
    filter.add("TEST");
    const filterJson = filter.saveAsJSON();

    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(filterJson),
    } as Response);

    const { result } = renderHook(() => useDictionary());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isReady).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should load dictionary successfully", async () => {
    const filter = BloomFilter.create(10, 0.01);
    filter.add("MOT");
    filter.add("TEST");
    filter.add("JEU");
    const filterJson = filter.saveAsJSON();

    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(filterJson),
    } as Response);

    const { result } = renderHook(() => useDictionary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isReady).toBe(true);
    expect(result.current.has("MOT")).toBe(true);
    expect(result.current.has("mot")).toBe(true); // Case insensitive
    expect(result.current.has("JEU")).toBe(true);
    expect(result.current.has("INVALIDE")).toBe(false);
  });

  it("should handle fetch errors", async () => {
    fetchMock.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useDictionary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isReady).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it("should handle failed response (404)", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const { result } = renderHook(() => useDictionary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isReady).toBe(false);
    expect(result.current.error).toBeTruthy();
  });
});
