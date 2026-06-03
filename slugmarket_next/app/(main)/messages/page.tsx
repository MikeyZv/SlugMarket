"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/app/components/AuthProvider"
import type { Conversation, Message, OfferDetails } from "@/lib/types"
import ConversationList from "@/app/components/ConversationList"
import MessageThread from "@/app/components/MessageThread"

function MessagesContent() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [loadingConvos, setLoadingConvos] = useState(true)
    const [mobileView, setMobileView] = useState<"list" | "thread">("list")
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!authLoading && !user) router.replace("/signin")
    }, [authLoading, user, router])

    useEffect(() => {
        if (!user) return
        async function load() {
            const { data } = await supabase
                .from("conversations")
                .select(`
                    id, user1_id, user2_id, updated_at, last_message_body, last_message_at,
                    user1:profiles!conversations_user1_id_fkey(username, avatar_url),
                    user2:profiles!conversations_user2_id_fkey(username, avatar_url)
                `)
                .or(`user1_id.eq.${user!.id},user2_id.eq.${user!.id}`)
                .order("updated_at", { ascending: false })
            if (data) setConversations(data as unknown as Conversation[])
            setLoadingConvos(false)
        }
        load()
    }, [user])

    useEffect(() => {
        const c = searchParams.get("c")
        if (c) { setSelectedId(c); setMobileView("thread") }
    }, [searchParams, conversations])

    useEffect(() => {
        if (!selectedId || !user) return
        setMessages([])

        async function load() {
            const { data } = await supabase
                .from("messages")
                .select(`
                    id, conversation_id, sender_id, body, created_at, read_at, offer_id,
                    offer:offers(id, amount, status, seller_id, buyer_id, created_at, listing:product_listings(id, title, image_urls))
                `)
                .eq("conversation_id", selectedId)
                .order("created_at", { ascending: true })
            if (data) setMessages(data as unknown as Message[])
            await supabase
                .from("messages")
                .update({ read_at: new Date().toISOString() })
                .eq("conversation_id", selectedId)
                .neq("sender_id", user!.id)
                .is("read_at", null)
        }
        load()

        const channel = supabase
            .channel(`messages:${selectedId}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedId}` },
                async (payload) => {
                    const raw = payload.new as Message
                    let msg: Message = raw
                    if (raw.offer_id) {
                        const { data: offer } = await supabase
                            .from("offers")
                            .select("id, amount, status, seller_id, buyer_id, listing:product_listings(id, title)")
                            .eq("id", raw.offer_id)
                            .single()
                        msg = { ...raw, offer: offer as OfferDetails | null }
                    }
                    setMessages((prev) => [...prev, msg])
                    setConversations((prev) =>
                        prev.map((c) => c.id === selectedId
                            ? { ...c, last_message_body: msg.body, last_message_at: msg.created_at, updated_at: msg.created_at }
                            : c
                        )
                    )
                }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [selectedId, user])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    async function sendMessage() {
        if (!input.trim() || !selectedId || !user) return
        const body = input.trim()
        setInput("")
        await supabase.from("messages").insert({ conversation_id: selectedId, sender_id: user.id, body })
    }

    async function handleOfferStatusChange(offerId: string, status: "accepted" | "declined") {
        const {data: offer} = await supabase.from("offers").update({ status, updated_at: new Date().toISOString() }).eq("id", offerId).select("buyer_id, seller_id, amount").single()
        setMessages((prev) =>
            prev.map((msg) => msg.offer?.id === offerId ? { ...msg, offer: { ...msg.offer!, status } } : msg)
        )

        if (offer) {
          await supabase.from("notifications").insert({
            user_id: offer.buyer_id,
            message: status === "accepted"
              ? `Your offer of ${Number(offer.amount).toLocaleString()} was accepted!`
              : `Your offer of ${Number(offer.amount).toLocaleString()} was declined.`,
            link: `/messages?c=${offer.seller_id}`
          })
        }

    }

    function handleSelectConvo(id: string) {
        setSelectedId(id)
        setMobileView("thread")
        router.replace(`/messages?c=${id}`, { scroll: false })
    }

    if (authLoading || !user) return null

    const selected = conversations.find((c) => c.id === selectedId)

    return (
        <main className="max-w-5xl mx-auto px-6 py-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
            <div className="flex border border-gray-200 rounded-xl overflow-hidden h-[600px] shadow-sm">
                <ConversationList conversations={conversations} selectedId={selectedId} loadingConvos={loadingConvos} mobileView={mobileView} userId={user.id} onSelect={handleSelectConvo} />
                <div className={`${mobileView === "list" ? "hidden min-[770px]:flex" : "flex"} flex-col flex-1`}>
                    {selected ? (
                        <MessageThread selected={selected} messages={messages} userId={user.id} mobileView={mobileView} onBack={() => setMobileView("list")} bottomRef={bottomRef} input={input} onInputChange={setInput} onSend={sendMessage} onOfferStatusChange={handleOfferStatusChange} />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Select a conversation to start messaging</div>
                    )}
                </div>
            </div>
        </main>
    )
}

export default function MessagesPage() {
    return (
        <Suspense fallback={null}>
            <MessagesContent />
        </Suspense>
    )
}
