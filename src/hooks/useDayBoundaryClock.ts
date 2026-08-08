import { useCallback, useEffect, useState } from "react";
import { getDayBoundaryDelay } from "@/utils/dayBoundary";
import type { DayMode } from "@/utils/lunar";

const TIMER_GRACE_MS = 50;

export const useDayBoundaryClock = () => {
  const [mode, setMode] = useState<DayMode>("folk");
  const [now, setNow] = useState(() => new Date());
  const refresh = useCallback(() => setNow(new Date()), []);
  const changeMode = useCallback((nextMode: DayMode) => {
    setMode(nextMode);
    refresh();
  }, [refresh]);

  useEffect(() => {
    const timer = window.setTimeout(
      refresh,
      getDayBoundaryDelay(now, mode) + TIMER_GRACE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [mode, now, refresh]);

  useEffect(() => {
    const handleFocus = () => refresh();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refresh]);

  return { mode, setMode: changeMode, now };
};
