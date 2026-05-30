"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/components/AuthProvider";
import { formatTime } from "@/lib/utils";

type Profile = { username: string; avatar_url: string | null };

// Conversation type includes the IDs of the two users involved, the last message details for previewing in the conversation list, and the related user profiles for displaying usernames and avatars. 
// This structure allows us to efficiently display a list of conversations with relevant information without needing to load all messages upfront.
type Conversation = {
  id: string;
  user1_id: string;
  user2_id: string;
  updated_at: string;
  last_message_body: string | null;
  last_message_at: string | null;
  user1: Profile;
  user2: Profile;
};

// OfferDetails includes the offer amount, status, related listing information, and the IDs of the buyer and seller. 
// This is used to display offer messages in the conversation thread and allow sellers to accept or decline offers directly from the message thread.
type OfferDetails = {
  id: string;
  amount: number;
  status: "pending" | "accepted" | "declined" | "withdrawn";
  seller_id: string;
  buyer_id: string;
  listing: { id: string; title: string } | null;
};

// Message type includes the message body, sender information, timestamps, and optionally related offer details if the message is an offer. 
// This allows us to display both regular text messages and offer messages in the conversation thread with all necessary information for rendering and interactions.
type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  offer_id: string | null;
  offer?: OfferDetails | null;
};

