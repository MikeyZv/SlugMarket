import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ListingCard from "../ListingCard";
import type { Listing } from "@/lib/types";

// Mock Next.js Image and Link components for testing
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

// Mock Next.js Link component to render a simple anchor tag for testing
vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

// Base listing object to use in tests, can be overridden for specific test cases
const baseListing: Listing = {
  id: "listing-1",
  title: "Blue Bike",
  price: 120,
  description: "Good condition bike",
  condition: "Used",
  image_urls: ["/bike.jpg"],
  seller_id: "seller-1",
  sold: false,
  created_at: "2024-01-01T00:00:00Z",
};

// Test suite for the ListingCard component, covering rendering as a link or button, displaying title and price, and showing sold status
describe("ListingCard", () => {
  // Test that the component renders as a link to the product page when onSelectListing is not provided
  it("renders as a link to the product page", () => {
    render(<ListingCard listing={baseListing} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/products/listing-1");
  });

  // Test that the component renders as a button when onSelectListing is provided
  it("renders as a button when onSelectListing is provided", () => {
    const handler = vi.fn();
    render(<ListingCard listing={baseListing} onSelectListing={handler} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });

  // Test that clicking the button calls the onSelectListing handler
  it("calls onSelectListing when the button is clicked", () => {
    const handler = vi.fn();
    render(<ListingCard listing={baseListing} onSelectListing={handler} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  // Test that the component displays the listing's title and price
  it("shows the title and price", () => {
    render(<ListingCard listing={baseListing} />);
    expect(screen.getByText("Blue Bike")).toBeInTheDocument();
    expect(screen.getByText("$120")).toBeInTheDocument();
  });

  // Test that the component shows a "Sold" badge when the listing is marked as sold
  it("shows 'Sold' badge when listing.sold is true", () => {
    render(<ListingCard listing={{ ...baseListing, sold: true }} />);
    expect(screen.getByText("Sold")).toBeInTheDocument();
  });

  // Test that the component does not show a "Sold" badge when the listing is active (not sold)
  it("does not show 'Sold' badge when listing is active", () => {
    render(<ListingCard listing={baseListing} />);
    expect(screen.queryByText("Sold")).toBeNull();
  });
});
