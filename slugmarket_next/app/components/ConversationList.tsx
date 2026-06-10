"use client"

import type { Conversation } from "@/lib/types"
import { formatTime } from "@/lib/utils"

// This component renders the list of conversations on the left side of the messaging page. 
// It shows the other user's name, avatar, and a preview of the last message. 
// It also handles the loading state and empty state when there are no conversations.
type Props = {
    conversations: Conversation[]
    selectedId: string | null
    loadingConvos: boolean
    mobileView: "list" | "thread"
    userId: string
    onSelect: (id: string) => void
}

export default function ConversationList({ conversations, selectedId, loadingConvos, mobileView, userId, onSelect }: Props) {
    return (
        <div className={`${mobileView === "thread" ? "hidden min-[770px]:flex" : "flex"} flex-col w-full min-[770px]:w-72 border-r border-gray-200 overflow-y-auto flex-shrink-0`}>
            {loadingConvos ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
            ) : conversations.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm px-4 text-center">No messages yet. Start a conversation from a listing.</div>
            ) : (
                conversations.map((convo) => {
                    const other = convo.user1_id === userId ? convo.user2 : convo.user1
                    return (
                        <button
                            key={convo.id}
                            onClick={() => onSelect(convo.id)}
                            className={`w-full text-left px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer ${selectedId === convo.id ? "bg-yellow-50 border-l-4 border-l-yellow-400" : ""}`}
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
                                <p className="text-xs truncate mt-0.5 text-gray-500">{convo.last_message_body ?? "No messages yet"}</p>
                            </div>
                        </button>
                    )
                })
            )}
        </div>
    )
}
