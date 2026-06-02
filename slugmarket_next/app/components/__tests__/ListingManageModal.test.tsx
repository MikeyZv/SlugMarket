import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ListingManageModal from "../ListingManageModal";
import type { Listing } from "@/lib/types";

// vi.hoisted ensures these are available inside the vi.mock factory below
const { mockLimit, mockUpdateEq, mockUpdate, mockRefresh } = vi.hoisted(() => ({
  mockLimit: vi.fn(),
  mockUpdateEq: vi.fn(),
  mockUpdate: vi.fn(),
  mockRefresh: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock("../DeleteButton", () => ({
  default: ({ className }: { className?: string }) => (
    <button type="button" className={className}>Delete</button>
  ),
}));

// Route profile lookups to mockLimit; route listing updates to mockUpdate
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: (table: string) => {
      if (table === "profiles") {
        return { select: () => ({ ilike: () => ({ limit: mockLimit }) }) };
      }
      return { update: mockUpdate };
    },
  },
}));

const baseListing: Listing = {
  id: "listing-1",
  title: "Blue Bike",
  price: 120,
  description: "Good condition bike",
  condition: "Used",
  image_urls: ["/bike.jpg"],
  seller_id: "seller-1",
  sold: false,
  buyer_id: null,
  created_at: "2024-01-01T00:00:00Z",
};

