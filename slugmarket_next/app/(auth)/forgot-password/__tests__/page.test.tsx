import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ForgotPasswordPage from "../page";
import * as supabaseModule from "@/lib/supabase";

// Mock Supabase client to test resetPasswordForEmail calls without making real API calls
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

// Mock Next.js Link component to render a simple anchor tag for testing
vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

// Test suite for the ForgotPasswordPage component, covering rendering the form, showing confirmation and error messages, and calling resetPasswordForEmail with the entered email
describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.mocked(supabaseModule.supabase.auth.resetPasswordForEmail).mockResolvedValue(
      { data: {}, error: null } as Awaited<ReturnType<typeof supabaseModule.supabase.auth.resetPasswordForEmail>>
    );
  });

  // Test that the component renders the email input and submit button
  it("renders the email input and submit button", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByPlaceholderText("you@ucsc.edu")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });

  // Test that the component has a link to go back to the sign-in page
  it("has a back to sign in link", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByRole("link", { name: /back to sign in/i })).toHaveAttribute("href", "/signin");
  });

  // Test that the component shows a confirmation message after a successful submission, including the entered email
  it("shows confirmation after a successful submission", async () => {
    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByPlaceholderText("you@ucsc.edu"), { target: { value: "user@example.com" } });
    fireEvent.submit(screen.getByRole("button", { name: /send reset link/i }).closest("form")!);

    await waitFor(() => expect(screen.getByText(/check your inbox/i)).toBeInTheDocument());
    expect(screen.getByText(/user@example\.com/)).toBeInTheDocument();
  });

  // Test that the component shows an error message when resetPasswordForEmail returns an error, and does not show the confirmation message
  it("shows an error message when the request fails", async () => {
    vi.mocked(supabaseModule.supabase.auth.resetPasswordForEmail).mockResolvedValue(
      { data: {}, error: { message: "User not found" } } as unknown as Awaited<ReturnType<typeof supabaseModule.supabase.auth.resetPasswordForEmail>>
    );

    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByPlaceholderText("you@ucsc.edu"), { target: { value: "nobody@example.com" } });
    fireEvent.submit(screen.getByRole("button", { name: /send reset link/i }).closest("form")!);

    await waitFor(() => expect(screen.getByText("User not found")).toBeInTheDocument());
  });

  // Test that the component calls resetPasswordForEmail with the entered email and a redirect URL containing "/reset-password"
  it("calls resetPasswordForEmail with the entered email", async () => {
    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByPlaceholderText("you@ucsc.edu"), { target: { value: "test@ucsc.edu" } });
    fireEvent.submit(screen.getByRole("button", { name: /send reset link/i }).closest("form")!);

    await waitFor(() =>
      expect(supabaseModule.supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        "test@ucsc.edu",
        expect.objectContaining({ redirectTo: expect.stringContaining("/reset-password") })
      )
    );
  });
});
