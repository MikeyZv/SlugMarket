import { render, screen, fireEvent, act, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EditProfile from "../EditProfile";
import * as AuthProvider from "../AuthProvider";

const { mockUpdate, mockEq } = vi.hoisted(() => ({
  mockUpdate: vi.fn(),
  mockEq: vi.fn(),
}));

vi.mock("../AuthProvider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({ update: mockUpdate }),
  },
}));

const OWNER_ID = "owner-1";
const OTHER_ID = "other-1";

function setUser(user: { id: string } | null) {
  vi.mocked(AuthProvider.useAuth).mockReturnValue({
    user,
  } as ReturnType<typeof AuthProvider.useAuth>);
}

function renderAsOwner(props?: Partial<{ initialBio: string | null; initialCollege: string | null }>) {
  setUser({ id: OWNER_ID });
  return render(
    <EditProfile
      profileId={OWNER_ID}
      initialBio={props?.initialBio ?? null}
      initialCollege={props?.initialCollege ?? null}
    />
  );
}

/** Renders as the owner and opens the edit modal. */
function openModal(props?: Partial<{ initialBio: string | null; initialCollege: string | null }>) {
  renderAsOwner(props);
  fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));
}

describe("EditProfile", () => {
  beforeEach(() => {
    mockUpdate.mockReset();
    mockEq.mockReset();
    // supabase.from(...).update(...).eq(...) — update returns a chain ending in eq.
    mockEq.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: mockEq });
  });

  // --- Display / ownership ---

  it("shows the formatted college and bio when both are set", () => {
    setUser({ id: OTHER_ID });
    render(<EditProfile profileId={OWNER_ID} initialBio="Hi there" initialCollege="Cowell" />);
    expect(screen.getByText("Cowell College")).toBeInTheDocument();
    expect(screen.getByText("Hi there")).toBeInTheDocument();
  });

  it("does not append 'College' to 'College Nine'", () => {
    setUser({ id: OTHER_ID });
    render(<EditProfile profileId={OWNER_ID} initialBio={null} initialCollege="College Nine" />);
    expect(screen.getByText("College Nine")).toBeInTheDocument();
  });

  it("shows the edit button and 'Add a bio…' prompt for the owner when no bio is set", () => {
    renderAsOwner();
    expect(screen.getByRole("button", { name: /edit profile/i })).toBeInTheDocument();
    expect(screen.getByText("Add a bio…")).toBeInTheDocument();
  });

  it("hides the edit button and bio prompt for a non-owner", () => {
    setUser({ id: OTHER_ID });
    render(<EditProfile profileId={OWNER_ID} initialBio={null} initialCollege={null} />);
    expect(screen.queryByRole("button", { name: /edit profile/i })).toBeNull();
    expect(screen.queryByText("Add a bio…")).toBeNull();
  });

  it("hides the edit button when there is no logged-in user", () => {
    setUser(null);
    render(<EditProfile profileId={OWNER_ID} initialBio={null} initialCollege={null} />);
    expect(screen.queryByRole("button", { name: /edit profile/i })).toBeNull();
  });

  // --- Modal open / close ---

  it("opens the edit modal when the owner clicks the edit button", () => {
    openModal();
    expect(screen.getByRole("heading", { name: /edit your profile/i })).toBeInTheDocument();
  });

  it("seeds the modal fields with the current bio and college", () => {
    openModal({ initialBio: "My bio", initialCollege: "Porter" });
    expect(screen.getByPlaceholderText(/short bio/i)).toHaveValue("My bio");
    // "Porter College" also renders in the displayed profile, so scope to the
    // modal to assert the dropdown trigger reflects the current selection.
    const modal = screen.getByRole("heading", { name: /edit your profile/i }).closest("div.fixed") as HTMLElement;
    expect(within(modal).getByText("Porter College")).toBeInTheDocument();
  });

  it("closes the modal via the Cancel button without saving", () => {
    openModal();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByRole("heading", { name: /edit your profile/i })).toBeNull();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("closes the modal when clicking the backdrop without saving", () => {
    openModal();
    const heading = screen.getByRole("heading", { name: /edit your profile/i });
    // The backdrop is the outermost overlay element.
    const backdrop = heading.closest("div.fixed");
    fireEvent.click(backdrop!);
    expect(screen.queryByRole("heading", { name: /edit your profile/i })).toBeNull();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("does not close when clicking inside the modal panel", () => {
    openModal();
    fireEvent.click(screen.getByRole("heading", { name: /edit your profile/i }));
    expect(screen.getByRole("heading", { name: /edit your profile/i })).toBeInTheDocument();
  });

  // --- Character counter ---

  it("updates the character counter as the bio is typed", () => {
    openModal();
    fireEvent.change(screen.getByPlaceholderText(/short bio/i), { target: { value: "hello" } });
    expect(screen.getByText("5/160")).toBeInTheDocument();
  });

  // --- Saving ---

  it("saves the trimmed bio and selected college, then updates the displayed profile", async () => {
    openModal({ initialBio: null, initialCollege: null });

    // Pick a college from the dropdown.
    fireEvent.click(screen.getByText("Select your college…"));
    fireEvent.click(screen.getByText("Kresge College"));

    fireEvent.change(screen.getByPlaceholderText(/short bio/i), {
      target: { value: "  trimmed bio  " },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    });

    expect(mockUpdate).toHaveBeenCalledWith({ bio: "trimmed bio", college: "Kresge" });
    expect(mockEq).toHaveBeenCalledWith("id", OWNER_ID);
    // Modal closes and the new values are reflected in the displayed profile.
    expect(screen.queryByRole("heading", { name: /edit your profile/i })).toBeNull();
    expect(screen.getByText("Kresge College")).toBeInTheDocument();
    expect(screen.getByText("trimmed bio")).toBeInTheDocument();
  });

  it("persists null when the bio is cleared and the college is set to None", async () => {
    openModal({ initialBio: "Old bio", initialCollege: "Cowell" });

    // "Cowell College" also appears in the displayed profile; click the one in
    // the modal's dropdown trigger.
    const modal = screen.getByRole("heading", { name: /edit your profile/i }).closest("div.fixed") as HTMLElement;
    fireEvent.click(within(modal).getByText("Cowell College"));
    fireEvent.click(screen.getByText("None"));

    fireEvent.change(screen.getByPlaceholderText(/short bio/i), { target: { value: "   " } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    });

    expect(mockUpdate).toHaveBeenCalledWith({ bio: null, college: null });
  });

  it("disables the Save button and shows 'Saving…' while the update is in flight", async () => {
    mockEq.mockReturnValue(new Promise(() => {})); // never resolves
    openModal();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    });

    const saving = screen.getByRole("button", { name: /saving/i });
    expect(saving).toBeInTheDocument();
    expect(saving).toBeDisabled();
  });

  it("discards draft edits when reopening after a Cancel", () => {
    openModal({ initialBio: "Original", initialCollege: null });

    fireEvent.change(screen.getByPlaceholderText(/short bio/i), { target: { value: "edited away" } });
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    // Reopen: the draft should be re-seeded from the saved bio, not the discarded edit.
    fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    expect(screen.getByPlaceholderText(/short bio/i)).toHaveValue("Original");
  });
});
