"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

type Props = {
    profileId: string;
    initialBio: string | null;
};

export default function BioEditor({ profileId, initialBio }: Props) {
    const { user } = useAuth();
    const [editing, setEditing] = useState(false);
    const [bio, setBio] = useState(initialBio ?? "");
    const [draft, setDraft] = useState(initialBio ?? "");
    const [saving, setSaving] = useState(false);

    const isOwner = user?.id === profileId;

    async function handleSave() {
        setSaving(true);
        await supabase.from("profiles").update({ bio: draft.trim() || null }).eq("id", profileId);
        setBio(draft.trim());
        setEditing(false);
        setSaving(false);
    }

    function handleCancel() {
        setDraft(bio);
        setEditing(false);
    }

    if (editing) {
        return (
            <div className="flex flex-col gap-2 mt-2">
                <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    maxLength={160}
                    rows={3}
                    placeholder="Write a short bio…"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2 text-sm text-gray-800 focus:border-[#3567F1] focus:outline-none resize-none"
                />
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-[#3567F1] text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-[#2f5de0] transition disabled:opacity-50"
                    >
                        {saving ? "Saving…" : "Save"}
                    </button>
                    <button
                        onClick={handleCancel}
                        className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5"
                    >
                        Cancel
                    </button>
                    <span className="ml-auto text-xs text-gray-400">{draft.length}/160</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-2 flex items-start gap-2">
            {bio ? (
                <p className="text-gray-600 text-sm leading-relaxed">{bio}</p>
            ) : isOwner ? (
                <p className="text-gray-400 text-sm italic">Add a bio to tell others about yourself.</p>
            ) : null}
            {isOwner && (
                <button
                    onClick={() => setEditing(true)}
                    className="shrink-0 text-xs text-gray-400 hover:text-gray-600 underline mt-0.5"
                >
                    {bio ? "Edit" : "Add bio"}
                </button>
            )}
        </div>
    );
}
