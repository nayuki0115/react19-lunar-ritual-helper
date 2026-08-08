/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDayBoundaryClock } from "@/hooks/useDayBoundaryClock";

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value: state,
  });
};

describe("useDayBoundaryClock", () => {
  it("defaults to folk mode and refreshes at the 23:00 boundary", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-28T22:59:59.950+08:00"));
    const { result } = renderHook(() => useDayBoundaryClock());

    expect(result.current.mode).toBe("folk");
    expect(result.current.now.toISOString()).toBe("2025-01-28T14:59:59.950Z");

    act(() => vi.advanceTimersByTime(100));

    expect(result.current.now.toISOString()).toBe("2025-01-28T15:00:00.050Z");
    expect(vi.getTimerCount()).toBe(1);
  });

  it("refreshes immediately and reschedules when the mode changes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-28T22:50:00+08:00"));
    const { result } = renderHook(() => useDayBoundaryClock());

    vi.setSystemTime(new Date("2025-01-28T23:10:00+08:00"));
    act(() => result.current.setMode("civil"));

    expect(result.current.mode).toBe("civil");
    expect(result.current.now.toISOString()).toBe("2025-01-28T15:10:00.000Z");
    expect(vi.getTimerCount()).toBe(1);

    vi.setSystemTime(new Date("2025-01-28T23:59:59.950+08:00"));
    act(() => window.dispatchEvent(new Event("focus")));
    act(() => vi.advanceTimersByTime(100));

    expect(result.current.now.toISOString()).toBe("2025-01-28T16:00:00.050Z");
  });

  it("corrects on focus and only on visible visibility changes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-28T22:00:00+08:00"));
    const { result } = renderHook(() => useDayBoundaryClock());

    vi.setSystemTime(new Date("2025-01-28T22:30:00+08:00"));
    act(() => window.dispatchEvent(new Event("focus")));
    expect(result.current.now.toISOString()).toBe("2025-01-28T14:30:00.000Z");

    vi.setSystemTime(new Date("2025-01-28T22:40:00+08:00"));
    setVisibility("hidden");
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(result.current.now.toISOString()).toBe("2025-01-28T14:30:00.000Z");

    setVisibility("visible");
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(result.current.now.toISOString()).toBe("2025-01-28T14:40:00.000Z");
  });

  it("clears its timer and event listeners on unmount", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-28T22:00:00+08:00"));
    const windowRemoveSpy = vi.spyOn(window, "removeEventListener");
    const documentRemoveSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderHook(() => useDayBoundaryClock());

    expect(vi.getTimerCount()).toBe(1);
    unmount();

    expect(vi.getTimerCount()).toBe(0);
    expect(windowRemoveSpy).toHaveBeenCalledWith("focus", expect.any(Function));
    expect(documentRemoveSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
  });
});
