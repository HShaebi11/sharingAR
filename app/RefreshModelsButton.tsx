"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RefreshModelsButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/commit-models", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to commit and push.");
        return;
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to commit.");
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }

  return (
    <div className="refresh-models-wrap">
      <button
        type="button"
        className="refresh-models-btn"
        onClick={handleClick}
        disabled={isRefreshing}
        aria-label={isRefreshing ? "Committing and refreshing…" : "Commit new changes and refresh model list"}
      >
        {isRefreshing ? "Committing…" : "Refresh"}
      </button>
      {error && (
        <p className="refresh-models-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
