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
            .limit(20)
            .then(({ data}) => {
                if (data) setNotifications(data)
            })

    }, [user])

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
                className="relative flex flex-col items-center text-gray-700 hover:text-blue-600"
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
                <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    {notifications.length === 0
                        ? <p className="p-4 text-sm text-gray-500">No notifications</p>
                        : notifications.map((n) => 
                            <div key={n.id} className={`px-4 py-3 text-sm border-b last:border-0 ${n.read ? "text-gray-500" : "font-semibold text-gray-800"}`}>
                                {n.message}
                            </div>
                        )
                    }
                </div>
            )}
        </div>
    )
}