"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, X, ChevronDown, Check } from "lucide-react";
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

function formatCollege(c: string) {
  return c === "College Nine" ? c : `${c} College`;
}

type Props = {
  profileId: string;
  initialBio: string | null;
  initialCollege: string | null;
};

export default function EditProfile({ profileId, initialBio, initialCollege }: Props) {
  const { user } = useAuth();
  const [bio, setBio] = useState(initialBio ?? "");
  const [college, setCollege] = useState(initialCollege ?? "");
  const [draftBio, setDraftBio] = useState(initialBio ?? "");
  const [draftCollege, setDraftCollege] = useState(initialCollege ?? "");
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.id === profileId;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function openModal() {
    setDraftBio(bio);
    setDraftCollege(college);
    setOpen(true);
  }

  function closeModal() {
    setDropdownOpen(false);
    setOpen(false);
  }

  async function handleSave() {
    setSaving(true);
    await supabase
      .from("profiles")
      .update({
        bio: draftBio.trim() || null,
        college: draftCollege || null,
      })
      .eq("id", profileId);
    setBio(draftBio.trim());
    setCollege(draftCollege);
    setSaving(false);
    setOpen(false);
  }

  return (
    <>
      <div className="flex items-start gap-2 mt-2">
        <div className="flex flex-col gap-0.5">
          {college && (
            <p className="text-gray-500 text-sm">{formatCollege(college)}</p>
          )}
          {bio ? (
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm">{bio}</p>
          ) : isOwner ? (
            <p className="text-gray-400 text-sm italic">Add a bio…</p>
          ) : null}
        </div>
        {isOwner && (
          <button
            onClick={openModal}
            className="shrink-0 text-gray-400 hover:text-[#0F2044] transition mt-0.5"
            title="Edit profile"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#0F2044]">Edit your profile</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Custom college dropdown */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">College</label>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="w-full flex items-center justify-between rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-[#0F2044] focus:outline-none transition bg-white"
                  >
                    <span className={draftCollege ? "text-gray-800" : "text-gray-400"}>
                      {draftCollege ? formatCollege(draftCollege) : "Select your college…"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                      <li>
                        <button
                          type="button"
                          onClick={() => { setDraftCollege(""); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 transition"
                        >
                          <span className="flex-1 text-left">None</span>
                        </button>
                      </li>
                      {COLLEGES.map((c) => (
                        <li key={c}>
                          <button
                            type="button"
                            onClick={() => { setDraftCollege(c); setDropdownOpen(false); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-800 hover:bg-[#0F2044]/5 transition"
                          >
                            <span className="flex-1 text-left">{formatCollege(c)}</span>
                            {draftCollege === c && <Check size={14} className="text-[#0F2044] shrink-0" />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Bio textarea */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Bio</label>
                <textarea
                  value={draftBio}
                  onChange={(e) => setDraftBio(e.target.value)}
                  maxLength={160}
                  rows={4}
                  placeholder="Write a short bio…"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm text-gray-800 focus:border-[#0F2044] focus:outline-none resize-none transition"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{draftBio.length}/160</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#F5C518] text-[#0F2044] text-sm font-semibold hover:bg-[#fde047] transition disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
