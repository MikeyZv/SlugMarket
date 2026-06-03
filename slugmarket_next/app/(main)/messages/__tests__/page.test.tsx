import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MessagesPage from "../page";
import * as AuthProvider from "@/app/components/AuthProvider";
import type { Conversation, Message } from "@/lib/types";

const mockReplace = vi.hoisted(() => vi.fn());
const mockSearchParams = vi.hoisted(() => vi.fn(() => new URLSearchParams()));

// Conversations query chain: .from("conversations").select().or().order()
const mockConvosOrder = vi.hoisted(() => vi.fn());
const mockConvosOr = vi.hoisted(() => vi.fn(() => ({ order: mockConvosOrder })));
const mockConvosSelect = vi.hoisted(() => vi.fn(() => ({ or: mockConvosOr })));

// Messages fetch chain: .from("messages").select().eq().order()
const mockMsgsOrder = vi.hoisted(() => vi.fn());
const mockMsgsSelectEq = vi.hoisted(() => vi.fn(() => ({ order: mockMsgsOrder })));
const mockMsgsSelect = vi.hoisted(() => vi.fn(() => ({ eq: mockMsgsSelectEq })));

// Messages read-update chain: .from("messages").update().eq().neq().is()
const mockMsgsIs = vi.hoisted(() => vi.fn());
const mockMsgsNeq = vi.hoisted(() => vi.fn(() => ({ is: mockMsgsIs })));
const mockMsgsUpdateEq = vi.hoisted(() => vi.fn(() => ({ neq: mockMsgsNeq })));
const mockMsgsUpdate = vi.hoisted(() => vi.fn(() => ({ eq: mockMsgsUpdateEq })));

// Messages insert
const mockMsgsInsert = vi.hoisted(() => vi.fn());

// Offers update chain: .from("offers").update().eq()
const mockOffersEq = vi.hoisted(() => vi.fn());
const mockOffersUpdate = vi.hoisted(() => vi.fn(() => ({ eq: mockOffersEq })));

// Routes from() calls by table name
const mockFrom = vi.hoisted(() => vi.fn((table: string) => {
  if (table === "conversations") return { select: mockConvosSelect };
  if (table === "messages") return { select: mockMsgsSelect, update: mockMsgsUpdate, insert: mockMsgsInsert };
  if (table === "offers") return { update: mockOffersUpdate };
  return {};
}));

// Realtime channel mocks
const mockSubscribe = vi.hoisted(() => vi.fn());
const mockOn = vi.hoisted(() => vi.fn());
const mockChannelObj = vi.hoisted(() => ({ on: mockOn, subscribe: mockSubscribe }));
const mockChannel = vi.hoisted(() => vi.fn(() => mockChannelObj));
const mockRemoveChannel = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: mockSearchParams,
}));

vi.mock("@/app/components/AuthProvider");

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: mockFrom,
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  },
}));

vi.mock("@/app/components/ConversationList", () => ({
  default: ({ conversations, loadingConvos, onSelect }: {
    conversations: Conversation[];
    loadingConvos: boolean;
    onSelect: (id: string) => void;
  }) => (
    <div data-testid="conversation-list">
      {loadingConvos && <span>Loading conversations…</span>}
      {conversations.map((c) => (
        <button key={c.id} onClick={() => onSelect(c.id)}>convo-{c.id}</button>
      ))}
    </div>
  ),
}));

