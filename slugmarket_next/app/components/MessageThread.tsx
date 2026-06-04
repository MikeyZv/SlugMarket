"use client"

import { type RefObject } from "react"
import type { Conversation, Message } from "@/lib/types"
import { formatTime } from "@/lib/utils"
import OfferCard from "./OfferCard"
import Link from "next/link"

type Props = {
    selected: Conversation
    messages: Message[]
    userId: string
    mobileView: "list" | "thread"
    onBack: () => void
    bottomRef: RefObject<HTMLDivElement | null>
    input: string
    onInputChange: (val: string) => void
    onSend: () => void
    onOfferStatusChange: (offerId: string, status: "accepted" | "declined") => void
}

export default function MessageThread({ selected, messages, userId, onBack, bottomRef, input, onInputChange, onSend, onOfferStatusChange }: Props) {
    const otherUser = selected.user1_id === userId ? selected.user2 : selected.user1

    return (
        <>
            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
                <button type="button" onClick={onBack} className="min-[770px]:hidden text-blue-600 text-sm font-medium">← Back</button>
                <Link
                    href={`/${otherUser.username}`}
                    className="font-semibold text-gray-900"
                >
                    @{otherUser.username}
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                {messages.map((msg) => {
                    const isFromMe = msg.sender_id === userId
                    return (
                        <div key={msg.id} className={`flex flex-col ${isFromMe ? "items-end" : "items-start"}`}>
                            {msg.offer_id && msg.offer ? (
                                <OfferCard offer={msg.offer} isFromMe={isFromMe} currentUserId={userId} onStatusChange={onOfferStatusChange} />
                            ) : (
                                <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${isFromMe ? "bg-yellow-400 text-gray-900 self-end rounded-br-none" : "bg-gray-100 text-gray-800 self-start rounded-bl-none"}`}>
                                    {msg.body}
                                </div>
                            )}
                            <div className="mt-1 text-[10px] text-gray-400">{formatTime(msg.created_at)}</div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSend()}
                    placeholder="Type a message…"
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button onClick={onSend} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-full text-sm transition-colors cursor-pointer">Send</button>
            </div>
        </>
    )
}
