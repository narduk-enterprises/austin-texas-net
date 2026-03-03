/**
 * formatTimestamp — Human-readable "Updated ..." timestamp.
 *
 * Shared across weather and live-data pages that display
 * "Updated Mon, Jan 6, 3:14 PM" style timestamps.
 */
export function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return ts
  }
}
