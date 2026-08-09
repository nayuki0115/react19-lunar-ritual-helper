/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Home from "@/pages/Home";
import {
  PERSONAL_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  decodeSettingsStorage,
} from "@/utils/storageSpec";

describe("Home privacy storage controls", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(cleanup);

  it("starts with both opt-ins disabled and creates no storage", () => {
    render(<Home />);

    expect((screen.getByRole("checkbox", { name: /記住我的資料/ }) as HTMLInputElement).checked).toBe(false);
    expect((screen.getByRole("checkbox", { name: /記住設定/ }) as HTMLInputElement).checked).toBe(false);
    expect(localStorage.getItem(PERSONAL_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(SETTINGS_STORAGE_KEY)).toBeNull();
  });

  it("writes personal data on opt-in and removes it immediately on opt-out", () => {
    render(<Home />);
    const rememberData = screen.getByRole("checkbox", { name: /記住我的資料/ });

    fireEvent.click(rememberData);
    expect(localStorage.getItem(PERSONAL_STORAGE_KEY)).not.toBeNull();

    fireEvent.click(rememberData);
    expect(localStorage.getItem(PERSONAL_STORAGE_KEY)).toBeNull();
  });

  it("clears personal storage and disables its opt-in", () => {
    render(<Home />);
    const rememberData = screen.getByRole("checkbox", { name: /記住我的資料/ });

    fireEvent.click(rememberData);
    fireEvent.click(screen.getByRole("button", { name: "清除資料" }));

    expect((rememberData as HTMLInputElement).checked).toBe(false);
    expect(localStorage.getItem(PERSONAL_STORAGE_KEY)).toBeNull();
  });

  it("persists setting changes and removes them immediately on opt-out", async () => {
    render(<Home />);
    const rememberSettings = screen.getByRole("checkbox", { name: /記住設定/ });

    fireEvent.click(rememberSettings);
    fireEvent.click(screen.getByRole("button", { name: "民用 00:00" }));

    await waitFor(() => {
      expect(decodeSettingsStorage(localStorage.getItem(SETTINGS_STORAGE_KEY)!)).toMatchObject({
        dayMode: "civil",
      });
    });

    fireEvent.click(rememberSettings);
    expect(localStorage.getItem(SETTINGS_STORAGE_KEY)).toBeNull();
  });

  it("resets settings to defaults, disables opt-in and deletes storage", () => {
    render(<Home />);
    const rememberSettings = screen.getByRole("checkbox", { name: /記住設定/ });

    fireEvent.click(rememberSettings);
    fireEvent.click(screen.getByRole("button", { name: "民用 00:00" }));
    fireEvent.click(screen.getByRole("button", { name: "重設設定" }));

    expect((rememberSettings as HTMLInputElement).checked).toBe(false);
    expect(screen.getByRole("button", { name: "民俗 23:00" }).getAttribute("aria-pressed")).toBe("true");
    expect(localStorage.getItem(SETTINGS_STORAGE_KEY)).toBeNull();
  });
});
