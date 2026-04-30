"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

type AuthContextValue = {
    user: User | null;
    session: Session | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

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
        })

        return () => {
            mounted = false
            listener.subscription.unsubscribe()
        }
    }, [])

    const value = useMemo<AuthContextValue>(
        () => ({ user, session, loading }
        ), [user, session, loading]
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