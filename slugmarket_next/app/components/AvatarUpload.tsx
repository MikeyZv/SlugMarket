"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

interface AvatarUploadProps {
  profileId: string;
  username: string;
  avatarUrl: string | null;
}

export default function AvatarUpload({ profileId, username, avatarUrl }: AvatarUploadProps) {
  const { user, setAvatarUrl } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(avatarUrl);

  // Sync when server re-renders with updated avatarUrl (after router.refresh())
  useEffect(() => {
    setCurrentUrl(avatarUrl);
  }, [avatarUrl]);

  const isOwner = user?.id === profileId;

  // Handle file selection and upload process
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Create a temporary URL for immediate preview while uploading
    const blobUrl = URL.createObjectURL(file);
    setCurrentUrl(blobUrl);
    setUploading(true);
    setError(null);

    // Upload to Supabase Storage and update profile with new avatar URL
    try {
      const storagePath = `${profileId}/avatar`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(storagePath, file, { upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(storagePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profileId);

      if (updateError) throw new Error(updateError.message);

      // Only update UI and context after both storage upload and DB write succeed
      URL.revokeObjectURL(blobUrl);
      const timedUrl = `${publicUrl}?t=${Date.now()}`;
      setCurrentUrl(timedUrl);
      setAvatarUrl(timedUrl);

      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      console.error("Avatar upload error:", message);
      setError(message);
      setCurrentUrl(avatarUrl);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="relative w-24 h-24 shrink-0">
      <div className="w-24 h-24 rounded-full bg-[#F5C518] border-4 border-white flex items-center justify-center text-3xl font-bold text-[#0F2044] overflow-hidden shadow-sm">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={`${username}'s avatar`}
            className="w-full h-full object-cover"
          />
        ) : (
          username[0].toUpperCase()
        )}
      </div>

      {isOwner && (
        <>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Change profile picture"
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#0F2044] border-2 border-white flex items-center justify-center shadow hover:bg-[#162d5a] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <span className="text-white font-bold text-base leading-none">+</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}

      {uploading && (
        <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center border-4 border-white">
          <span className="text-white text-xs">…</span>
        </div>
      )}

      {error && (
        <p className="absolute top-full mt-1 left-0 text-xs text-red-500 whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  );
}
