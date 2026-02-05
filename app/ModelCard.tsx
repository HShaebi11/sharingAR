"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const PLACEHOLDER_SRC = "/ar-placeholder.svg";

function modelPagePath(filename: string): string {
  return `/model/${filename.split("/").map(encodeURIComponent).join("/")}`;
}

export default function ModelCard({
  name,
  proxyUrl,
  showCopyLink = true,
}: {
  name: string;
  proxyUrl: string;
  showCopyLink?: boolean;
}) {
  const [supportsAR, setSupportsAR] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const a = document.createElement("a");
    setSupportsAR(a.relList.supports("ar"));
  }, []);

  const fileName = name.split("/").pop() ?? name;
  const displayName = fileName.replace(/\.usdz$/i, "");
  const modelPath = modelPagePath(name);

  const copyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window === "undefined") return;
    const shareId = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    const url = `${window.location.origin}${modelPath}?share=${shareId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <article className="card">
      <h2 className="card-title">
        <Link href={modelPath} className="card-title-link">
          {displayName}
        </Link>
      </h2>
      {supportsAR === true ? (
        <a rel="ar" href={proxyUrl} className="ar-link">
          <img src={PLACEHOLDER_SRC} alt="View in AR" width={120} height={120} />
          <span className="ar-label">View in AR</span>
        </a>
      ) : (
        <a href={proxyUrl} download={fileName} className="download-link">
          <img src={PLACEHOLDER_SRC} alt="3D model" width={120} height={120} />
          <span className="ar-label">
            {supportsAR === false ? "Download .usdz" : "Open / Download"}
          </span>
        </a>
      )}
      {showCopyLink && (
        <button type="button" onClick={copyLink} className="copy-link-btn card-copy">
          {copied ? "Copied!" : "Copy link"}
        </button>
      )}
    </article>
  );
}
