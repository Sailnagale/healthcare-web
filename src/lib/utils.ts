// src/lib/utils.ts

export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formattedDate} at ${formattedTime}`;
}
