import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EditButton from "../EditButton";
import * as AuthProvider from "../AuthProvider";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

vi.mock("../AuthProvider", () => ({
  useAuth: vi.fn(),
}));

const SELLER_ID = "seller-1";
const PRODUCT_ID = "product-1";

describe("EditButton", () => {
  beforeEach(() => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({
      user: null,
    } as ReturnType<typeof AuthProvider.useAuth>);
  });

  // --- Visibility ---

  it("renders nothing when no user is logged in", () => {
    render(<EditButton productId={PRODUCT_ID} sellerId={SELLER_ID} />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders nothing when the logged-in user is not the seller", () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({
      user: { id: "other-user" },
    } as ReturnType<typeof AuthProvider.useAuth>);
    render(<EditButton productId={PRODUCT_ID} sellerId={SELLER_ID} />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders the Edit link when the logged-in user is the seller", () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({
      user: { id: SELLER_ID },
    } as ReturnType<typeof AuthProvider.useAuth>);
    render(<EditButton productId={PRODUCT_ID} sellerId={SELLER_ID} />);
    expect(screen.getByRole("link", { name: /edit/i })).toBeInTheDocument();
  });

  // --- Link target ---

  it("points to the correct edit URL", () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({
      user: { id: SELLER_ID },
    } as ReturnType<typeof AuthProvider.useAuth>);
    render(<EditButton productId={PRODUCT_ID} sellerId={SELLER_ID} />);
    expect(screen.getByRole("link", { name: /edit/i })).toHaveAttribute(
      "href",
      `/products/edit/${PRODUCT_ID}`
    );
  });

  // --- className ---

  it("applies a custom className to the link", () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({
      user: { id: SELLER_ID },
    } as ReturnType<typeof AuthProvider.useAuth>);
    render(
      <EditButton productId={PRODUCT_ID} sellerId={SELLER_ID} className="my-custom-class" />
    );
    expect(screen.getByRole("link", { name: /edit/i })).toHaveClass("my-custom-class");
  });
});
