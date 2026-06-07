import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProfileTabs from "../ProfileTabs";
import * as AuthProvider from "../AuthProvider";
import type { Listing } from "@/lib/types";

// Provide a factory so Vitest never evaluates the real AuthProvider module
// (which imports supabase and would fail with missing env vars in test)
vi.mock("../AuthProvider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../ListingCard", () => ({
  default: ({ listing }: { listing: Listing }) => (
    <div data-testid="listing-card">{listing.title}</div>
  ),
}));

vi.mock("../ListingManageModal", () => ({
  default: () => null,
}));

vi.mock("../ReviewsSection", () => ({
  default: () => null,
}));

vi.mock("@/lib/fetchProducts", () => ({
  fetchBookmarkedProducts: vi.fn().mockResolvedValue([]),
}));

const activeListing: Listing = {
  id: "active-1",
  title: "Active Bike",
  price: 100,
  description: "desc",
  condition: "Used",
  image_urls: ["/bike.jpg"],
  seller_id: "seller-1",
  sold: false,
  buyer_id: null,
  created_at: "2024-01-01T00:00:00Z",
};

const soldListing: Listing = {
  id: "sold-1",
  title: "Sold Skateboard",
  price: 50,
  description: "desc",
  condition: "Good",
  image_urls: ["/board.jpg"],
  seller_id: "seller-1",
  sold: true,
  buyer_id: "buyer-1",
  created_at: "2024-01-01T00:00:00Z",
};

describe("ProfileTabs", () => {
  beforeEach(() => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({
      user: null,
    } as ReturnType<typeof AuthProvider.useAuth>);
  });

  function clickSoldTab() {
    fireEvent.click(screen.getByRole("button", { name: /^sold/i }));
  }

  // --- Active tab (default) ---

  it("shows active listings by default", () => {
    render(
      <ProfileTabs listings={[activeListing]} soldListings={[]} profileId="seller-1" />
    );
    expect(screen.getByText("Active Bike")).toBeInTheDocument();
  });

  it("shows 'No active listings.' when there are none", () => {
    render(
      <ProfileTabs listings={[]} soldListings={[]} profileId="seller-1" />
    );
    expect(screen.getByText("No active listings.")).toBeInTheDocument();
  });

  // --- Sold tab ---

  it("shows sold listings when the sold tab is clicked", () => {
    render(
      <ProfileTabs listings={[activeListing]} soldListings={[soldListing]} profileId="seller-1" />
    );
    clickSoldTab();
    expect(screen.getByText("Sold Skateboard")).toBeInTheDocument();
  });

  it("shows 'No sold listings.' when the sold tab is empty", () => {
    render(
      <ProfileTabs listings={[]} soldListings={[]} profileId="seller-1" />
    );
    clickSoldTab();
    expect(screen.getByText("No sold listings.")).toBeInTheDocument();
  });

  // --- Buyer display ---

  it("shows 'Sold to @username' link when buyer is in the buyerUsernames map", () => {
    render(
      <ProfileTabs
        listings={[]}
        soldListings={[soldListing]}
        profileId="seller-1"
        buyerUsernames={{ "buyer-1": "janedoe" }}
      />
    );
    clickSoldTab();
    const link = screen.getByRole("link", { name: "@janedoe" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/janedoe");
  });

  it("does not show buyer info when the listing has no buyer_id", () => {
    render(
      <ProfileTabs
        listings={[]}
        soldListings={[{ ...soldListing, buyer_id: null }]}
        profileId="seller-1"
        buyerUsernames={{ "buyer-1": "janedoe" }}
      />
    );
    clickSoldTab();
    expect(screen.queryByText(/@janedoe/)).toBeNull();
  });

  it("does not show buyer info when buyerUsernames is not provided", () => {
    render(
      <ProfileTabs listings={[]} soldListings={[soldListing]} profileId="seller-1" />
    );
    clickSoldTab();
    expect(screen.queryByText(/@janedoe/)).toBeNull();
  });

  it("does not show buyer info when buyer_id is absent from the buyerUsernames map", () => {
    render(
      <ProfileTabs
        listings={[]}
        soldListings={[soldListing]}
        profileId="seller-1"
        buyerUsernames={{}}
      />
    );
    clickSoldTab();
    expect(screen.queryByText(/@janedoe/)).toBeNull();
  });

  // --- Tab count badges ---

  it("shows the listing count badge on the active tab", () => {
    render(
      <ProfileTabs listings={[activeListing]} soldListings={[]} profileId="seller-1" />
    );
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("shows the sold count badge on the sold tab button", () => {
    render(
      <ProfileTabs listings={[]} soldListings={[soldListing]} profileId="seller-1" />
    );
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
