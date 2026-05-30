import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ResetPasswordPage from "../page";
import * as supabaseModule from "@/lib/supabase";

const mockPush = vi.fn();

// Mock Next.js useRouter to test navigation behavior
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Capture the auth callback so tests can fire auth events manually.
type AuthCallback = (event: string, session: unknown) => void;
let capturedCallback: AuthCallback | null = null;
const mockUnsubscribe = vi.fn();

// Mock Supabase client to test auth state changes and updateUser calls without making real API calls
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn((cb: AuthCallback) => {
        capturedCallback = cb;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      }),
      updateUser: vi.fn(),
    },
  },
}));

// Helper function to trigger auth events in tests by calling the captured callback with the specified event name
function triggerAuthEvent(event: string) {
  act(() => { capturedCallback?.(event, null); });
}

// Test suite for the ResetPasswordPage component, covering verifying state, showing the password form on PASSWORD_RECOVERY event, validating password inputs, calling updateUser, handling errors, and unsubscribing on unmount
describe("ResetPasswordPage", () => {
  beforeEach(() => {
    capturedCallback = null;
    mockPush.mockClear();
    mockUnsubscribe.mockClear();
    vi.mocked(supabaseModule.supabase.auth.updateUser).mockResolvedValue(
      { data: { user: {} }, error: null } as Awaited<ReturnType<typeof supabaseModule.supabase.auth.updateUser>>
    );
  });

  // Test that the component shows a verifying state before the auth event fires, and does not show the password form
  it("shows a verifying state before the auth event fires", () => {
    render(<ResetPasswordPage />);
    expect(screen.getByText(/verifying reset link/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("new password")).toBeNull();
  });

  // Test that the component shows the new password and confirm password fields when a PASSWORD_RECOVERY event is fired
  it("shows the password form after a PASSWORD_RECOVERY event", () => {
    render(<ResetPasswordPage />);
    triggerAuthEvent("PASSWORD_RECOVERY");
    expect(screen.getByPlaceholderText("new password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("confirm password")).toBeInTheDocument();
  });

  // Test that the component shows an error message when the new password and confirm password fields do not match, and does not call updateUser
  it("shows an error when passwords do not match", async () => {
    render(<ResetPasswordPage />);
    triggerAuthEvent("PASSWORD_RECOVERY");

    fireEvent.change(screen.getByPlaceholderText("new password"), { target: { value: "password1" } });
    fireEvent.change(screen.getByPlaceholderText("confirm password"), { target: { value: "password2" } });
    fireEvent.submit(screen.getByRole("button", { name: /update password/i }).closest("form")!);

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(supabaseModule.supabase.auth.updateUser).not.toHaveBeenCalled();
  });

  // Test that the component shows an error message when the new password is fewer than 6 characters, and does not call updateUser
  it("shows an error when the password is fewer than 6 characters", async () => {
    render(<ResetPasswordPage />);
    triggerAuthEvent("PASSWORD_RECOVERY");

    fireEvent.change(screen.getByPlaceholderText("new password"), { target: { value: "abc" } });
    fireEvent.change(screen.getByPlaceholderText("confirm password"), { target: { value: "abc" } });
    fireEvent.submit(screen.getByRole("button", { name: /update password/i }).closest("form")!);

    expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    expect(supabaseModule.supabase.auth.updateUser).not.toHaveBeenCalled();
  });

  // Test that the component calls updateUser with the new password and redirects to the home page on success
  it("calls updateUser with the new password and redirects on success", async () => {
    render(<ResetPasswordPage />);
    triggerAuthEvent("PASSWORD_RECOVERY");

    fireEvent.change(screen.getByPlaceholderText("new password"), { target: { value: "newpass123" } });
    fireEvent.change(screen.getByPlaceholderText("confirm password"), { target: { value: "newpass123" } });
    fireEvent.submit(screen.getByRole("button", { name: /update password/i }).closest("form")!);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
    expect(supabaseModule.supabase.auth.updateUser).toHaveBeenCalledWith({ password: "newpass123" });
  });

  // Test that the component shows an error message when updateUser returns an error, and does not redirect
  it("shows an error when updateUser fails", async () => {
    vi.mocked(supabaseModule.supabase.auth.updateUser).mockResolvedValue(
      { data: { user: null }, error: { message: "Token has expired" } } as unknown as Awaited<ReturnType<typeof supabaseModule.supabase.auth.updateUser>>
    );

    render(<ResetPasswordPage />);
    triggerAuthEvent("PASSWORD_RECOVERY");

    fireEvent.change(screen.getByPlaceholderText("new password"), { target: { value: "newpass123" } });
    fireEvent.change(screen.getByPlaceholderText("confirm password"), { target: { value: "newpass123" } });
    fireEvent.submit(screen.getByRole("button", { name: /update password/i }).closest("form")!);

    await waitFor(() => expect(screen.getByText("Token has expired")).toBeInTheDocument());
    expect(mockPush).not.toHaveBeenCalled();
  });

  // Test that the component unsubscribes from auth state changes when it unmounts
  it("unsubscribes from onAuthStateChange on unmount", () => {
    const { unmount } = render(<ResetPasswordPage />);
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
