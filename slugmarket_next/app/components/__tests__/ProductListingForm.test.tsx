import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProductListingForm from "../ProductListingForm";
import * as AuthProvider from "../AuthProvider";
import * as uploadModule from "@/lib/uploadImages";
import * as listingsActions from "@/app/actions/listings";

const mockPush = vi.hoisted(() => vi.fn());
const mockReplace = vi.hoisted(() => vi.fn());

// Supabase chain mocks for create: .from().insert().select().single()
const mockSingle = vi.hoisted(() => vi.fn());
const mockSelect = vi.hoisted(() => vi.fn(() => ({ single: mockSingle })));
const mockInsert = vi.hoisted(() => vi.fn(() => ({ select: mockSelect })));

// Supabase chain mocks for edit: .from().update().eq().eq()
const mockEqSeller = vi.hoisted(() => vi.fn());
const mockEqId = vi.hoisted(() => vi.fn(() => ({ eq: mockEqSeller })));
const mockUpdate = vi.hoisted(() => vi.fn(() => ({ eq: mockEqId })));

const mockFrom = vi.hoisted(() => vi.fn(() => ({ insert: mockInsert, update: mockUpdate })));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

vi.mock("../AuthProvider");

vi.mock("@/lib/supabase", () => ({
  supabase: { from: mockFrom },
}));

vi.mock("@/lib/uploadImages", () => ({
  uploadLocals: vi.fn(),
}));

vi.mock("@/app/actions/listings", () => ({
  revalidateListings: vi.fn(),
}));

// Replaces ImageUploadGrid with a simple test double that exposes onAdd/onRemove as buttons
vi.mock("../ImageUploadGrid", () => ({
  default: ({ images, onAdd, onRemove }: {
    images: { url: string }[];
    onAdd: (files: File[]) => void;
    onRemove: (i: number) => void;
  }) => (
    <div data-testid="image-grid">
      {images.map((_, i) => (
        <button key={i} type="button" onClick={() => onRemove(i)}>
          Remove {i}
        </button>
      ))}
      <button
        type="button"
        data-testid="add-photo"
        onClick={() => onAdd([new File(["x"], "photo.jpg", { type: "image/jpeg" })])}
      >
        Add photo
      </button>
    </div>
  ),
}));

global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = vi.fn();

const mockUser = { id: "user-123", email: "test@ucsc.edu" } as ReturnType<typeof AuthProvider.useAuth>["user"];

