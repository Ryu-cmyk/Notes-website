import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Download, ArrowLeft, Loader } from "lucide-react";

export default function PDFViewer() {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");
  const name = searchParams.get("name") || "Document";
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) return;

    const fetchPDF = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) throw new Error("Failed");
        const blob = await response.blob();
        setBlobUrl(window.URL.createObjectURL(blob));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPDF();

    // Cleanup blob URL on unmount
    return () => {
      if (blobUrl) window.URL.revokeObjectURL(blobUrl);
    };
  }, [url]);

  if (!url) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <p>No file specified.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>

      {/* Top bar */}
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

        {blobUrl && (
          <a href={blobUrl} download={name} className="btn btn-sm btn-primary">
            <Download size={14} /> Download
          </a>
        )}
      </div>

      {/* Content */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, gap: "0.75rem", color: "var(--gray-400)" }}>
          <Loader size={20} />
          Loading file...
        </div>
      )}

      {error && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <p style={{ color: "var(--gray-500)" }}>Failed to load file. Please try again.</p>
        </div>
      )}

      <iframe
  src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
  title={name}
  style={{ flex: 1, width: "100%", border: "none" }}
/>

    </div>
  );
}