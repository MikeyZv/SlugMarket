import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ShareButton from "../ShareButton";

const TITLE = "Vintage Bike";

// Helpers to install/remove the optional navigator APIs the component probes for.
function setShare(fn: ((data: ShareData) => Promise<void>) | undefined) {
  if (fn) {
    Object.defineProperty(navigator, "share", { value: fn, configurable: true, writable: true });
  } else {
    delete (navigator as { share?: unknown }).share;
  }
}

function setClipboard(writeText: ((text: string) => Promise<void>) | undefined) {
  Object.defineProperty(navigator, "clipboard", {
    value: writeText ? { writeText } : undefined,
    configurable: true,
    writable: true,
  });
}

describe("ShareButton", () => {
  beforeEach(() => {
    setShare(undefined);
    setClipboard(vi.fn().mockResolvedValue(undefined));
  });

  afterEach(() => {
    setShare(undefined);
    vi.useRealTimers();
  });

  it("renders a Share button by default", () => {
    render(<ShareButton title={TITLE} />);
    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
  });

  it("applies a custom className to the button", () => {
    render(<ShareButton title={TITLE} className="my-share-class" />);
    expect(screen.getByRole("button")).toHaveClass("my-share-class");
  });

  // --- Web Share API path ---

  it("uses the Web Share API with the title and current URL when available", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    setShare(share);
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);

    render(<ShareButton title={TITLE} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });

    expect(share).toHaveBeenCalledWith({ title: TITLE, url: window.location.href });
    expect(writeText).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
  });

  it("falls back to copying the URL when the share sheet is cancelled", async () => {
    setShare(vi.fn().mockRejectedValue(new Error("cancelled")));
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);

    render(<ShareButton title={TITLE} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(await screen.findByRole("button", { name: /copied/i })).toBeInTheDocument();
  });

  // --- Clipboard fallback path ---

  it("copies the URL and shows 'Copied!' when the Web Share API is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);

    render(<ShareButton title={TITLE} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();
  });

  it("reverts from 'Copied!' back to 'Share' after 2 seconds", async () => {
    vi.useFakeTimers();
    setClipboard(vi.fn().mockResolvedValue(undefined));

    render(<ShareButton title={TITLE} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });
    expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
  });

  it("does not show 'Copied!' when the clipboard write fails", async () => {
    setClipboard(vi.fn().mockRejectedValue(new Error("insecure context")));

    render(<ShareButton title={TITLE} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });

    expect(screen.queryByRole("button", { name: /copied/i })).toBeNull();
    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
  });
});