describe("ProductListingForm", () => {
  beforeEach(() => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
    } as ReturnType<typeof AuthProvider.useAuth>);

    mockSingle.mockResolvedValue({ data: { id: "new-id" }, error: null });
    mockEqSeller.mockResolvedValue({ error: null });
    vi.mocked(uploadModule.uploadLocals).mockResolvedValue([]);
    vi.mocked(listingsActions.revalidateListings).mockResolvedValue(undefined as never);

    mockPush.mockClear();
    mockReplace.mockClear();
    mockFrom.mockClear();
    mockInsert.mockClear();
    mockUpdate.mockClear();
  });

  // --- Create mode rendering ---

  describe("create mode", () => {
    it("renders 'Post a Listing' heading and subtitle", () => {
      render(<ProductListingForm mode="create" />);
      expect(screen.getByText("Post a Listing")).toBeInTheDocument();
      expect(screen.getByText(/fill in the details/i)).toBeInTheDocument();
    });

    it("renders title, price, description, and condition fields", () => {
      render(<ProductListingForm mode="create" />);
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
      expect(screen.getByLabelText("Price")).toBeInTheDocument();
      expect(screen.getByLabelText("Description")).toBeInTheDocument();
      expect(screen.getByLabelText("Condition")).toBeInTheDocument();
    });

    it("renders 'Post Listing' submit button", () => {
      render(<ProductListingForm mode="create" />);
      expect(screen.getByRole("button", { name: /post listing/i })).toBeInTheDocument();
    });
  });

  // --- Edit mode rendering ---

  describe("edit mode", () => {
    const initialForm = { title: "Old Title", price: "25", description: "Old desc", condition: "Good" as const, category: "Electronics" as const };

    it("renders 'Edit Listing' heading and subtitle", () => {
      render(<ProductListingForm mode="edit" listingId="listing-1" initialForm={initialForm} />);
      expect(screen.getByText("Edit Listing")).toBeInTheDocument();
      expect(screen.getByText(/update your listing/i)).toBeInTheDocument();
    });

    it("renders 'Save changes' submit button", () => {
      render(<ProductListingForm mode="edit" listingId="listing-1" initialForm={initialForm} />);
      expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    });

    it("pre-fills all form fields with initialForm values", () => {
      render(<ProductListingForm mode="edit" listingId="listing-1" initialForm={initialForm} />);
      expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe("Old Title");
      expect((screen.getByLabelText("Price") as HTMLInputElement).value).toBe("25");
      expect((screen.getByLabelText("Description") as HTMLTextAreaElement).value).toBe("Old desc");
      expect(screen.getByLabelText("Condition")).toHaveTextContent("Good");
    });

    it("pre-fills image grid with initialImageUrls", () => {
      render(
        <ProductListingForm
          mode="edit"
          listingId="listing-1"
          initialImageUrls={["https://example.com/a.jpg", "https://example.com/b.jpg"]}
        />
      );
      expect(screen.getByText("Remove 0")).toBeInTheDocument();
      expect(screen.getByText("Remove 1")).toBeInTheDocument();
    });
  });

  // --- Auth behavior ---

  it("renders nothing while auth is loading", () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({ user: null, loading: true } as ReturnType<typeof AuthProvider.useAuth>);
    const { container } = render(<ProductListingForm mode="create" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing and redirects to /signin when unauthenticated", async () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({ user: null, loading: false } as ReturnType<typeof AuthProvider.useAuth>);
    const { container } = render(<ProductListingForm mode="create" />);
    expect(container).toBeEmptyDOMElement();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/signin"));
  });

  // --- Validation ---

  it("shows an error and does not call supabase when there are no images", async () => {
    render(<ProductListingForm mode="create" />);
    fillForm();
    fireEvent.submit(screen.getByRole("button", { name: /post listing/i }).closest("form")!);
    await waitFor(() => expect(screen.getByText("Please add at least one photo")).toBeInTheDocument());
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("shows an error in edit mode when listingId is missing", async () => {
    render(<ProductListingForm mode="edit" initialImageUrls={["https://example.com/photo.jpg"]} />);
    fillForm();
    fireEvent.submit(screen.getByRole("button", { name: /save changes/i }).closest("form")!);
    await waitFor(() => expect(screen.getByText("Missing listing id")).toBeInTheDocument());
    expect(mockFrom).not.toHaveBeenCalled();
  });

  // --- Create submission ---

  it("inserts a new listing with correct data and redirects to the product page", async () => {
    render(<ProductListingForm mode="create" initialImageUrls={["https://example.com/photo.jpg"]} />);
    fillForm({ title: "Textbook", price: "20", description: "Good book", condition: "Good" });
    fireEvent.submit(screen.getByRole("button", { name: /post listing/i }).closest("form")!);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/products/new-id"));
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      title: "Textbook",
      price: 20,
      description: "Good book",
      condition: "Good",
      seller_id: "user-123",
      image_urls: ["https://example.com/photo.jpg"],
    }));
    expect(listingsActions.revalidateListings).toHaveBeenCalled();
  });

  it("shows an error message when the insert fails", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "Insert failed" } });
    render(<ProductListingForm mode="create" initialImageUrls={["https://example.com/photo.jpg"]} />);
    fillForm();
    fireEvent.submit(screen.getByRole("button", { name: /post listing/i }).closest("form")!);
    await waitFor(() => expect(screen.getByText("Insert failed")).toBeInTheDocument());
    expect(mockPush).not.toHaveBeenCalled();
  });

  // --- Edit submission ---

  it("updates the listing with correct data and redirects to the listing page", async () => {
    render(
      <ProductListingForm
        mode="edit"
        listingId="listing-1"
        initialImageUrls={["https://example.com/photo.jpg"]}
      />
    );
    fillForm({ title: "Updated Title", price: "30", description: "Updated desc", condition: "Fair" });
    fireEvent.submit(screen.getByRole("button", { name: /save changes/i }).closest("form")!);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/products/listing-1"));
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      title: "Updated Title",
      price: 30,
      description: "Updated desc",
      condition: "Fair",
      image_urls: ["https://example.com/photo.jpg"],
    }));
    expect(listingsActions.revalidateListings).toHaveBeenCalled();
  });

  it("shows an error message when the update fails", async () => {
    mockEqSeller.mockResolvedValue({ error: { message: "Update failed" } });
    render(
      <ProductListingForm
        mode="edit"
        listingId="listing-1"
        initialImageUrls={["https://example.com/photo.jpg"]}
      />
    );
    fillForm();
    fireEvent.submit(screen.getByRole("button", { name: /save changes/i }).closest("form")!);
    await waitFor(() => expect(screen.getByText("Update failed")).toBeInTheDocument());
    expect(mockPush).not.toHaveBeenCalled();
  });

  // --- Loading state ---

  it("shows 'Posting...' and disables the button while creating", async () => {
    let resolveInsert!: (v: unknown) => void;
    mockSingle.mockReturnValue(new Promise((r) => { resolveInsert = r; }));

    render(<ProductListingForm mode="create" initialImageUrls={["https://example.com/photo.jpg"]} />);
    fillForm();
    fireEvent.submit(screen.getByRole("button", { name: /post listing/i }).closest("form")!);

    expect(screen.getByRole("button", { name: /posting\.\.\./i })).toBeDisabled();

    resolveInsert({ data: { id: "new-id" }, error: null });
    await waitFor(() => expect(screen.getByRole("button", { name: /post listing/i })).not.toBeDisabled());
  });

  it("shows 'Saving...' and disables the button while editing", async () => {
    let resolveUpdate!: (v: unknown) => void;
    mockEqSeller.mockReturnValue(new Promise((r) => { resolveUpdate = r; }));

    render(
      <ProductListingForm
        mode="edit"
        listingId="listing-1"
        initialImageUrls={["https://example.com/photo.jpg"]}
      />
    );
    fillForm();
    fireEvent.submit(screen.getByRole("button", { name: /save changes/i }).closest("form")!);

    expect(screen.getByRole("button", { name: /saving\.\.\./i })).toBeDisabled();

    resolveUpdate({ error: null });
    await waitFor(() => expect(screen.getByRole("button", { name: /save changes/i })).not.toBeDisabled());
  });

  // --- Image management ---

  it("adds a new image when the image grid calls onAdd", () => {
    render(<ProductListingForm mode="create" />);
    expect(screen.queryByText("Remove 0")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("add-photo"));
    expect(screen.getByText("Remove 0")).toBeInTheDocument();
  });

  it("removes an image when the image grid calls onRemove", () => {
    render(<ProductListingForm mode="create" initialImageUrls={["https://example.com/photo.jpg"]} />);
    expect(screen.getByText("Remove 0")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Remove 0"));
    expect(screen.queryByText("Remove 0")).not.toBeInTheDocument();
  });

  // --- Local image upload ---

  it("uploads local images and includes the returned URLs in the insert payload", async () => {
    vi.mocked(uploadModule.uploadLocals).mockResolvedValue(["https://cdn.example.com/uploaded.jpg"]);

    render(<ProductListingForm mode="create" />);
    fillForm();
    fireEvent.click(screen.getByTestId("add-photo"));
    fireEvent.submit(screen.getByRole("button", { name: /post listing/i }).closest("form")!);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/products/new-id"));
    expect(uploadModule.uploadLocals).toHaveBeenCalledWith([expect.any(File)], "user-123");
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      image_urls: ["https://cdn.example.com/uploaded.jpg"],
    }));
  });
});

function fillForm(values: { title?: string; price?: string; description?: string; condition?: string } = {}) {
  const { title = "Test Item", price = "10", description = "A test item", condition = "Good" } = values;
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: title } });
  fireEvent.change(screen.getByLabelText("Price"), { target: { value: price } });
  fireEvent.change(screen.getByLabelText("Description"), { target: { value: description } });
  fireEvent.click(screen.getByLabelText("Condition"));
  fireEvent.click(screen.getByRole("button", { name: condition }));
}
