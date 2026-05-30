import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatTime } from "../utils";

// Test suite for the formatTime function, covering formatting for recent timestamps, yesterday, and older dates
describe("formatTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Test that the function returns a time string (like "10:00 AM") for timestamps less than 24 hours ago, and does not return "Yesterday" or a date string 
  it("returns a time string for timestamps less than 24 hours ago", () => {
    vi.setSystemTime(new Date("2024-06-01T15:00:00Z"));
    const result = formatTime("2024-06-01T10:00:00Z");
    // Should be a time like "10:00 AM", not a date or "Yesterday"
    expect(result).not.toBe("Yesterday");
    expect(result).toMatch(/\d+:\d{2}/);
  });

  // Test that the function returns "Yesterday" for timestamps between 24 and 48 hours ago, and does not return a time string or a date string
  it("returns 'Yesterday' for timestamps between 24 and 48 hours ago", () => {
    vi.setSystemTime(new Date("2024-06-02T10:00:00Z"));
    const result = formatTime("2024-06-01T09:00:00Z");
    expect(result).toBe("Yesterday");
  });

  // Test that the function returns a date string (like "Jun 1") for timestamps older than 48 hours, and does not return "Yesterday" or a time string
  it("returns a date string for timestamps older than 48 hours", () => {
    vi.setSystemTime(new Date("2024-06-10T10:00:00Z"));
    const result = formatTime("2024-06-01T10:00:00Z");
    expect(result).toBe("Jun 1");
  });
});