vi.mock("@/app/components/MessageThread", () => ({
  default: ({ messages, input, onInputChange, onSend, onBack, onOfferStatusChange }: {
    messages: Message[];
    input: string;
    onInputChange: (val: string) => void;
    onSend: () => void;
    onBack: () => void;
    onOfferStatusChange: (offerId: string, status: "accepted" | "declined") => void;
  }) => (
    <div data-testid="message-thread">
      {messages.map((m) => (
        <div key={m.id}>
          <span>{m.body}</span>
          {m.offer_id && m.offer && (
            <>
              <button onClick={() => onOfferStatusChange(m.offer!.id, "accepted")}>Accept offer</button>
              <button onClick={() => onOfferStatusChange(m.offer!.id, "declined")}>Decline offer</button>
            </>
          )}
        </div>
      ))}
      <input placeholder="Type a message…" value={input} onChange={(e) => onInputChange(e.target.value)} />
      <button onClick={onSend}>Send</button>
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

const mockUser = { id: "user-1", email: "test@ucsc.edu" } as ReturnType<typeof AuthProvider.useAuth>["user"];

const mockConversation: Conversation = {
  id: "convo-1",
  user1_id: "user-1",
  user2_id: "user-2",
  updated_at: "2024-01-01T00:00:00Z",
  last_message_body: "Hello",
  last_message_at: "2024-01-01T00:00:00Z",
  user1: { username: "alice", avatar_url: null },
  user2: { username: "bob", avatar_url: null },
};

const mockMessage: Message = {
  id: "msg-1",
  conversation_id: "convo-1",
  sender_id: "user-2",
  body: "Hi there",
  created_at: "2024-01-01T00:00:00Z",
  read_at: null,
  offer_id: null,
};

const mockMessageWithOffer: Message = {
  id: "msg-2",
  conversation_id: "convo-1",
  sender_id: "user-2",
  body: "",
  created_at: "2024-01-01T00:01:00Z",
  read_at: null,
  offer_id: "offer-1",
  offer: {
    id: "offer-1",
    amount: 50,
    status: "pending",
    seller_id: "user-1",
    buyer_id: "user-2",
    listing: { id: "listing-1", title: "Item", image_urls: [] },
  },
};

describe("MessagesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(AuthProvider.useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
    } as ReturnType<typeof AuthProvider.useAuth>);

    mockSearchParams.mockReturnValue(new URLSearchParams());
    mockConvosOrder.mockResolvedValue({ data: [mockConversation] });
    mockMsgsOrder.mockResolvedValue({ data: [mockMessage] });
    mockMsgsIs.mockResolvedValue({});
    mockMsgsInsert.mockResolvedValue({});
    mockOffersEq.mockResolvedValue({});
    mockOn.mockReturnValue(mockChannelObj);
    mockSubscribe.mockReturnValue(mockChannelObj);
  });

  // --- Auth behavior ---

  it("renders nothing while auth is loading", () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({ user: null, loading: true } as ReturnType<typeof AuthProvider.useAuth>);
    const { container } = render(<MessagesPage />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing and redirects to /signin when unauthenticated", async () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({ user: null, loading: false } as ReturnType<typeof AuthProvider.useAuth>);
    const { container } = render(<MessagesPage />);
    expect(container).toBeEmptyDOMElement();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/signin"));
  });

  // --- Conversation loading ---

  it("renders the Messages heading", async () => {
    render(<MessagesPage />);
    await waitFor(() => expect(screen.getByText("Messages")).toBeInTheDocument());
  });

  it("shows a loading indicator while conversations are being fetched", async () => {
    mockConvosOrder.mockReturnValue(new Promise(() => {})); // never resolves
    render(<MessagesPage />);
    await waitFor(() => expect(screen.getByText("Loading conversations…")).toBeInTheDocument());
  });

  it("fetches conversations on mount and renders them", async () => {
    render(<MessagesPage />);
    await waitFor(() => expect(screen.getByText("convo-convo-1")).toBeInTheDocument());
    expect(mockFrom).toHaveBeenCalledWith("conversations");
  });

  // --- URL search param ---

  it("selects the conversation from the ?c URL param and shows the thread", async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams("c=convo-1"));
    render(<MessagesPage />);
    await waitFor(() => expect(screen.getByTestId("message-thread")).toBeInTheDocument());
  });

  // --- Conversation selection ---

  it("shows a placeholder when no conversation is selected", async () => {
    render(<MessagesPage />);
    await waitFor(() => expect(screen.getByText("Select a conversation to start messaging")).toBeInTheDocument());
  });

  it("updates the URL when a conversation is selected", async () => {
    render(<MessagesPage />);
    await waitFor(() => screen.getByText("convo-convo-1"));
    fireEvent.click(screen.getByText("convo-convo-1"));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/messages?c=convo-1", { scroll: false }));
  });

  it("shows the MessageThread after a conversation is selected", async () => {
    render(<MessagesPage />);
    await waitFor(() => screen.getByText("convo-convo-1"));
    fireEvent.click(screen.getByText("convo-convo-1"));
    await waitFor(() => expect(screen.getByTestId("message-thread")).toBeInTheDocument());
  });

  // --- Message loading ---

  it("fetches messages for the selected conversation", async () => {
    render(<MessagesPage />);
    await waitFor(() => screen.getByText("convo-convo-1"));
    fireEvent.click(screen.getByText("convo-convo-1"));
    await waitFor(() => expect(screen.getByText("Hi there")).toBeInTheDocument());
    expect(mockMsgsSelectEq).toHaveBeenCalledWith("conversation_id", "convo-1");
  });

  it("marks unread messages as read when a conversation is opened", async () => {
    render(<MessagesPage />);
    await waitFor(() => screen.getByText("convo-convo-1"));
    fireEvent.click(screen.getByText("convo-convo-1"));
    await waitFor(() => expect(mockMsgsIs).toHaveBeenCalled());
    expect(mockMsgsNeq).toHaveBeenCalledWith("sender_id", "user-1");
    expect(mockMsgsUpdateEq).toHaveBeenCalledWith("conversation_id", "convo-1");
  });

  // --- Realtime ---

  it("subscribes to a realtime channel for the selected conversation", async () => {
    render(<MessagesPage />);
    await waitFor(() => screen.getByText("convo-convo-1"));
    fireEvent.click(screen.getByText("convo-convo-1"));
    await waitFor(() => expect(mockChannel).toHaveBeenCalledWith("messages:convo-1"));
    expect(mockSubscribe).toHaveBeenCalled();
  });

  it("removes the realtime channel when the component unmounts", async () => {
    const { unmount } = render(<MessagesPage />);
    await waitFor(() => screen.getByText("convo-convo-1"));
    fireEvent.click(screen.getByText("convo-convo-1"));
    await waitFor(() => expect(mockChannel).toHaveBeenCalled());
    unmount();
    expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannelObj);
  });

  // --- Send message ---

  it("inserts a message and clears the input on send", async () => {
    render(<MessagesPage />);
    await waitFor(() => screen.getByText("convo-convo-1"));
    fireEvent.click(screen.getByText("convo-convo-1"));

    const input = screen.getByPlaceholderText("Type a message…");
    fireEvent.change(input, { target: { value: "Hey!" } });
    fireEvent.click(screen.getByText("Send"));

    await waitFor(() =>
      expect(mockMsgsInsert).toHaveBeenCalledWith({
        conversation_id: "convo-1",
        sender_id: "user-1",
        body: "Hey!",
      })
    );
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("does not send when the input is empty", async () => {
    render(<MessagesPage />);
    await waitFor(() => screen.getByText("convo-convo-1"));
    fireEvent.click(screen.getByText("convo-convo-1"));
    await waitFor(() => screen.getByTestId("message-thread"));
    fireEvent.click(screen.getByText("Send"));
    await waitFor(() => expect(mockMsgsInsert).not.toHaveBeenCalled());
  });

  it("does not send when the input is only whitespace", async () => {
    render(<MessagesPage />);
    await waitFor(() => screen.getByText("convo-convo-1"));
    fireEvent.click(screen.getByText("convo-convo-1"));
    await waitFor(() => screen.getByTestId("message-thread"));
    fireEvent.change(screen.getByPlaceholderText("Type a message…"), { target: { value: "   " } });
    fireEvent.click(screen.getByText("Send"));
    await waitFor(() => expect(mockMsgsInsert).not.toHaveBeenCalled());
  });

  // --- Offer status ---

  it("updates offer status via supabase when accepting an offer", async () => {
    mockMsgsOrder.mockResolvedValue({ data: [mockMessageWithOffer] });
    render(<MessagesPage />);
    await waitFor(() => screen.getByText("convo-convo-1"));
    fireEvent.click(screen.getByText("convo-convo-1"));
    await waitFor(() => screen.getByText("Accept offer"));
    fireEvent.click(screen.getByText("Accept offer"));
    await waitFor(() => expect(mockOffersEq).toHaveBeenCalledWith("id", "offer-1"));
    expect(mockOffersUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: "accepted" }));
  });

  it("updates offer status via supabase when declining an offer", async () => {
    mockMsgsOrder.mockResolvedValue({ data: [mockMessageWithOffer] });
    render(<MessagesPage />);
    await waitFor(() => screen.getByText("convo-convo-1"));
    fireEvent.click(screen.getByText("convo-convo-1"));
    await waitFor(() => screen.getByText("Decline offer"));
    fireEvent.click(screen.getByText("Decline offer"));
    await waitFor(() => expect(mockOffersEq).toHaveBeenCalledWith("id", "offer-1"));
    expect(mockOffersUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: "declined" }));
  });
});
