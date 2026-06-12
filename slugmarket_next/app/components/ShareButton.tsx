"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";

// ShareButton lets a user share a listing. On devices that support the Web Share
// API (mostly mobile) it opens the native share sheet; otherwise it copies the
// listing URL to the clipboard and briefly shows a "Copied!" confirmation.
export default function ShareButton({ title, className }: { title: string; className?: string }) {
    const [copied, setCopied] = useState(false);

    async function handleShare() {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({ title, url });
                return;
            } catch {
                // User cancelled the share sheet, or it failed — fall through to copy.
            }
        }

        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard unavailable (e.g. insecure context) — nothing more we can do.
        }
    }

    return (
        <button onClick={handleShare} className={className}>
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? "Copied!" : "Share"}
        </button>
    );
}

//test
//test 