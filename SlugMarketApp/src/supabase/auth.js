import { supabase } from "./supabase.js"

// signup function
export const signUp = async (email, password) => {
    return await supabase.auth.signUp({ email, password })
}

// login function
export const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password })
}

// logout function
export const signOut = async () => {
    return await supabase.auth.signOut()
}