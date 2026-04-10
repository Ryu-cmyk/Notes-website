import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Lock, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import useAuthStore from "../store/authStore";

export default function PDFViewer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const url = searchParams.get("url");
  const name = searchParams.get("name") || "Document";
  const { isAuthenticated } = useAuthStore();

  // pages is a JSON array of {url, name} objects passed from PastYearPapers
  // e.g. pages=[{"url":"...","name":"Page 1"},{"url":"...","name":"Page 2"}]
  const pagesParam = searchParams.get("pages");
  const currentIndex = parseInt(searchParams.get("index") || "0", 10);
  const pages = pagesParam ? JSON.parse(decodeURIComponent(pagesParam)) : null;
  const totalPages = pages ? pages.length : null;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const currentUrl = pages ? pages[currentIndex].url : url;
  const currentName = pages ? pages[currentIndex].name : name;

  const goTo = (index) => {
    const params = new URLSearchParams(searchParams);
    params.set("index", index);
    params.set("url", pages[index].url);
    params.set("name", pages[index].name);
    setSearchParams(params);
  };

  if (!currentUrl) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <p>No file specified.</p>
      </div>
    );
  }

  const viewerSrc = isMobile
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(currentUrl)}&embedded=true`
    : `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(currentUrl)}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#1a1a2e" }}>

      {/* Top Bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.65rem 1.25rem",
        background: "white", borderBottom: "1px solid var(--gray-200)",
        flexShrink: 0, gap: "1rem"
      }}>
        {/* Left — back + title */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
          <button
            onClick={() => window.close()}
            className="btn btn-sm"
            style={{ background: "var(--gray-100)", color: "var(--gray-700)", border: "none", flexShrink: 0 }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
            <div style={{ background: "var(--primary-light)", borderRadius: "6px", padding: "5px", flexShrink: 0, display: "flex" }}>
              <FileText size={14} color="var(--primary)" />
            </div>
            <span style={{
              fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-800)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              maxWidth: "180px"
            }}>
              {currentName}
            </span>
          </div>
        </div>

        {/* Center — page navigation */}
        {pages && totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
            <button
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="btn btn-sm"
              style={{
                background: currentIndex === 0 ? "var(--gray-50)" : "var(--gray-100)",
                color: currentIndex === 0 ? "var(--gray-300)" : "var(--gray-700)",
                border: "none", padding: "0.3rem 0.6rem"
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              {pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    width: i === currentIndex ? "28px" : "8px",
                    height: "8px",
                    borderRadius: "999px",
                    border: "none",
                    cursor: "pointer",
                    background: i === currentIndex ? "var(--primary)" : "var(--gray-300)",
                    transition: "all 0.2s",
                    padding: 0,
                    fontSize: "0.65rem",
                    color: "white",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden"
                  }}
                >
                  {i === currentIndex ? i + 1 : ""}
                </button>
              ))}
            </div>

            <button
              onClick={() => goTo(currentIndex + 1)}
              disabled={currentIndex === totalPages - 1}
              className="btn btn-sm"
              style={{
                background: currentIndex === totalPages - 1 ? "var(--gray-50)" : "var(--gray-100)",
                color: currentIndex === totalPages - 1 ? "var(--gray-300)" : "var(--gray-700)",
                border: "none", padding: "0.3rem 0.6rem"
              }}
            >
              <ChevronRight size={16} />
            </button>

            <span style={{ fontSize: "0.78rem", color: "var(--gray-400)", whiteSpace: "nowrap" }}>
              {currentIndex + 1} / {totalPages}
            </span>
          </div>
        )}

        {/* Right — download */}
        {isAuthenticated ? (
          <a
            href={currentUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-primary"
            style={{ flexShrink: 0 }}
          >
            <Download size={14} /> Download
          </a>
        ) : (
          <Link
            to="/login"
            className="btn btn-sm"
            style={{ background: "var(--gray-100)", color: "var(--gray-700)", border: "none", flexShrink: 0 }}
          >
            <Lock size={14} /> Login
          </Link>
        )}
      </div>

      {/* PDF Viewer */}
      <iframe
        key={currentUrl}
        src={viewerSrc}
        title={currentName}
        style={{ flex: 1, width: "100%", border: "none" }}
      />

      {/* Bottom nav bar — mobile friendly */}
      {pages && totalPages > 1 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0.75rem 1.25rem",
          background: "white", borderTop: "1px solid var(--gray-200)",
          flexShrink: 0
        }}>
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="btn btn-sm"
            style={{
              background: currentIndex === 0 ? "var(--gray-50)" : "var(--gray-100)",
              color: currentIndex === 0 ? "var(--gray-300)" : "var(--gray-700)",
              border: "none"
            }}
          >
            <ChevronLeft size={14} /> Previous
          </button>

          <span style={{ fontSize: "0.85rem", color: "var(--gray-500)", fontWeight: 500 }}>
            Page {currentIndex + 1} of {totalPages}
          </span>

          <button
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === totalPages - 1}
            className="btn btn-sm btn-primary"
            style={{
              border: "none",
              opacity: currentIndex === totalPages - 1 ? 0.4 : 1
            }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}