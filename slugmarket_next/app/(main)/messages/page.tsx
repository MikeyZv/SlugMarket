"use client";

import { useState } from "react";

// Mock conversation data — replace with real Supabase queries later
const mockConversations = [
  {
    id: 1,
    username: "banana_slug",
    avatar: "B",
    lastMessage: "Is the mini fridge still available?",
    timestamp: "2h ago",
    unread: true,
  },
  {
    id: 2,
    username: "slug_lord",
    avatar: "S",
    lastMessage: "I can do $20 for the lamp.",
    timestamp: "Yesterday",
    unread: false,
  },
  {
    id: 3,
    username: "comet42",
    avatar: "C",
    lastMessage: "Thanks! I'll pick it up tomorrow.",
    timestamp: "Mon",
    unread: false,
  },
];

// Mock messages for the selected conversation
const mockMessages: Record<number, { from: "me" | "them"; text: string }[]> = {
  1: [
    { from: "them", text: "Hey, is the mini fridge still available?" },
    { from: "me", text: "Yes it is! Are you interested?" },
    { from: "them", text: "Is the mini fridge still available?" },
  ],
  2: [
    { from: "them", text: "Hey, would you take $20 for the lamp?" },
    { from: "me", text: "Sure, that works!" },
    { from: "them", text: "I can do $20 for the lamp." },
  ],
  3: [
    { from: "me", text: "Payment received, see you tomorrow!" },
    { from: "them", text: "Thanks! I'll pick it up tomorrow." },
  ],
};

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");

  function handleSelectConvo(id: number) {
    setSelectedId(id);
    setMobileView("thread");
  }

  const selected = mockConversations.find((c) => c.id === selectedId);
  const messages = selectedId ? mockMessages[selectedId] ?? [] : [];

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="flex border border-gray-200 rounded-xl overflow-hidden h-[600px] shadow-sm">

        {/* Conversation list — hidden on mobile when a thread is open */}
        <div className={`${mobileView === "thread" ? "hidden sm:flex" : "flex"} flex-col w-full sm:w-72 border-r border-gray-200 overflow-y-auto flex-shrink-0`}>
          {mockConversations.map((convo) => (
            <button
              key={convo.id}
              onClick={() => handleSelectConvo(convo.id)}
              className={`w-full text-left px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                selectedId === convo.id ? "bg-yellow-50 border-l-4 border-l-yellow-400" : ""
              }`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                {convo.avatar}
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 text-sm">@{convo.username}</span>
                  <span className="text-xs text-gray-400 ml-2">{convo.timestamp}</span>
                </div>
                <p className={`text-xs truncate mt-0.5 ${convo.unread ? "font-semibold text-gray-800" : "text-gray-500"}`}>
                  {convo.lastMessage}
                </p>
              </div>
              {/* Unread indicator */}
              {convo.unread && (
                <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0 ml-auto" />
              )}
            </button>
          ))}
        </div>

        {/* Message thread — hidden on mobile when list is shown */}
        <div className={`${mobileView === "list" ? "hidden sm:flex" : "flex"} flex-col flex-1`}>
          {selected ? (
            <>
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileView("list")}
                  className="sm:hidden text-blue-600 text-sm font-medium"
                >
                  ← Back
                </button>
                <span className="font-semibold text-gray-900">@{selected.username}</span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                      msg.from === "me"
                        ? "bg-yellow-400 text-gray-900 self-end rounded-br-none"
                        : "bg-gray-100 text-gray-800 self-start rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setInput("")}
                  placeholder="Type a message…"
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  onClick={() => setInput("")}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-full text-sm transition-colors"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            // Empty state when no conversation is selected
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
