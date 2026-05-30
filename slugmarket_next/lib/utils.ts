// Utility function for formatting timestamps into human-readable strings based on how recent they are (time for today, "Yesterday" for yesterday, and date for older timestamps)
export function formatTime(ts: string): string {
  const date = new Date(ts);
  const diffHours = (Date.now() - date.getTime()) / (1000 * 60 * 60);
  if (diffHours < 24) return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (diffHours < 48) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
