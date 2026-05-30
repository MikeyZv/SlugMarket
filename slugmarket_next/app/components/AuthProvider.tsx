"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

// This file provides an AuthProvider component that manages user authentication state using Supabase.
// It also exports a useAuth hook for easy access to auth state in any component.

type AuthContextValue = {
    user: User | null;
    session: Session | null;
    loading: boolean;
    avatarUrl: string | null;
    setAvatarUrl: (url: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// The AuthProvider component initializes the authentication state by checking for an existing session and listening for auth state changes. 
// It also fetches the user's avatar URL from the profiles table whenever the user changes. 
// The context value includes the user, session, loading state, avatar URL, and a function to update the avatar URL.
export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true

        // initialize session
        supabase.auth.getSession()
        .then(({ data, error }) => {
            if (!mounted) return
            if (error) console.error("getSession error:", error.message)
            
            setSession(data.session ?? null)
            setUser(data.session?.user ?? null)
            setLoading(false)
        })

        // listen for changes like sign in/out or token refresh
        const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
            setSession(nextSession)
            setUser(nextSession?.user ?? null)
            setLoading(false)
            if (!nextSession?.user) setAvatarUrl(null)
        })

        return () => {
            mounted = false
            listener.subscription.unsubscribe()
        }
    }, [])

    // Fetch avatar_url from profiles whenever the user changes
    useEffect(() => {
        if (!user) return
        supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", user.id)
            .single()
            .then(({ data }) => setAvatarUrl(data?.avatar_url ?? null))
    }, [user?.id])

    const value = useMemo<AuthContextValue>(
        () => ({ user, session, loading, avatarUrl, setAvatarUrl }),
        [user, session, loading, avatarUrl]
    )

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
}

// custom hook for getting context {user, session, loading}
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }
    return context
}