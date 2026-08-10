import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui";

type Props = {
  children: ReactNode;
};

const AppShell = ({ children }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement | null>(null);
  const location = useLocation();

  const navItems = useMemo(
    () => [
      { to: "/", label: "工具" },
      // { to: "/result", label: "結果" },
    ],
    []
  );

  const closeMenu = () => setMenuOpen(false);

  // Close on route change (切頁自動收起)
  useEffect(() => {
    // Route changes are the event that resets this local UI state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    closeMenu();
  }, [location.pathname]);

  // Close when viewport becomes >= md (resize 自動收起)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handleChange = () => {
      if (mq.matches) closeMenu();
    };

    // Initial sync (in case it renders open then resize)
    handleChange();

    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // Esc close + click-away close (只在 menuOpen 時掛載監聽)
  useEffect(() => {
    if (!menuOpen) return;

    firstMobileLinkRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
        buttonRef.current?.focus();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      // Click inside menu panel -> do nothing
      if (panelRef.current?.contains(target)) return;

      // Click on toggle button -> do nothing (讓 button 自己切換)
      if (buttonRef.current?.contains(target)) return;

      // Otherwise -> click-away close
      closeMenu();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-(--color-border) bg-(--color-shell)">

        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="font-semibold tracking-tight text-(--color-text-primary)"
          >
            Lunar Ritual Helper｜疏文助手
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-6 text-sm" aria-label="主要導覽">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "transition",
                    isActive
                      ? "underline underline-offset-4 text-(--color-text-primary)"
                      : "text-(--color-text-secondary) hover:text-(--color-text-primary) hover:underline hover:underline-offset-4",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <Button
            ref={buttonRef}
            className="min-h-10 rounded-lg px-3 py-2 md:hidden"
            aria-label={menuOpen ? "關閉導覽選單" : "開啟導覽選單"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </Button>
        </div>

        {/* Mobile overlay + menu */}
        {menuOpen ? (
          <>
            {/* Overlay：點外面可關 */}
            <div
              className="fixed inset-0 z-40 bg-(--color-bg)/70 md:hidden"
              aria-hidden="true"
            />

            {/* Menu panel */}
            <div
              id="mobile-menu"
              ref={panelRef}
              className="md:hidden border-t border-(--color-bg-muted) bg-(--color-surface) relative z-50"
            >
              <nav className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2 text-sm" aria-label="行動版主要導覽">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    ref={item === navItems[0] ? firstMobileLinkRef : undefined}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        "rounded-lg px-3 py-2 transition border border-transparent",
                        isActive
                          ? "bg-(--color-surface-muted) text-(--color-text-primary) border-(--color-bg-muted)"
                          : "text-(--color-text-secondary) hover:bg-(--color-surface-muted) hover:text-(--color-text-primary)",
                      ].join(" ")
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </>
        ) : null}
      </header>

      <main className="min-h-screen bg-(--color-bg)">{children}</main>

      <footer className="border-t border-(--color-border) bg-(--color-shell)">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-(--color-text-secondary)">
          © {new Date().getFullYear()} <a href="https://github.com/nayuki0115" target="_blank" rel="noreferrer"> Annie Wu · Author info（另開新視窗）</a>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
