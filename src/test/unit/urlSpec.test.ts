import { describe, expect, it } from "vitest";
import { createDefaultFormState } from "@/utils/formSpec";
import { decodeShareParams, encodeShareParams } from "@/utils/urlSpec";

const now = new Date("2025-06-01T12:00:00+08:00");

describe("share URL codec", () => {
  it("encodes a solar form using only Schema v1 short parameters", () => {
    const form = createDefaultFormState();
    form.gender = "male";
    form.solar = { date: "1993-01-20", timeMode: "exact", timeBranch: "", timeExact: "02:30" };

    expect(encodeShareParams({ form, dayMode: "folk" }).toString()).toBe(
      "v=1&bm=s&g=m&b=1993-01-20&tm=ex&t=02%3A30&dm=folk",
    );
  });

  it("encodes only the active lunar draft", () => {
    const form = createDefaultFormState();
    form.gender = "female";
    form.birthMode = "lunar";
    form.solar.date = "1993-01-20";
    form.lunar = { year: "1992", month: "12", day: "8", timeMode: "branch", timeBranch: "lateZi", timeExact: "" };

    expect(encodeShareParams({ form, dayMode: "civil" }).toString()).toBe(
      "v=1&bm=l&g=f&ly=1992&lm=12&ld=8&tm=br&br=lateZi&dm=civil",
    );
  });

  it("decodes a valid Schema v1 link", () => {
    const decoded = decodeShareParams(new URLSearchParams(
      "v=1&bm=s&g=m&b=1993-01-20&tm=ex&t=02%3A30&dm=civil",
    ), now);

    expect(decoded.status).toBe("valid");
    if (decoded.status !== "valid") return;
    expect(decoded.dayMode).toBe("civil");
    expect(decoded.form).toMatchObject({
      gender: "male",
      birthMode: "solar",
      solar: { date: "1993-01-20", timeMode: "exact", timeExact: "02:30" },
    });
  });

  it("reads legacy long parameters and defaults the day mode", () => {
    const decoded = decodeShareParams(new URLSearchParams(
      "gender=female&birthDate=1993-01-20&birthTimeKind=shichen&shichen=chou",
    ), now);

    expect(decoded.status).toBe("valid");
    if (decoded.status !== "valid") return;
    expect(decoded.dayMode).toBe("folk");
    expect(decoded.form.solar).toMatchObject({ timeMode: "branch", timeBranch: "chou" });
  });

  it("prefers short parameters when both formats provide the same field", () => {
    const decoded = decodeShareParams(new URLSearchParams(
      "v=1&bm=s&g=m&gender=female&b=1993-01-20&birthDate=1994-02-21&tm=u&birthTimeKind=clock&clockTime=03%3A00&dm=folk",
    ), now);

    expect(decoded.status).toBe("valid");
    if (decoded.status !== "valid") return;
    expect(decoded.form.gender).toBe("male");
    expect(decoded.form.solar.date).toBe("1993-01-20");
    expect(decoded.form.solar.timeMode).toBe("unknown");
  });

  it.each([
    "v=2&bm=s&g=m&b=1993-01-20&tm=u&dm=folk",
    "v=1&bm=s&g=m&tm=u&dm=folk",
    "v=1&bm=l&g=m&ly=1992&lm=13&ld=8&tm=u&dm=folk",
    "v=1&bm=s&g=m&b=1993-01-20&tm=br&dm=folk",
    "v=1&bm=s&g=m&b=1993-01-20&tm=ex&t=25%3A00&dm=folk",
    "v=1&bm=s&g=m&b=1993-01-20&tm=u&dm=invalid",
  ])("rejects an invalid or incomplete share payload", (query) => {
    expect(decodeShareParams(new URLSearchParams(query), now)).toEqual({ status: "invalid" });
  });

  it("ignores unrelated query parameters", () => {
    expect(decodeShareParams(new URLSearchParams("utm_source=test"), now)).toEqual({ status: "none" });
  });
});
