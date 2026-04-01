import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Lock } from "lucide-react";
import useAuthStore from "../store/authStore";

export default function PDFViewer() {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");
  const name = searchParams.get("name") || "Document";
  const { isAuthenticated } = useAuthStore();

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (!url) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <p>No file specified.</p>
      </div>
    );
  }

  const viewerSrc = isMobile
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
    : `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`;

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
          <span style={{
            fontSize: "0.9rem", fontWeight: 500, color: "var(--gray-800)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            maxWidth: "160px"
          }}>
            {name}
          </span>
        </div>

        {isAuthenticated ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-primary"
          >
            <Download size={14} /> Download
          </a>
        ) : (
          <Link
            to="/login"
            className="btn btn-sm"
            style={{ background: "var(--gray-100)", color: "var(--gray-700)", border: "none" }}
          >
            <Lock size={14} /> Login to Download
          </Link>
        )}
      </div>

      <iframe
        src={viewerSrc}
        title={name}
        style={{ flex: 1, width: "100%", border: "none" }}
      />
    </div>
  );
}