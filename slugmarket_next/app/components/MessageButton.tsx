"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

export default function MessageButton({ otherUserId }: { otherUserId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (user?.id === otherUserId) return null;

  async function handleClick() {
    if (!user) {
      router.push("/signin");
      return;
    }

    setLoading(true);
    try {
      // Canonical ordering: smaller UUID is always user1_id
      const user1_id = user.id < otherUserId ? user.id : otherUserId;
      const user2_id = user.id < otherUserId ? otherUserId : user.id;

      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("user1_id", user1_id)
        .eq("user2_id", user2_id)
        .maybeSingle();

      if (existing) {
        router.push(`/messages?c=${existing.id}`);
        return;
      }

      const { data: created, error } = await supabase
        .from("conversations")
        .insert({ user1_id, user2_id })
        .select("id")
        .single();

      if (error) throw error;
      router.push(`/messages?c=${created.id}`);
    } catch (err) {
      console.error("Failed to open conversation:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full rounded-xl bg-[#0F2044] py-3 md:py-4 text-lg md:text-2xl font-semibold text-white shadow-sm transition hover:bg-[#162d5a] disabled:opacity-50"
    >
      {loading ? "Opening…" : "Message"}
    </button>
  );
}
