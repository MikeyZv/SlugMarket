import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SignUpPage from "../page";
import * as supabaseModule from "@/lib/supabase";

const mockPush = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

describe("SignUpPage", () => {
  beforeEach(() => {
    vi.mocked(supabaseModule.supabase.auth.signUp).mockResolvedValue(
      { data: { user: null, session: null }, error: null } as Awaited<ReturnType<typeof supabaseModule.supabase.auth.signUp>>
    );
    mockPush.mockClear();
  });

  it("renders username, email, password inputs and submit button", () => {
    render(<SignUpPage />);
    expect(screen.getByPlaceholderText("slugger123")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@ucsc.edu")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Create a password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("renders a link back to the sign-in page", () => {
    render(<SignUpPage />);
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/signin");
  });

  it("toggles password visibility when the eye button is clicked", () => {
    render(<SignUpPage />);
    const passwordInput = screen.getByPlaceholderText("Create a password");
    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "" }));
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: "" }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("shows an error and does not call signUp when a non-UCSC email is entered", async () => {
    render(<SignUpPage />);
    fireEvent.change(screen.getByPlaceholderText("slugger123"), { target: { value: "slugger" } });
    fireEvent.change(screen.getByPlaceholderText("you@ucsc.edu"), { target: { value: "user@gmail.com" } });
    fireEvent.change(screen.getByPlaceholderText("Create a password"), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: /create account/i }).closest("form")!);

    await waitFor(() =>
      expect(screen.getByText("Only @ucsc.edu email addresses are allowed.")).toBeInTheDocument()
    );
    expect(supabaseModule.supabase.auth.signUp).not.toHaveBeenCalled();
  });

  it("calls signUp with email, password, and username metadata for a valid UCSC email", async () => {
    render(<SignUpPage />);
    fireEvent.change(screen.getByPlaceholderText("slugger123"), { target: { value: "slugger" } });
    fireEvent.change(screen.getByPlaceholderText("you@ucsc.edu"), { target: { value: "user@ucsc.edu" } });
    fireEvent.change(screen.getByPlaceholderText("Create a password"), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: /create account/i }).closest("form")!);

    await waitFor(() =>
      expect(supabaseModule.supabase.auth.signUp).toHaveBeenCalledWith({
        email: "user@ucsc.edu",
        password: "password123",
        options: { data: { username: "slugger" } },
      })
    );
  });

  it("redirects to '/' on successful sign-up", async () => {
    render(<SignUpPage />);
    fireEvent.change(screen.getByPlaceholderText("slugger123"), { target: { value: "slugger" } });
    fireEvent.change(screen.getByPlaceholderText("you@ucsc.edu"), { target: { value: "user@ucsc.edu" } });
    fireEvent.change(screen.getByPlaceholderText("Create a password"), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: /create account/i }).closest("form")!);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });

  it("shows an error message when sign-up fails", async () => {
    vi.mocked(supabaseModule.supabase.auth.signUp).mockResolvedValue(
      { data: { user: null, session: null }, error: { message: "Email already registered" } } as unknown as Awaited<ReturnType<typeof supabaseModule.supabase.auth.signUp>>
    );

    render(<SignUpPage />);
    fireEvent.change(screen.getByPlaceholderText("slugger123"), { target: { value: "slugger" } });
    fireEvent.change(screen.getByPlaceholderText("you@ucsc.edu"), { target: { value: "user@ucsc.edu" } });
    fireEvent.change(screen.getByPlaceholderText("Create a password"), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: /create account/i }).closest("form")!);

    await waitFor(() => expect(screen.getByText("Email already registered")).toBeInTheDocument());
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("disables the submit button and shows loading text while submitting", async () => {
    let resolveSignUp!: (value: Awaited<ReturnType<typeof supabaseModule.supabase.auth.signUp>>) => void;
    vi.mocked(supabaseModule.supabase.auth.signUp).mockReturnValue(
      new Promise((resolve) => { resolveSignUp = resolve; }) as ReturnType<typeof supabaseModule.supabase.auth.signUp>
    );

    render(<SignUpPage />);
    fireEvent.change(screen.getByPlaceholderText("slugger123"), { target: { value: "slugger" } });
    fireEvent.change(screen.getByPlaceholderText("you@ucsc.edu"), { target: { value: "user@ucsc.edu" } });
    fireEvent.change(screen.getByPlaceholderText("Create a password"), { target: { value: "password123" } });
    fireEvent.submit(screen.getByRole("button", { name: /create account/i }).closest("form")!);

    expect(screen.getByRole("button", { name: /creating account/i })).toBeDisabled();

    resolveSignUp({ data: { user: null, session: null }, error: null });
    await waitFor(() => expect(screen.getByRole("button", { name: /create account/i })).not.toBeDisabled());
  });
});
