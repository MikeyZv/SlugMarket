"use client";
import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./AuthProvider"
import type { Notification } from "@/lib/types";

// Notification bell component that shows unread count and a dropdown of notifications on click
export default function NotificationBell() {
    const { user } = useAuth()
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])

    // fetch notifications
    useEffect(() => {
        if (!user) return
        
        supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false})
            .limit(10)
            .then(({ data}) => {
                if (data) setNotifications(data)
            })

        // adding new notificatons in real time
        const channel = supabase
            .channel(`notifications:${user.id}:${crypto.randomUUID()}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    setNotifications((prev) => [payload.new as Notification, ...prev])
                }
            )
            .subscribe()
        
        return () => { supabase.removeChannel(channel)}
    }, [user?.id])

    // mark all unread notifications as read when popup opens
    useEffect(() => {
        if (!open || !user) return
        const unreadIds = notifications
            .filter((n) => !n.read)
            .map((n) => n.id)
        if (unreadIds.length === 0) return

        supabase
            .from("notifications")
            .update({ read: true })
            .in("id", unreadIds)
            .then(() => {
                setNotifications((prev) =>
                    prev.map((n) => (unreadIds.includes(n.id) ? { ...n, read: true } : n))
                )
            })
    }, [open])

    if (!user) return null

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="relative" onMouseLeave={() => setOpen(false)}>
            <button
                type="button"
                className="relative flex flex-col items-center text-gray-700 hover:text-blue-600 cursor-pointer"
                onClick={() => setOpen((o) => !o)}
                onMouseEnter={() => setOpen(true)}
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown popup */}
            {open && (
                <div className="absolute right-0 mt-0 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    {notifications.length === 0
                        ? <p className="p-4 text-sm text-gray-500">No notifications</p>
                        : notifications.map((n) => {
                            const inner = (
                                <>
                                    {n.image_url && (
                                        <img
                                            src={n.image_url}
                                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                                        />
                                    )}
                                    <span>{n.message}</span>
                                </>
                            )
                            const cls = `flex items-center gap-3 px-4 py-3 text-sm border-b last:border-0 ${n.read ? "text-gray-500" : "font-semibold text-gray-800"}`

                            return n.link
                                ? <Link
                                    key={n.id}
                                    href={n.link}
                                    onClick={() => setOpen(false)}
                                    className={cls + " hover:bg-gray-50"}
                                  >
                                    {inner}
                                  </Link>
                                : <div key={n.id} className={cls}>{inner}</div>
                        })
                    }
                </div>
            )}
        </div>
    )
}