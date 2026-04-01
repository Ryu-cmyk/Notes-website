import { useSearchParams } from "react-router-dom";
import { Download, ArrowLeft } from "lucide-react";

export default function PDFViewer() {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");
  const name = searchParams.get("name") || "Document";

  if (!url) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <p>No file specified.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.75rem 1.25rem",
        background: "white", borderBottom: "1px solid var(--gray-200)",
        flexShrink: 0, gap: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={() => window.close()}
            className="btn btn-sm"
            style={{ background: "var(--gray-100)", color: "var(--gray-700)", border: "none" }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--gray-800)" }}>
            {name}
          </span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="btn btn-sm btn-primary"
        >
          <Download size={14} /> Download
        </a>
      </div>

      <iframe
        src={url}
        title={name}
        style={{ flex: 1, width: "100%", border: "none" }}
      />
    </div>
  );
}