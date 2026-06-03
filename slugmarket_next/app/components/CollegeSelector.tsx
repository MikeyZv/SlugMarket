"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

const COLLEGES = [
    "Cowell",
    "Stevenson",
    "Crown",
    "Merrill",
    "Porter",
    "Kresge",
    "Oakes",
    "Rachel Carson",
    "College Nine",
    "John R. Lewis",
];

function formatCollege(c: string) { return c === "College Nine" ? c : `${c} College`; }

type Props = {
    profileId: string;
    initialCollege: string | null;
};

export default function CollegeSelector({ profileId, initialCollege }: Props) {
    const { user } = useAuth();
    const [college, setCollege] = useState(initialCollege ?? "");
    const [saving, setSaving] = useState(false);

    const [editing, setEditing] = useState(!initialCollege);
    const isOwner = user?.id === profileId;

    async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const value = e.target.value;
        if (!value) return;
        setCollege(value);
        setSaving(true);
        await supabase
            .from("profiles")
            .update({ college: value })
            .eq("id", profileId);
        setSaving(false);
        setEditing(false);
    }

    if (!isOwner) {
        return college ? (
            <p className="text-gray-500 text-sm">{formatCollege(college)}</p>
        ) : null;
    }

    if (editing) {
        return (
            <div className="flex items-center gap-2 mt-1">
                <select
                    value={college}
                    onChange={handleChange}
                    disabled={saving}
                    autoFocus
                    className="text-sm text-gray-600 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#3567F1] disabled:opacity-50 bg-white"
                >
                    <option value="">Select your college…</option>
                    {COLLEGES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                {college && (
                    <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-gray-600">
                        Cancel
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500 text-sm">{formatCollege(college)}</p>
            <button
                onClick={() => setEditing(true)}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
                Edit
            </button>
        </div>
    );
}
