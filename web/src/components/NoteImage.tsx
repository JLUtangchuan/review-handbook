"use client";

import { useState } from "react";
import type { NoteImage as NoteImageType } from "@/lib/types";

interface NoteImageProps {
  images: NoteImageType[];
  /** Thumbnail mode: show small previews in a row */
  thumbnails?: boolean;
  /** Max images to show in thumbnail mode */
  maxThumbnails?: number;
  /** Full-size mode: show images in a gallery */
  gallery?: boolean;
}

export default function NoteImage({
  images,
  thumbnails = false,
  maxThumbnails = 3,
  gallery = false,
}: NoteImageProps) {
  const [expanded, setExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  if (thumbnails) {
    const visible = expanded ? images : images.slice(0, maxThumbnails);
    const remaining = images.length - maxThumbnails;

    return (
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
        {visible.map((img, i) => (
          <div
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(i);
            }}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "8px",
              overflow: "hidden",
              cursor: "pointer",
              border: "1px solid #262626",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <img
              src={img.url}
              alt={img.caption || `图片 ${i + 1}`}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ))}
        {!expanded && remaining > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(true);
            }}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "8px",
              background: "#262626",
              border: "none",
              color: "#a3a3a3",
              fontSize: "18px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            +{remaining}
          </button>
        )}
        {/* Lightbox */}
        {lightboxIndex !== null && (
          <div
            onClick={() => setLightboxIndex(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(0,0,0,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <img
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].caption || "大图"}
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
            {images[lightboxIndex].caption && (
              <div style={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                right: "16px",
                textAlign: "center",
                color: "#a3a3a3",
                fontSize: "13px",
              }}>
                {images[lightboxIndex].caption}
              </div>
            )}
            {/* Navigation */}
            <div style={{ position: "absolute", top: "16px", right: "16px", display: "flex", gap: "8px" }}>
              {lightboxIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ←
                </button>
              )}
              {lightboxIndex < images.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  →
                </button>
              )}
              <button
                onClick={() => setLightboxIndex(null)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ position: "absolute", top: "16px", left: "16px", color: "#737373", fontSize: "12px" }}>
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (gallery) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
        {images.map((img, i) => (
          <div key={i}>
            <img
              src={img.url}
              alt={img.caption || `图片 ${i + 1}`}
              loading="lazy"
              onClick={() => setLightboxIndex(i)}
              style={{
                width: "100%",
                borderRadius: "12px",
                cursor: "pointer",
                border: "1px solid #262626",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {img.caption && (
              <p style={{
                fontSize: "12px",
                color: "#737373",
                textAlign: "center",
                marginTop: "4px",
              }}>
                {img.caption}
              </p>
            )}
          </div>
        ))}
        {/* Lightbox */}
        {lightboxIndex !== null && (
          <div
            onClick={() => setLightboxIndex(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(0,0,0,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].caption || "大图"}
              style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain" }}
            />
          </div>
        )}
      </div>
    );
  }

  return null;
}
