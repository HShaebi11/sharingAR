"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState<"private" | "public">("public");
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    setFile(chosen ?? null);
    setStatus("idle");
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("Choose a .usdz file");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setMessage("");

    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as { ok?: boolean; error?: string; path?: string };

      if (!res.ok) {
        setMessage(data.error ?? "Upload failed");
        setStatus("error");
        return;
      }

      setMessage(`Uploaded to ${folder}: ${file.name}`);
      setStatus("success");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch {
      setMessage("Network error");
      setStatus("error");
    }
  };

  return (
    <section className="upload-section" aria-labelledby="upload-title">
      <h2 id="upload-title" className="upload-title">
        Upload .usdz
      </h2>
      <p className="upload-desc">
        Add a model to the GitHub repo. Requires <code>GITHUB_TOKEN</code> with{" "}
        <code>contents: write</code>.
      </p>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="upload-row">
          <label className="upload-label">
            <span className="upload-label-text">File</span>
            <input
              ref={inputRef}
              type="file"
              accept=".usdz"
              onChange={handleFileChange}
              className="upload-input"
              disabled={status === "uploading"}
            />
          </label>
          <label className="upload-label upload-folder">
            <span className="upload-label-text">Folder</span>
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value as "private" | "public")}
              className="upload-select"
              disabled={status === "uploading"}
            >
              <option value="public">Public (shareable link)</option>
              <option value="private">Private (view only)</option>
            </select>
          </label>
        </div>
        <div className="upload-actions">
          <button
            type="submit"
            className="upload-btn"
            disabled={status === "uploading" || !file}
          >
            {status === "uploading" ? "Uploading…" : "Upload to GitHub"}
          </button>
        </div>
        {file && status === "idle" && (
          <p className="upload-filename">{file.name}</p>
        )}
        {message && (
          <p
            className={
              status === "error"
                ? "upload-message upload-message-error"
                : "upload-message upload-message-success"
            }
            role={status === "error" ? "alert" : undefined}
          >
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
