"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadComponent() {
    const [file, setFile] = useState<File | null>(null);
    const [folder, setFolder] = useState<"public" | "private">("private");
    const [isUploading, setIsUploading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        try {
            const res = await fetch(
                `/api/upload?filename=${encodeURIComponent(file.name)}&folder=${folder}`,
                {
                    method: "POST",
                    body: file,
                }
            );

            if (!res.ok) {
                throw new Error("Upload failed");
            }

            setFile(null);
            setIsOpen(false);
            router.refresh();
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error(error);
            alert("Failed to upload file");
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="upload-trigger-btn"
                aria-label="Upload Model"
            >
                + Upload
            </button>
        );
    }

    return (
        <div className="upload-modal-overlay">
            <div className="upload-modal">
                <div className="upload-header">
                    <h3>Upload Model</h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="close-btn"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="upload-form">
                    <div className="form-group">
                        <label htmlFor="file-upload">Choose .usdz file</label>
                        <input
                            id="file-upload"
                            ref={fileInputRef}
                            type="file"
                            accept=".usdz"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Folder</label>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="folder"
                                    value="private"
                                    checked={folder === "private"}
                                    onChange={() => setFolder("private")}
                                />
                                Private
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="folder"
                                    value="public"
                                    checked={folder === "public"}
                                    onChange={() => setFolder("public")}
                                />
                                Public
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={!file || isUploading}
                    >
                        {isUploading ? "Uploading..." : "Upload"}
                    </button>
                </form>
            </div>
        </div>
    );
}
