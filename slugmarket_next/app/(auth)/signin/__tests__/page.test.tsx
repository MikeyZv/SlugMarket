import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SignInPage from "../page";
import * as supabaseModule from "@/lib/supabase";

const mockPush = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

describe("SignInPage", () => {
  beforeEach(() => {
    vi.mocked(supabaseModule.supabase.auth.signInWithPassword).mockResolvedValue(
      { data: { user: null, session: null }, error: null } as Awaited<ReturnType<typeof supabaseModule.supabase.auth.signInWithPassword>>
    );
    mockPush.mockClear();
  });

  it("renders email input, password input, and submit button", () => {
    render(<SignInPage />);
    expect(screen.getByPlaceholderText("you@ucsc.edu")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders the forgot password and sign up links", () => {
    render(<SignInPage />);
    expect(screen.getByRole("link", { name: /forgot password/i })).toHaveAttribute("href", "/forgot-password");
    expect(screen.getByRole("link", { name: /create an account/i })).toHaveAttribute("href", "/signup");
  });

  it("toggles password visibility when the eye button is clicked", () => {
    render(<SignInPage />);
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "" }));
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: "" }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("calls signInWithPassword with the entered email and password", async () => {
    render(<SignInPage />);
    fireEvent.change(screen.getByPlaceholderText("you@ucsc.edu"), { target: { value: "user@ucsc.edu" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "secret123" } });
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }).closest("form")!);

    await waitFor(() =>
      expect(supabaseModule.supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "user@ucsc.edu",
        password: "secret123",
      })
    );
  });

  it("redirects to '/' on successful sign-in", async () => {
    render(<SignInPage />);
    fireEvent.change(screen.getByPlaceholderText("you@ucsc.edu"), { target: { value: "user@ucsc.edu" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "secret123" } });
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }).closest("form")!);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });

  it("shows an error message when sign-in fails", async () => {
    vi.mocked(supabaseModule.supabase.auth.signInWithPassword).mockResolvedValue(
      { data: { user: null, session: null }, error: { message: "Invalid login credentials" } } as unknown as Awaited<ReturnType<typeof supabaseModule.supabase.auth.signInWithPassword>>
    );

    render(<SignInPage />);
    fireEvent.change(screen.getByPlaceholderText("you@ucsc.edu"), { target: { value: "user@ucsc.edu" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "wrongpass" } });
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }).closest("form")!);

    await waitFor(() => expect(screen.getByText("Invalid login credentials")).toBeInTheDocument());
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("disables the submit button and shows loading text while submitting", async () => {
    let resolveSignIn!: (value: unknown) => void;
    vi.mocked(supabaseModule.supabase.auth.signInWithPassword).mockReturnValue(
      new Promise((resolve) => { resolveSignIn = resolve; }) as ReturnType<typeof supabaseModule.supabase.auth.signInWithPassword>
    );

    render(<SignInPage />);
    fireEvent.change(screen.getByPlaceholderText("you@ucsc.edu"), { target: { value: "user@ucsc.edu" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "secret123" } });
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }).closest("form")!);

    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();

    resolveSignIn({ data: { user: null, session: null }, error: null });
    await waitFor(() => expect(screen.getByRole("button", { name: /sign in/i })).not.toBeDisabled());
  });
});
