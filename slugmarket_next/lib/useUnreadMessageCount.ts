
"use client";
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function useUnreadMessageCount(userId: string | undefined) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!userId) return

        async function fetchCount() {
            // get conversations with other people
            const { data: convos } = await supabase
                .from("conversations")
                .select("id")
                .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

            // if no conversations exist, unread message count = 0, then return
            if (!convos?.length) {
                setCount(0)
                return
            }

            // count each row of messages that correspond to list of convo.id we just fetched
            // that user is not the sender and message has not been read yet
            const { count } = await supabase
                .from("messages")
                .select("*", { count: "exact", head: true })
                .in("conversation_id", convos.map((c) => c.id))
                .neq("sender_id", userId)
                .is("read_at", null)

            setCount(count ?? 0)
        }

        fetchCount()

        // real time update when new messages are added or user reads messages
        const channel = supabase
            .channel(`unread-messages:${userId}:${crypto.randomUUID()}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",

                },
                () => fetchCount()
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "messages",

                },
                () => fetchCount()
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [userId])

    return count
}