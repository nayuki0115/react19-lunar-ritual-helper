/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/pages/Home";
import { createDefaultFormState } from "@/utils/formSpec";
import {
  PERSONAL_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  decodeSettingsStorage,
  encodePersonalStorage,
  encodeSettingsStorage,
} from "@/utils/storageSpec";

const setUrl = (query = "") => window.history.replaceState(null, "", `/${query}`);

describe("Home share links", () => {
  beforeEach(() => {
    localStorage.clear();
    setUrl();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
    setUrl();
  });

  it("restores and displays a valid link without overwriting local storage", () => {
    const storedForm = createDefaultFormState();
    storedForm.gender = "female";
    storedForm.solar.date = "1980-05-06";
    const personalRaw = encodePersonalStorage(storedForm);
    const settingsRaw = encodeSettingsStorage({ dayMode: "folk", detailsOpen: false });
    localStorage.setItem(PERSONAL_STORAGE_KEY, personalRaw);
    localStorage.setItem(SETTINGS_STORAGE_KEY, settingsRaw);
    setUrl("?v=1&bm=s&g=m&b=1993-01-20&tm=u&dm=civil");

    render(<Home />);

    expect(screen.getByText("此結果來自分享連結")).toBeTruthy();
    expect((screen.getByLabelText("國曆出生日期") as HTMLInputElement).value).toBe("1993-01-20");
    expect(localStorage.getItem(PERSONAL_STORAGE_KEY)).toBe(personalRaw);
    expect(localStorage.getItem(SETTINGS_STORAGE_KEY)).toBe(settingsRaw);
  });

  it("scrolls to shared results on mobile while respecting reduced motion", async () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    vi.mocked(window.matchMedia).mockImplementation((query) => ({
      matches: query === "(max-width: 1023px)" || query === "(prefers-reduced-motion: reduce)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as MediaQueryList);
    setUrl("?v=1&bm=s&g=m&b=1993-01-20&tm=u&dm=folk");

    render(<Home />);

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    });
  });

  it("keeps an invalid link until the user clears it", () => {
    setUrl("?v=1&bm=s&g=m&tm=u&dm=folk");
    render(<Home />);

    expect(screen.getByRole("alert").textContent).toContain("分享連結無效");
    expect(window.location.search).not.toBe("");

    fireEvent.click(screen.getByRole("button", { name: "清除此分享連結" }));
    expect(window.location.search).toBe("");
  });

  it("clears an old share URL after editing and regenerating the result", () => {
    setUrl("?v=1&bm=s&g=m&b=1993-01-20&tm=u&dm=folk");
    render(<Home />);

    fireEvent.change(screen.getByLabelText("國曆出生日期"), { target: { value: "1994-02-21" } });
    fireEvent.click(screen.getByRole("button", { name: "產生疏文資料" }));

    expect(window.location.search).toBe("");
    expect(screen.queryByText("此結果來自分享連結")).toBeNull();
  });

  it("shows the privacy dialog and copies a newly generated short URL", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<Home />);

    fireEvent.click(screen.getByRole("radio", { name: "男" }));
    fireEvent.change(screen.getByLabelText("國曆出生日期"), { target: { value: "1993-01-20" } });
    fireEvent.click(screen.getByRole("button", { name: "產生疏文資料" }));
    fireEvent.click(screen.getByRole("button", { name: "分享結果" }));

    expect(screen.getByRole("dialog", { name: "建立分享連結" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "同意並複製連結" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    const copied = new URL(writeText.mock.calls[0][0]);
    expect(copied.search).toBe("?v=1&bm=s&g=m&b=1993-01-20&tm=u&dm=folk");
    expect(screen.getByRole("status").textContent).toContain("分享連結已複製");
  });

  it("provides a manual copy field when Clipboard access fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    render(<Home />);

    fireEvent.click(screen.getByRole("radio", { name: "女" }));
    fireEvent.change(screen.getByLabelText("國曆出生日期"), { target: { value: "1993-01-20" } });
    fireEvent.click(screen.getByRole("button", { name: "產生疏文資料" }));
    fireEvent.click(screen.getByRole("button", { name: "分享結果" }));
    fireEvent.click(screen.getByRole("button", { name: "同意並複製連結" }));

    expect(await screen.findByRole("textbox", { name: "分享連結" })).toBeTruthy();
  });

  it("remembers the warning preference only with settings opt-in", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<Home />);

    fireEvent.click(screen.getByRole("checkbox", { name: /記住設定/ }));
    fireEvent.click(screen.getByRole("radio", { name: "男" }));
    fireEvent.change(screen.getByLabelText("國曆出生日期"), { target: { value: "1993-01-20" } });
    fireEvent.click(screen.getByRole("button", { name: "產生疏文資料" }));
    fireEvent.click(screen.getByRole("button", { name: "分享結果" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "下次分享時不再提醒" }));
    fireEvent.click(screen.getByRole("button", { name: "同意並複製連結" }));

    await waitFor(() => {
      expect(decodeSettingsStorage(localStorage.getItem(SETTINGS_STORAGE_KEY)!)).toMatchObject({
        skipShareWarning: true,
      });
    });
    fireEvent.click(screen.getByRole("button", { name: "分享結果" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
