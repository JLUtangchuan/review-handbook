// Server-compatible image gallery (no hooks)
import type { NoteImage } from "@/lib/types";

export default function NoteImageGallery({
  images,
  maxPreview = 3,
}: {
  images?: NoteImage[];
  maxPreview?: number;
}) {
  if (!images || images.length === 0) return null;

  return (
    <div style={{
      display: "flex",
      gap: "6px",
      flexWrap: "wrap",
      marginTop: "10px",
    }}>
      {images.slice(0, maxPreview).map((img, i) => (
        <a
          key={i}
          href={img.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            width: "100px",
            height: "100px",
            borderRadius: "10px",
            overflow: "hidden",
            border: "1px solid #262626",
            flexShrink: 0,
            position: "relative",
          }}
          title={img.caption || `图片 ${i + 1}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt={img.caption || `图片 ${i + 1}`}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </a>
      ))}
      {images.length > maxPreview && (
        <div style={{
          width: "100px",
          height: "100px",
          borderRadius: "10px",
          background: "#262626",
          border: "1px solid #333",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#a3a3a3",
          fontSize: "16px",
          fontWeight: 600,
        }}>
          +{images.length - maxPreview}
        </div>
      )}
    </div>
  );
}
