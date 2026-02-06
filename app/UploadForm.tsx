"use client";

import { useState, useRef } from "react";

export default function UploadForm() {
  const [folder, setFolder] = useState<"private" | "public">("private");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".usdz")) {
      setError("Only .usdz files are allowed");
      return;
    }

    setUploading(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      setMessage(`Uploaded ${file.name} to ${folder}/`);
      if (fileRef.current) fileRef.current.value = "";

      // Refresh page to show the new model
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="upload-section">
      <h2 className="folder-title">Upload Model</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <input
          ref={fileRef}
          type="file"
          accept=".usdz"
          required
          className="upload-input"
        />
        <div className="upload-controls">
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value as "private" | "public")}
            className="upload-select"
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
          <button
            type="submit"
            disabled={uploading}
            className="upload-btn"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </form>
      {message && <p className="upload-success">{message}</p>}
      {error && <p className="upload-error">{error}</p>}
    </section>
  );
}
