import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReportButton from "../ReportButton";
import * as AuthProvider from "../AuthProvider";

const { mockPush, mockInsert } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockInsert: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("../AuthProvider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({ insert: mockInsert }),
  },
}));

const SELLER_ID = "seller-1";
const LISTING_ID = "listing-1";
const REPORTER_ID = "reporter-1";

function setUser(user: { id: string } | null) {
  vi.mocked(AuthProvider.useAuth).mockReturnValue({
    user,
  } as ReturnType<typeof AuthProvider.useAuth>);
}

function renderAsReporter() {
  setUser({ id: REPORTER_ID });
  return render(<ReportButton listingId={LISTING_ID} sellerId={SELLER_ID} />);
}

/** Opens the report modal as a logged-in non-seller. */
function openModal() {
  renderAsReporter();
  fireEvent.click(screen.getByRole("button", { name: /report/i }));
}

describe("ReportButton", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockInsert.mockClear();
    mockInsert.mockResolvedValue({ error: null });
  });

  // --- Visibility ---

  it("renders nothing when the current user is the seller", () => {
    setUser({ id: SELLER_ID });
    render(<ReportButton listingId={LISTING_ID} sellerId={SELLER_ID} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders the Report button for a non-seller user", () => {
    renderAsReporter();
    expect(screen.getByRole("button", { name: /report/i })).toBeInTheDocument();
  });

  it("renders the Report button when there is no logged-in user", () => {
    setUser(null);
    render(<ReportButton listingId={LISTING_ID} sellerId={SELLER_ID} />);
    expect(screen.getByRole("button", { name: /report/i })).toBeInTheDocument();
  });

  // --- Auth gating on the trigger ---

  it("redirects to /signin instead of opening the modal when no user is logged in", () => {
    setUser(null);
    render(<ReportButton listingId={LISTING_ID} sellerId={SELLER_ID} />);
    fireEvent.click(screen.getByRole("button", { name: /report/i }));
    expect(mockPush).toHaveBeenCalledWith("/signin");
    expect(screen.queryByText("Report listing")).toBeNull();
  });

  it("opens the report modal when a logged-in user clicks Report", () => {
    openModal();
    expect(screen.getByRole("heading", { name: /report listing/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit report/i })).toBeInTheDocument();
  });

  // --- Modal close ---

  it("closes the modal when the × button is clicked", () => {
    openModal();
    fireEvent.click(screen.getByRole("button", { name: "×" }));
    expect(screen.queryByRole("heading", { name: /report listing/i })).toBeNull();
  });

  // --- Reason dropdown ---

  it("defaults the reason to the first option", () => {
    openModal();
    expect(screen.getByText("Prohibited or illegal item")).toBeInTheDocument();
  });

  it("selects a different reason from the dropdown", () => {
    openModal();
    // Open the custom dropdown.
    fireEvent.click(screen.getByText("Prohibited or illegal item"));
    // Pick a different reason.
    fireEvent.click(screen.getByText("Spam or scam"));
    expect(screen.getByText("Spam or scam")).toBeInTheDocument();
  });

  // --- Submission ---

  it("inserts a report with the default reason and null details", async () => {
    openModal();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /submit report/i }));
    });
    expect(mockInsert).toHaveBeenCalledWith({
      listing_id: LISTING_ID,
      seller_id: SELLER_ID,
      reporter_id: REPORTER_ID,
      reason: "Prohibited or illegal item",
      details: null,
    });
  });

  it("includes the chosen reason and trimmed details in the insert", async () => {
    openModal();
    fireEvent.click(screen.getByText("Prohibited or illegal item"));
    fireEvent.click(screen.getByText("Spam or scam"));
    fireEvent.change(screen.getByPlaceholderText(/additional context/i), {
      target: { value: "  this is a scam  " },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /submit report/i }));
    });
    expect(mockInsert).toHaveBeenCalledWith({
      listing_id: LISTING_ID,
      seller_id: SELLER_ID,
      reporter_id: REPORTER_ID,
      reason: "Spam or scam",
      details: "this is a scam",
    });
  });

  it("shows the confirmation screen after a successful submission", async () => {
    openModal();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /submit report/i }));
    });
    expect(screen.getByText("Report submitted")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /done/i })).toBeInTheDocument();
  });

  it("surfaces the message from a plain-object (PostgrestError-shaped) insert error", async () => {
    // Supabase returns a plain object with a `message` field, not an Error instance.
    mockInsert.mockResolvedValue({ error: { message: "Database unavailable" } });
    openModal();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /submit report/i }));
    });
    expect(screen.getByText("Database unavailable")).toBeInTheDocument();
    expect(screen.queryByText("Report submitted")).toBeNull();
  });

  it("falls back to a generic message when the error has no usable message", async () => {
    mockInsert.mockResolvedValue({ error: {} });
    openModal();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /submit report/i }));
    });
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.queryByText("Report submitted")).toBeNull();
  });

  it("surfaces the message when the insert throws an Error instance", async () => {
    mockInsert.mockRejectedValue(new Error("Network failure"));
    openModal();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /submit report/i }));
    });
    expect(screen.getByText("Network failure")).toBeInTheDocument();
    expect(screen.queryByText("Report submitted")).toBeNull();
  });

  // --- Loading state ---

  it("shows 'Submitting…' and disables the submit button while in flight", async () => {
    mockInsert.mockReturnValue(new Promise(() => {})); // never resolves
    openModal();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /submit report/i }));
    });
    const submitting = screen.getByRole("button", { name: /submitting/i });
    expect(submitting).toBeInTheDocument();
    expect(submitting).toBeDisabled();
  });

  // --- Reset on close ---

  it("resets reason and details after closing via Done", async () => {
    openModal();
    fireEvent.click(screen.getByText("Prohibited or illegal item"));
    fireEvent.click(screen.getByText("Spam or scam"));
    fireEvent.change(screen.getByPlaceholderText(/additional context/i), {
      target: { value: "some details" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /submit report/i }));
    });
    fireEvent.click(screen.getByRole("button", { name: /done/i }));

    // Reopen and confirm state was reset to defaults.
    fireEvent.click(screen.getByRole("button", { name: /report/i }));
    expect(screen.getByText("Prohibited or illegal item")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/additional context/i)).toHaveValue("");
  });
});
