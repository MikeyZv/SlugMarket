"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/components/AuthProvider";

type Profile = { username: string; avatar_url: string | null };

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

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

function formatTime(ts: string) {
  const date = new Date(ts);
  const diffHours = (Date.now() - date.getTime()) / (1000 * 60 * 60);
  if (diffHours < 24) return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (diffHours < 48) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

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

  // Load conversations
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

  // Select conversation from URL param once conversations are loaded
  useEffect(() => {
    const c = searchParams.get("c");
    if (c) {
      setSelectedId(c);
      setMobileView("thread");
    }
  }, [searchParams, conversations]);

  // Load messages and subscribe to real-time when a conversation is selected
  useEffect(() => {
    if (!selectedId || !user) return;
    setMessages([]);

    async function load() {
      const { data } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, body, created_at, read_at")
        .eq("conversation_id", selectedId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data as Message[]);

      // Mark incoming unread messages as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", selectedId)
        .neq("sender_id", user!.id)
        .is("read_at", null);
    }

    load();

    const channel = supabase
      .channel(`messages:${selectedId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedId}` },
        (payload) => {
          const msg = payload.new as Message;
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

  async function sendMessage() {
    if (!input.trim() || !selectedId || !user) return;
    const body = input.trim();
    setInput("");
    await supabase.from("messages").insert({ conversation_id: selectedId, sender_id: user.id, body });
  }

  function handleSelectConvo(id: string) {
    setSelectedId(id);
    setMobileView("thread");
    router.replace(`/messages?c=${id}`, { scroll: false });
  }

  if (authLoading || !user) return null;

  const selected = conversations.find((c) => c.id === selectedId);

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
                {messages.map((msg) => (
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
                ))}
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

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesContent />
    </Suspense>
  );
}
