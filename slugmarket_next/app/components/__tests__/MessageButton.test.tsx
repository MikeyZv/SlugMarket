import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MessageButton from "../MessageButton";
import * as AuthProvider from "../AuthProvider";

const mockPush = vi.fn();

// Mock Next.js useRouter to test navigation behavior
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock Supabase client to test database interactions without making real API calls
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: "convo-123" }, error: null }),
    })),
  },
}));

// Mock the AuthProvider to control authentication state in tests
vi.mock("../AuthProvider");

// Test suite for the MessageButton component, covering rendering based on user state, redirection when not authenticated, and showing loading state when opening a conversation
describe("MessageButton", () => {
  beforeEach(() => {
    // Reset the mocked authentication state to a logged-in user before each test, and clear the mockPush calls
    vi.mocked(AuthProvider.useAuth).mockReturnValue({ user: { id: "user-aaa" } } as ReturnType<typeof AuthProvider.useAuth>);
    mockPush.mockClear();
  });

  // Test that the button renders when the otherUserId is different from the current user's ID
  it("renders when otherUserId differs from current user", () => {
    render(<MessageButton otherUserId="user-bbb" />);
    expect(screen.getByRole("button", { name: /message/i })).toBeInTheDocument();
  });

  // Test that the component returns nothing (renders nothing) when the otherUserId is the same as the current user's ID (i.e., it's the user's own listing)
  it("returns nothing when otherUserId is the current user (own listing)", () => {
    const { container } = render(<MessageButton otherUserId="user-aaa" />);
    expect(container).toBeEmptyDOMElement();
  });

  // Test that clicking the button redirects to the sign-in page when the user is not authenticated
  it("redirects to signin when clicked while logged out", () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({ user: null } as ReturnType<typeof AuthProvider.useAuth>);
    render(<MessageButton otherUserId="user-bbb" />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockPush).toHaveBeenCalledWith("/signin");
  });

  // Test that clicking the button shows "Opening…" while the conversation is being created (simulating a loading state)
  it("shows 'Opening…' while loading", async () => {
    render(<MessageButton otherUserId="user-bbb" />);
    fireEvent.click(screen.getByRole("button", { name: /message/i }));
    expect(await screen.findByText(/opening/i)).toBeInTheDocument();
  });
});
