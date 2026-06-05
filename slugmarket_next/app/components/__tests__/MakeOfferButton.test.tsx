import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MakeOfferButton from "../MakeOfferButton";
import * as AuthProvider from "../AuthProvider";

const h = vi.hoisted(() => ({
  mockPush: vi.fn(),
  state: {
    responses: {} as Record<string, unknown>,
    inserts: [] as Array<{ table: string; values: Record<string, unknown> }>,
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.mockPush }),
}));

vi.mock("../AuthProvider", () => ({
  useAuth: vi.fn(),
}));

// A tiny chainable query-builder mock. Every chaining method returns the
// builder; the terminal methods (maybeSingle/single) and a direct `await`
// (then) resolve from a per-test response map keyed by `${table}:${terminal}`.
vi.mock("@/lib/supabase", () => {
  const makeBuilder = (table: string) => {
    const builder: Record<string, unknown> = {
      select: () => builder,
      eq: () => builder,
      gt: () => builder,
      limit: () => builder,
      insert: (values: Record<string, unknown>) => {
        h.state.inserts.push({ table, values });
        return builder;
      },
      maybeSingle: () =>
        Promise.resolve(h.state.responses[`${table}:maybeSingle`] ?? { data: null, error: null }),
      single: () =>
        Promise.resolve(h.state.responses[`${table}:single`] ?? { data: { id: "generated-id" }, error: null }),
      then: (resolve: (v: unknown) => unknown) =>
        resolve(h.state.responses[`${table}:then`] ?? { data: null, error: null }),
    };
    return builder;
  };
  return { supabase: { from: (table: string) => makeBuilder(table) } };
});

const SELLER_ID = "seller-1";
const BUYER_ID = "buyer-1";
const LISTING_ID = "listing-1";

const baseProps = {
  listingPrice: 100,
  listingId: LISTING_ID,
  listingTitle: "Vintage Bike",
  listingImageUrl: "https://img.example.com/bike.jpg",
  sellerId: SELLER_ID,
};

function loginAs(id: string | null) {
  vi.mocked(AuthProvider.useAuth).mockReturnValue({
    user: id ? { id } : null,
  } as ReturnType<typeof AuthProvider.useAuth>);
}

// Render and let the mount effect (existing-offer check) settle.
async function renderSettled(props: Partial<typeof baseProps> & { sold?: boolean } = {}) {
  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(<MakeOfferButton {...baseProps} {...props} />);
  });
  return result;
}

describe("MakeOfferButton", () => {
  beforeEach(() => {
    h.mockPush.mockClear();
    h.state.inserts = [];
    h.state.responses = {
      // Mount check: buyer has NOT already offered.
      "offers:maybeSingle": { data: null, error: null },
      // No existing conversation -> one gets created.
      "conversations:maybeSingle": { data: null, error: null },
      "conversations:single": { data: { id: "convo-1" }, error: null },
      // Offer insert succeeds.
      "offers:single": { data: { id: "offer-1" }, error: null },
    };
    loginAs(BUYER_ID);
  });

  // --- Visibility ---

  it("renders nothing when the current user is the seller", async () => {
    loginAs(SELLER_ID);
    await renderSettled();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders a disabled SOLD button when the listing is sold", async () => {
    await renderSettled({ sold: true });
    const button = screen.getByRole("button", { name: /sold/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("shows the Make Offer button when the user has not already made an offer", async () => {
    await renderSettled();
    const button = await screen.findByRole("button", { name: /make offer/i });
    expect(button).toBeEnabled();
  });

  it("shows a disabled Offer Sent button when the user has already made an offer", async () => {
    h.state.responses["offers:maybeSingle"] = { data: { id: "existing-offer" }, error: null };
    await renderSettled();
    const button = await screen.findByRole("button", { name: /offer sent/i });
    expect(button).toBeDisabled();
  });

  it("disables the Make Offer button while checking for an existing offer", async () => {
    h.state.responses["offers:maybeSingle"] = new Promise(() => {}); // never resolves
    await renderSettled();
    expect(screen.getByRole("button", { name: /make offer/i })).toBeDisabled();
  });

  // --- Auth gating ---

  it("redirects a logged-out user to /signin instead of opening the modal", async () => {
    loginAs(null);
    await renderSettled();
    fireEvent.click(screen.getByRole("button", { name: /make offer/i }));
    expect(h.mockPush).toHaveBeenCalledWith("/signin");
    expect(screen.queryByText("Make an Offer")).toBeNull();
  });

  // --- Modal ---

  it("opens the offer modal showing the listed price when Make Offer is clicked", async () => {
    await renderSettled();
    fireEvent.click(await screen.findByRole("button", { name: /make offer/i }));
    expect(screen.getByText("Make an Offer")).toBeInTheDocument();
    expect(screen.getByText("$100")).toBeInTheDocument();
  });

  it("closes the modal when the × button is clicked", async () => {
    await renderSettled();
    fireEvent.click(await screen.findByRole("button", { name: /make offer/i }));
    fireEvent.click(screen.getByRole("button", { name: "×" }));
    expect(screen.queryByText("Make an Offer")).toBeNull();
  });

  // --- Submit flow ---

  it("submits an offer and shows the success confirmation", async () => {
    await renderSettled();
    fireEvent.click(await screen.findByRole("button", { name: /make offer/i }));

    fireEvent.change(screen.getByPlaceholderText("Enter your offer"), {
      target: { value: "75" },
    });
    const form = screen.getByPlaceholderText("Enter your offer").closest("form")!;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(await screen.findByText("Offer sent!")).toBeInTheDocument();
    const offerInsert = h.state.inserts.find((i) => i.table === "offers");
    expect(offerInsert?.values).toMatchObject({
      listing_id: LISTING_ID,
      buyer_id: BUYER_ID,
      seller_id: SELLER_ID,
      amount: 75,
      status: "pending",
    });
  });

  it("reuses an existing conversation instead of creating a new one", async () => {
    h.state.responses["conversations:maybeSingle"] = { data: { id: "existing-convo" }, error: null };
    await renderSettled();
    fireEvent.click(await screen.findByRole("button", { name: /make offer/i }));
    fireEvent.change(screen.getByPlaceholderText("Enter your offer"), {
      target: { value: "75" },
    });
    const form = screen.getByPlaceholderText("Enter your offer").closest("form")!;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(h.state.inserts.find((i) => i.table === "conversations")).toBeUndefined();
  });

  it("shows an error message when the offer fails to send", async () => {
    h.state.responses["offers:single"] = { data: null, error: new Error("Permission denied") };
    await renderSettled();
    fireEvent.click(await screen.findByRole("button", { name: /make offer/i }));
    fireEvent.change(screen.getByPlaceholderText("Enter your offer"), {
      target: { value: "75" },
    });
    const form = screen.getByPlaceholderText("Enter your offer").closest("form")!;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(screen.getByText("Permission denied")).toBeInTheDocument();
    expect(screen.queryByText("Offer sent!")).toBeNull();
  });

  it("shows 'Sending…' while the offer is in flight", async () => {
    h.state.responses["offers:single"] = new Promise(() => {}); // never resolves
    await renderSettled();
    fireEvent.click(await screen.findByRole("button", { name: /make offer/i }));
    fireEvent.change(screen.getByPlaceholderText("Enter your offer"), {
      target: { value: "75" },
    });
    const form = screen.getByPlaceholderText("Enter your offer").closest("form")!;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(screen.getByRole("button", { name: /sending/i })).toBeInTheDocument();
  });
});
