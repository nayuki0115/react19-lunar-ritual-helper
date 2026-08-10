/** @vitest-environment jsdom */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import ModalDrawer from "@/components/ui/ModalDrawer";

const Example = ({ onClose = vi.fn() }: { onClose?: () => void }) => {
  const [open, setOpen] = useState(false);
  const close = () => {
    onClose();
    setOpen(false);
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>開啟</button>
      <ModalDrawer
        open={open}
        title="測試對話框"
        description="測試焦點管理"
        onClose={close}
        actions={<><button onClick={close}>取消</button><button>確認</button></>}
      >
        <input aria-label="內容欄位" />
      </ModalDrawer>
    </>
  );
};

describe("ModalDrawer accessibility", () => {
  it("locks background interaction and moves focus into the dialog", async () => {
    const root = document.createElement("div");
    root.id = "root";
    document.body.append(root);
    const view = render(<Example />, { container: root });

    fireEvent.click(view.getByRole("button", { name: "開啟" }));
    await act(() => new Promise(requestAnimationFrame));

    expect(document.body.style.overflow).toBe("hidden");
    expect(root.inert).toBe(true);
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(document.activeElement?.textContent).toBe("取消");

    view.unmount();
    root.remove();
  });

  it("traps Tab focus, closes with Escape, and restores focus", async () => {
    const onClose = vi.fn();
    const root = document.createElement("div");
    root.id = "root";
    document.body.append(root);
    const view = render(<Example onClose={onClose} />, { container: root });
    const opener = view.getByRole("button", { name: "開啟" });

    opener.focus();
    fireEvent.click(opener);
    await act(() => new Promise(requestAnimationFrame));
    const dialog = screen.getByRole("dialog");
    const input = screen.getByRole("textbox", { name: "內容欄位" });
    const confirm = screen.getByRole("button", { name: "確認" });

    confirm.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(input);

    input.focus();
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(confirm);

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(opener);
    expect(document.body.style.overflow).toBe("");
    expect(root.getAttribute("aria-hidden")).toBeNull();

    view.unmount();
    root.remove();
  });
});