describe("ListingManageModal", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    onClose.mockClear();
    mockRefresh.mockClear();
    mockLimit.mockResolvedValue({ data: [], error: null });
    mockUpdateEq.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: mockUpdateEq });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Initial state ---

  it("renders 'Manage Listing' header", () => {
    render(<ListingManageModal listing={baseListing} onClose={onClose} />);
    expect(screen.getByText("Manage Listing")).toBeInTheDocument();
  });

  it("shows listing title and price", () => {
    render(<ListingManageModal listing={baseListing} onClose={onClose} />);
    expect(screen.getByText("Blue Bike")).toBeInTheDocument();
    expect(screen.getByText("$120")).toBeInTheDocument();
  });

  it("shows 'Mark as sold', 'Edit listing', and 'Delete' actions when listing is not sold", () => {
    render(<ListingManageModal listing={baseListing} onClose={onClose} />);
    expect(screen.getByRole("button", { name: /mark as sold/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /edit listing/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("shows 'Sold' badge and disables the mark-as-sold button when listing is already sold", () => {
    render(<ListingManageModal listing={{ ...baseListing, sold: true }} onClose={onClose} />);
    expect(screen.getByText("Sold")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /already sold/i })).toBeDisabled();
  });

  it("calls onClose when the close (✕) button is clicked", () => {
    render(<ListingManageModal listing={baseListing} onClose={onClose} />);
    fireEvent.click(screen.getByText("✕"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the backdrop is clicked", () => {
    const { container } = render(<ListingManageModal listing={baseListing} onClose={onClose} />);
    fireEvent.click(container.firstChild as Element);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // --- Transition to confirm-sale step ---

  it("transitions to 'Confirm Sale' step when 'Mark as sold' is clicked", () => {
    render(<ListingManageModal listing={baseListing} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /mark as sold/i }));
    expect(screen.getByText("Confirm Sale")).toBeInTheDocument();
    expect(screen.getByText("Who did you sell this to?")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search by username…")).toBeInTheDocument();
  });

  it("shows 'Confirm sale' and 'Cancel' buttons in the confirm-sale step", () => {
    render(<ListingManageModal listing={baseListing} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /mark as sold/i }));
    expect(screen.getByRole("button", { name: /^confirm sale$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("cancel button returns to the normal actions view", () => {
    render(<ListingManageModal listing={baseListing} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /mark as sold/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.getByText("Manage Listing")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mark as sold/i })).toBeInTheDocument();
  });

  // --- Username autocomplete ---
  // Uses fake timers to control the 200ms debounce.
  // act(async) flushes React state + microtasks so we can assert synchronously after.

  it("shows username suggestions after the debounce fires", async () => {
    mockLimit.mockResolvedValue({ data: [{ id: "buyer-1", username: "janedoe" }], error: null });

    render(<ListingManageModal listing={baseListing} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /mark as sold/i }));
    fireEvent.change(screen.getByPlaceholderText("Search by username…"), { target: { value: "jane" } });

    await act(async () => { vi.advanceTimersByTime(250); });

    expect(screen.getByRole("button", { name: "@janedoe" })).toBeInTheDocument();
  });

  it("does not show suggestions before the debounce delay has elapsed", async () => {
    mockLimit.mockResolvedValue({ data: [{ id: "buyer-1", username: "janedoe" }], error: null });

    render(<ListingManageModal listing={baseListing} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /mark as sold/i }));
    fireEvent.change(screen.getByPlaceholderText("Search by username…"), { target: { value: "jane" } });

    await act(async () => { vi.advanceTimersByTime(100); });

    expect(screen.queryByRole("button", { name: "@janedoe" })).toBeNull();
  });

  it("selecting a suggestion updates the input and confirm button label", async () => {
    mockLimit.mockResolvedValue({ data: [{ id: "buyer-1", username: "janedoe" }], error: null });

    render(<ListingManageModal listing={baseListing} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /mark as sold/i }));
    fireEvent.change(screen.getByPlaceholderText("Search by username…"), { target: { value: "jane" } });

    await act(async () => { vi.advanceTimersByTime(250); });

    fireEvent.mouseDown(screen.getByRole("button", { name: "@janedoe" }));

    const input = screen.getByPlaceholderText("Search by username…") as HTMLInputElement;
    expect(input.value).toBe("@janedoe");
    expect(screen.getByRole("button", { name: /confirm sale to @janedoe/i })).toBeInTheDocument();
  });

  it("clears the selected buyer when the user types again after a selection", async () => {
    mockLimit.mockResolvedValue({ data: [{ id: "buyer-1", username: "janedoe" }], error: null });

    render(<ListingManageModal listing={baseListing} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /mark as sold/i }));
    fireEvent.change(screen.getByPlaceholderText("Search by username…"), { target: { value: "jane" } });

    await act(async () => { vi.advanceTimersByTime(250); });

    fireEvent.mouseDown(screen.getByRole("button", { name: "@janedoe" }));
    fireEvent.change(screen.getByPlaceholderText("Search by username…"), { target: { value: "j" } });

    expect(screen.getByRole("button", { name: /^confirm sale$/i })).toBeInTheDocument();
  });

  // --- Confirm sale ---
  // act(async) flushes the async supabase call so we can assert synchronously after.

  it("confirms the sale without a buyer and calls update with buyer_id: null", async () => {
    render(<ListingManageModal listing={baseListing} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /mark as sold/i }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^confirm sale$/i }));
    });

    expect(mockUpdate).toHaveBeenCalledWith({ sold: true, buyer_id: null });
    expect(mockUpdateEq).toHaveBeenCalledWith("id", "listing-1");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("confirms the sale with a selected buyer and passes buyer_id", async () => {
    mockLimit.mockResolvedValue({ data: [{ id: "buyer-1", username: "janedoe" }], error: null });

    render(<ListingManageModal listing={baseListing} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /mark as sold/i }));
    fireEvent.change(screen.getByPlaceholderText("Search by username…"), { target: { value: "jane" } });

    await act(async () => { vi.advanceTimersByTime(250); });

    fireEvent.mouseDown(screen.getByRole("button", { name: "@janedoe" }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /confirm sale to @janedoe/i }));
    });

    expect(mockUpdate).toHaveBeenCalledWith({ sold: true, buyer_id: "buyer-1" });
  });

  it("shows an error message when the sale update fails", async () => {
    mockUpdateEq.mockResolvedValue({ error: { message: "Permission denied" } });

    render(<ListingManageModal listing={baseListing} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /mark as sold/i }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^confirm sale$/i }));
    });

    expect(screen.getByText("Permission denied")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("shows 'Saving...' while the update is in progress", async () => {
    mockUpdateEq.mockReturnValue(new Promise(() => {})); // never resolves

    render(<ListingManageModal listing={baseListing} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /mark as sold/i }));

    // setSaving(true) fires synchronously before the awaited supabase call
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^confirm sale$/i }));
    });

    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });
});
