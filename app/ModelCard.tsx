"use client";

import { useState, useEffect } from "react";

const PLACEHOLDER_SRC = "/ar-placeholder.svg";

export default function ModelCard({
  name,
  proxyUrl,
}: {
  name: string;
  proxyUrl: string;
}) {
  const [supportsAR, setSupportsAR] = useState<boolean | null>(null);

  useEffect(() => {
    const a = document.createElement("a");
    setSupportsAR(a.relList.supports("ar"));
  }, []);

  const displayName = name.replace(/\.usdz$/i, "");

  return (
    <article className="card">
      <h2 className="card-title">{displayName}</h2>
      {supportsAR === true ? (
        <a rel="ar" href={proxyUrl} className="ar-link">
          <img src={PLACEHOLDER_SRC} alt="View in AR" width={120} height={120} />
          <span className="ar-label">View in AR</span>
        </a>
      ) : (
        <a href={proxyUrl} download={name} className="download-link">
          <img src={PLACEHOLDER_SRC} alt="3D model" width={120} height={120} />
          <span className="ar-label">
            {supportsAR === false ? "Download .usdz" : "Open / Download"}
          </span>
        </a>
      )}
    </article>
  );
}
