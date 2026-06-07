import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DeleteButton from "../DeleteButton";
import * as AuthProvider from "../AuthProvider";
import * as listingsActions from "@/app/actions/listings";

const { mockPush, mockDeleteEq, mockStorageRemove } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockDeleteEq: vi.fn(),
  mockStorageRemove: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("../AuthProvider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/app/actions/listings", () => ({
  revalidateListings: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({ delete: () => ({ eq: mockDeleteEq }) }),
    storage: {
      from: () => ({ remove: mockStorageRemove }),
    },
  },
}));

const SELLER_ID = "seller-1";
const PRODUCT_ID = "product-1";
const IMAGE_URLS = [
  "https://abc.supabase.co/storage/v1/object/public/listing-images/user123/photo.jpg",
];

function renderAsSeller(overrides: { imageUrls?: string[] } = {}) {
  vi.mocked(AuthProvider.useAuth).mockReturnValue({
    user: { id: SELLER_ID },
  } as ReturnType<typeof AuthProvider.useAuth>);
  return render(
    <DeleteButton
      productId={PRODUCT_ID}
      sellerId={SELLER_ID}
      imageUrls={overrides.imageUrls ?? IMAGE_URLS}
    />
  );
}

describe("DeleteButton", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockDeleteEq.mockClear();
    mockStorageRemove.mockClear();
    vi.mocked(listingsActions.revalidateListings).mockClear();
    mockDeleteEq.mockResolvedValue({ error: null });
    mockStorageRemove.mockResolvedValue({ error: null });
  });

  // --- Visibility ---

  it("renders nothing when the current user is not the seller", () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({
      user: { id: "other-user" },
    } as ReturnType<typeof AuthProvider.useAuth>);
    render(<DeleteButton productId={PRODUCT_ID} sellerId={SELLER_ID} imageUrls={IMAGE_URLS} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders nothing when there is no logged-in user", () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({
      user: null,
    } as ReturnType<typeof AuthProvider.useAuth>);
    render(<DeleteButton productId={PRODUCT_ID} sellerId={SELLER_ID} imageUrls={IMAGE_URLS} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders the Delete Listing button when the current user is the seller", () => {
    renderAsSeller();
    expect(screen.getByRole("button", { name: /delete listing/i })).toBeInTheDocument();
  });

  // --- Modal open / close ---

  it("opens the confirmation modal when Delete Listing is clicked", () => {
    renderAsSeller();
    fireEvent.click(screen.getByRole("button", { name: /delete listing/i }));
    expect(screen.getByText("Delete listing?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /yes, delete it/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("closes the modal when Cancel is clicked", () => {
    renderAsSeller();
    fireEvent.click(screen.getByRole("button", { name: /delete listing/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByText("Delete listing?")).toBeNull();
  });

  // --- Deletion flow ---

  it("calls supabase delete with the correct product ID", async () => {
    renderAsSeller();
    fireEvent.click(screen.getByRole("button", { name: /delete listing/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /yes, delete it/i }));
    });
    expect(mockDeleteEq).toHaveBeenCalledWith("id", PRODUCT_ID);
  });

  it("calls supabase storage.remove with the extracted file path", async () => {
    renderAsSeller();
    fireEvent.click(screen.getByRole("button", { name: /delete listing/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /yes, delete it/i }));
    });
    expect(mockStorageRemove).toHaveBeenCalledWith(["user123/photo.jpg"]);
  });

  it("skips storage removal when image URLs do not match the bucket path", async () => {
    renderAsSeller({ imageUrls: ["https://cdn.example.com/other/image.jpg"] });
    fireEvent.click(screen.getByRole("button", { name: /delete listing/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /yes, delete it/i }));
    });
    expect(mockStorageRemove).not.toHaveBeenCalled();
  });

  it("calls revalidateListings after successful deletion", async () => {
    renderAsSeller();
    fireEvent.click(screen.getByRole("button", { name: /delete listing/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /yes, delete it/i }));
    });
    expect(listingsActions.revalidateListings).toHaveBeenCalledOnce();
  });

  it("navigates to '/' after successful deletion", async () => {
    renderAsSeller();
    fireEvent.click(screen.getByRole("button", { name: /delete listing/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /yes, delete it/i }));
    });
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("does not navigate away when deletion fails", async () => {
    mockDeleteEq.mockResolvedValue({ error: { message: "Permission denied" } });
    renderAsSeller();
    fireEvent.click(screen.getByRole("button", { name: /delete listing/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /yes, delete it/i }));
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  // --- Loading state ---

  it("shows 'Deleting...' while deletion is in progress", async () => {
    mockDeleteEq.mockReturnValue(new Promise(() => {})); // never resolves
    renderAsSeller();
    fireEvent.click(screen.getByRole("button", { name: /delete listing/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /yes, delete it/i }));
    });
    expect(screen.getByRole("button", { name: /deleting/i })).toBeInTheDocument();
  });

  it("disables both modal buttons while deletion is in progress", async () => {
    mockDeleteEq.mockReturnValue(new Promise(() => {}));
    renderAsSeller();
    fireEvent.click(screen.getByRole("button", { name: /delete listing/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /yes, delete it/i }));
    });
    expect(screen.getByRole("button", { name: /deleting/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });
});