// OfferCard component displays an offer message within the conversation thread. 
// It shows the offer amount, status, and related listing information. 
// If the current user is the seller and the offer is pending, it also provides buttons to accept or decline the offer, allowing for quick interactions directly from the message thread.
function OfferCard({
  offer,
  isFromMe,
  currentUserId,
  onStatusChange,
}: {
  offer: OfferDetails;
  isFromMe: boolean;
  currentUserId: string;
  onStatusChange: (offerId: string, status: "accepted" | "declined") => void;
}) {
  const isSeller = currentUserId === offer.seller_id;
  const isPending = offer.status === "pending";

  const statusColor =
    offer.status === "accepted"
      ? "text-green-600"
      : offer.status === "declined"
      ? "text-red-500"
      : "text-gray-400";

  return (
    <div className={`w-64 rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow-sm ${isFromMe ? "self-end" : "self-start"}`}>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Offer</p>
      {offer.listing && (
        <a
          href={`/products/${offer.listing.id}`}
          className="font-semibold text-gray-900 text-sm hover:underline line-clamp-2 block mb-2"
        >
          {offer.listing.title}
        </a>
      )}
      <p className="text-2xl font-bold text-gray-900">${Number(offer.amount).toLocaleString()}</p>
      <p className={`text-xs font-medium mt-0.5 capitalize ${statusColor}`}>{offer.status}</p>
      {isSeller && isPending && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onStatusChange(offer.id, "accepted")}
            className="flex-1 bg-green-500 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition"
          >
            Accept
          </button>
          <button
            onClick={() => onStatusChange(offer.id, "declined")}
            className="flex-1 bg-gray-100 text-gray-700 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
}

// MessagesContent component handles the main logic for the messages page, including loading conversations, selecting a 
// conversation, loading messages for the selected conversation, sending new messages, and handling offer status changes. 
// It also manages the responsive layout for mobile and desktop views.
function MessagesContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/signin");
  }, [authLoading, user, router]);

  // Load conversations for the current user when the component mounts. 
  // It fetches conversations where the user is either user1 or user2, along with the related user profiles for displaying usernames and avatars in the conversation list. 
  // Conversations are ordered by the last update time to show the most recent conversations first.
  useEffect(() => {
    if (!user) return;

    async function load() {
      const { data } = await supabase
        .from("conversations")
        .select(`
          id, user1_id, user2_id, updated_at, last_message_body, last_message_at,
          user1:profiles!conversations_user1_id_fkey(username, avatar_url),
          user2:profiles!conversations_user2_id_fkey(username, avatar_url)
        `)
        .or(`user1_id.eq.${user!.id},user2_id.eq.${user!.id}`)
        .order("updated_at", { ascending: false });

      if (data) setConversations(data as unknown as Conversation[]);
      setLoadingConvos(false);
    }

    load();
  }, [user]);

  // When the search parameter "c" (conversation ID) changes, select the corresponding conversation and switch to the thread view on mobile. 
  // This allows deep linking to specific conversations and ensures that the correct conversation is displayed when navigating directly to a URL with a conversation ID.
  useEffect(() => {
    const c = searchParams.get("c");
    if (c) {
      setSelectedId(c);
      setMobileView("thread");
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    if (!selectedId || !user) return;
    setMessages([]);

    // Load messages for the selected conversation. It fetches messages along with related offer details if the message is an offer. 
    // After loading messages, it also marks all messages from the other user as read by updating the read_at timestamp, ensuring that the conversation's read status is accurate.
    async function load() {
      const { data } = await supabase
        .from("messages")
        .select(`
          id, conversation_id, sender_id, body, created_at, read_at, offer_id,
          offer:offers(id, amount, status, seller_id, buyer_id, listing:product_listings(id, title))
        `)
        .eq("conversation_id", selectedId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data as unknown as Message[]);

      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", selectedId)
        .neq("sender_id", user!.id)
        .is("read_at", null);
    }

    load();

    // Set up real-time subscription to new messages in the selected conversation. 
    // When a new message is inserted, it checks if it's related to an offer and fetches the offer details if necessary, then updates the messages state and the conversation's last message preview. 
    // The subscription is cleaned up when the component unmounts or when the selected conversation changes to avoid memory leaks and ensure that we are only subscribed to the relevant conversation.
    const channel = supabase
      .channel(`messages:${selectedId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedId}` },
        async (payload) => {
          const raw = payload.new as Message;
          let msg: Message = raw;

          if (raw.offer_id) {
            const { data: offer } = await supabase
              .from("offers")
              .select("id, amount, status, seller_id, buyer_id, listing:product_listings(id, title)")
              .eq("id", raw.offer_id)
              .single();
            msg = { ...raw, offer: offer as OfferDetails | null };
          }

          setMessages((prev) => [...prev, msg]);
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedId
                ? { ...c, last_message_body: msg.body, last_message_at: msg.created_at, updated_at: msg.created_at }
                : c
            )
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedId, user]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a new message by inserting it into the database. 
  // It checks that the input is not empty, that a conversation is selected, and that the user is authenticated before sending. 
  // After sending the message, it clears the input field. The real-time subscription will handle adding the new message to the thread and updating the conversation preview.
  async function sendMessage() {
    if (!input.trim() || !selectedId || !user) return;
    const body = input.trim();
    setInput("");
    await supabase.from("messages").insert({ conversation_id: selectedId, sender_id: user.id, body });
  }

  // Handle offer status changes by updating the offer's status in the database and then updating the local messages state to reflect the new status. 
  // This allows for real-time updates to offer messages in the conversation thread when a seller accepts or declines an offer, providing immediate feedback to both parties.
  async function handleOfferStatusChange(offerId: string, status: "accepted" | "declined") {
    await supabase
      .from("offers")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", offerId);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.offer?.id === offerId ? { ...msg, offer: { ...msg.offer!, status } } : msg
      )
    );
  }

  // Handle selecting a conversation by updating the selected conversation ID, switching to the thread view on mobile, and updating the URL with the selected conversation ID.
  function handleSelectConvo(id: string) {
    setSelectedId(id);
    setMobileView("thread");
    router.replace(`/messages?c=${id}`, { scroll: false });
  }

  if (authLoading || !user) return null;

  const selected = conversations.find((c) => c.id === selectedId);

  // Helper function to get the other user's profile in a conversation. 
  // It checks if the current user is user1 or user2 in the conversation and returns the opposite profile for displaying the other user's information in the conversation list and thread header.
  function getOtherUser(convo: Conversation): Profile {
    return convo.user1_id === user!.id ? convo.user2 : convo.user1;
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="flex border border-gray-200 rounded-xl overflow-hidden h-[600px] shadow-sm">
        {/* Conversation list */}
        <div
          className={`${
            mobileView === "thread" ? "hidden min-[770px]:flex" : "flex"
          } flex-col w-full min-[770px]:w-72 border-r border-gray-200 overflow-y-auto flex-shrink-0`}
        >
          {loadingConvos ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm px-4 text-center">
              No messages yet. Start a conversation from a listing.
            </div>
          ) : (
            conversations.map((convo) => {
              const other = getOtherUser(convo);
              return (
                <button
                  key={convo.id}
                  onClick={() => handleSelectConvo(convo.id)}
                  className={`w-full text-left px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    selectedId === convo.id ? "bg-yellow-50 border-l-4 border-l-yellow-400" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                    {other.avatar_url ? (
                      <img src={other.avatar_url} alt={other.username} className="w-full h-full object-cover" />
                    ) : (
                      other.username[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 text-sm">@{other.username}</span>
                      {convo.last_message_at && (
                        <span className="text-xs text-gray-400 ml-2">{formatTime(convo.last_message_at)}</span>
                      )}
                    </div>
                    <p className="text-xs truncate mt-0.5 text-gray-500">
                      {convo.last_message_body ?? "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Message thread */}
        <div
          className={`${
            mobileView === "list" ? "hidden min-[770px]:flex" : "flex"
          } flex-col flex-1`}
        >
          {selected ? (
            <>
              <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileView("list")}
                  className="min-[770px]:hidden text-blue-600 text-sm font-medium"
                >
                  ← Back
                </button>
                <span className="font-semibold text-gray-900">@{getOtherUser(selected).username}</span>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                {messages.map((msg) =>
                  msg.offer_id && msg.offer ? (
                    <OfferCard
                      key={msg.id}
                      offer={msg.offer}
                      isFromMe={msg.sender_id === user.id}
                      currentUserId={user.id}
                      onStatusChange={handleOfferStatusChange}
                    />
                  ) : (
                    <div
                      key={msg.id}
                      className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                        msg.sender_id === user.id
                          ? "bg-yellow-400 text-gray-900 self-end rounded-br-none"
                          : "bg-gray-100 text-gray-800 self-start rounded-bl-none"
                      }`}
                    >
                      {msg.body}
                    </div>
                  )
                )}
                <div ref={bottomRef} />
              </div>

              <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message…"
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  onClick={sendMessage}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-full text-sm transition-colors"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// MessagesPage component is the main entry point for the messages page. 
// It uses Suspense to lazily load the MessagesContent component, which contains all the logic and UI for displaying conversations and message threads. 
// This allows for better performance by only loading the messages functionality when needed.
export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesContent />
    </Suspense>
  );
}
