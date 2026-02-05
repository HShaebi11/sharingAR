"use client";

import { useState, useEffect } from "react";

const PLACEHOLDER_SRC = "/ar-placeholder.svg";

export default function ModelView({
  name,
  proxyUrl,
}: {
  name: string;
  proxyUrl: string;
}) {
  const [supportsAR, setSupportsAR] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const a = document.createElement("a");
    setSupportsAR(a.relList.supports("ar"));
  }, []);

  const displayName = name.replace(/\.usdz$/i, "");

  const copyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const share = () => {
    if (typeof window === "undefined" || !navigator.share) return;
    navigator.share({
      title: `View ${displayName} in AR`,
      url: window.location.href,
      text: `View ${displayName} in AR`,
    });
  };

  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="model-view">
      <div className="model-view-ar">
        {supportsAR === true ? (
          <a rel="ar" href={proxyUrl} className="ar-link">
            <img src={PLACEHOLDER_SRC} alt="View in AR" width={160} height={160} />
            <span className="ar-label">View in AR</span>
          </a>
        ) : (
          <a href={proxyUrl} download={name} className="download-link">
            <img src={PLACEHOLDER_SRC} alt="3D model" width={160} height={160} />
            <span className="ar-label">
              {supportsAR === false ? "Download .usdz" : "Open / Download"}
            </span>
          </a>
        )}
      </div>
      <div className="model-view-actions">
        <button type="button" onClick={copyLink} className="copy-link-btn">
          {copied ? "Copied!" : "Copy link"}
        </button>
        {canShare && (
          <button type="button" onClick={share} className="share-btn">
            Share
          </button>
        )}
      </div>
    </div>
  );
}
