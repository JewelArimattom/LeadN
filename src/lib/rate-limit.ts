const tracker = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(ip: string, limit = 5, windowMs = 60000): { success: boolean } {
  const now = Date.now();
  const entry = tracker.get(ip);

  if (!entry || entry.expiresAt < now) {
    tracker.set(ip, { count: 1, expiresAt: now + windowMs });
    return { success: true };
  }

  if (entry.count >= limit) {
    return { success: false };
  }

  entry.count += 1;
  return { success: true };
}
