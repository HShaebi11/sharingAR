"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RefreshModelsButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  function handleClick() {
    if (isRefreshing) return;
    setIsRefreshing(true);
    router.refresh();
    // Reset loading state after a short delay so user sees feedback
    setTimeout(() => setIsRefreshing(false), 1500);
  }

  return (
    <button
      type="button"
      className="refresh-models-btn"
      onClick={handleClick}
      disabled={isRefreshing}
      aria-label={isRefreshing ? "Refreshing…" : "Refresh model list"}
    >
      {isRefreshing ? "Refreshing…" : "Refresh"}
    </button>
  );
}
