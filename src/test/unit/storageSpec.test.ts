/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it } from "vitest";
import { createDefaultFormState } from "@/utils/formSpec";
import {
  LEGACY_STORAGE_KEY,
  PERSONAL_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  decodePersonalStorage,
  decodeSettingsStorage,
  encodePersonalStorage,
  encodeSettingsStorage,
  loadStoredPreferences,
} from "@/utils/storageSpec";

describe("storage codecs", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips both birth-mode drafts and the last birth mode", () => {
    const form = createDefaultFormState();
    form.gender = "female";
    form.birthMode = "lunar";
    form.solar = { date: "1992-03-04", timeMode: "exact", timeBranch: "", timeExact: "23:15" };
    form.lunar = { year: "1992", month: "2", day: "1", timeMode: "branch", timeBranch: "earlyZi", timeExact: "" };

    expect(decodePersonalStorage(encodePersonalStorage(form))).toEqual({ version: 1, form });
  });

  it("round-trips day-boundary and details preferences", () => {
    expect(decodeSettingsStorage(encodeSettingsStorage({ dayMode: "civil", detailsOpen: true }))).toEqual({
      version: 1,
      dayMode: "civil",
      detailsOpen: true,
    });
  });

  it.each([
    "not-json",
    JSON.stringify({ version: 2, form: createDefaultFormState() }),
    JSON.stringify({ version: 1, form: { gender: "invalid" } }),
  ])("rejects invalid personal payloads", (raw) => {
    expect(decodePersonalStorage(raw)).toBeNull();
  });

  it.each([
    "not-json",
    JSON.stringify({ version: 2, dayMode: "folk", detailsOpen: false }),
    JSON.stringify({ version: 1, dayMode: "invalid", detailsOpen: false }),
    JSON.stringify({ version: 1, dayMode: "folk", detailsOpen: "yes" }),
  ])("rejects invalid settings payloads", (raw) => {
    expect(decodeSettingsStorage(raw)).toBeNull();
  });

  it("deletes legacy and invalid values without creating new storage", () => {
    localStorage.setItem(LEGACY_STORAGE_KEY, "private legacy data");
    localStorage.setItem(PERSONAL_STORAGE_KEY, "invalid");
    localStorage.setItem(SETTINGS_STORAGE_KEY, "invalid");

    expect(loadStoredPreferences(localStorage)).toEqual({ personal: null, settings: null });
    expect(localStorage.length).toBe(0);
  });

  it("loads valid opt-in values independently", () => {
    const form = createDefaultFormState();
    localStorage.setItem(PERSONAL_STORAGE_KEY, encodePersonalStorage(form));

    expect(loadStoredPreferences(localStorage)).toEqual({
      personal: { version: 1, form },
      settings: null,
    });
  });

  it("loads settings without creating personal storage", () => {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      encodeSettingsStorage({ dayMode: "civil", detailsOpen: true }),
    );

    expect(loadStoredPreferences(localStorage)).toEqual({
      personal: null,
      settings: { version: 1, dayMode: "civil", detailsOpen: true },
    });
    expect(localStorage.getItem(PERSONAL_STORAGE_KEY)).toBeNull();
  });

  it("keeps one valid opt-in when the other payload is invalid", () => {
    const form = createDefaultFormState();
    localStorage.setItem(PERSONAL_STORAGE_KEY, encodePersonalStorage(form));
    localStorage.setItem(SETTINGS_STORAGE_KEY, "invalid");

    expect(loadStoredPreferences(localStorage)).toEqual({
      personal: { version: 1, form },
      settings: null,
    });
    expect(localStorage.getItem(PERSONAL_STORAGE_KEY)).not.toBeNull();
    expect(localStorage.getItem(SETTINGS_STORAGE_KEY)).toBeNull();
  });

  it("loads both valid opt-ins together", () => {
    const form = createDefaultFormState();
    localStorage.setItem(PERSONAL_STORAGE_KEY, encodePersonalStorage(form));
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      encodeSettingsStorage({ dayMode: "civil", detailsOpen: false }),
    );

    expect(loadStoredPreferences(localStorage)).toEqual({
      personal: { version: 1, form },
      settings: { version: 1, dayMode: "civil", detailsOpen: false },
    });
  });
});
