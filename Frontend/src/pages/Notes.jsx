import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { getNotes, getSubject } from "../services/api";
import { FileText, Download, Lock, Eye } from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import API_URL from "../config";

export default function Notes() {
  const { subjectId } = useParams();
  const { isAuthenticated } = useAuthStore();

  const { data: subject } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: () => getSubject(subjectId).then(r => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["notes", subjectId],
    queryFn: () => getNotes({ subject: subjectId }).then(r => r.data),
  });

  const FILE_TYPE_COLORS = {
    pdf:   { bg: "#FEF2F2", color: "#DC2626" },
    doc:   { bg: "#EFF6FF", color: "#2563EB" },
    ppt:   { bg: "#FFFBEB", color: "#D97706" },
    image: { bg: "#F0FDFA", color: "#0D9488" },
    other: { bg: "var(--gray-100)", color: "var(--gray-500)" },
  };

  const handleDownload = async (note, view = false) => {
    if (!isAuthenticated) {
      toast.error("Please login to view or download files");
      return;
    }
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_URL}/api/notes/${note.id}/download/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      if (view) {
        window.open(url, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = note.title;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Download started!");
      }
    } catch {
      toast.error("Failed to load file");
    }
  };

  return (
    <div className="page">
      <div className="container">

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/programs">Programs</Link> /
          <span>{subject?.name}</span> /
          <span>Notes</span>
        </div>

        {/* Page header */}
        <div className="page-header">
          <h1>{subject?.name} — Notes</h1>
          <p>{data?.count || 0} notes available</p>
        </div>

        {/* Login warning */}
        {!isAuthenticated && (
          <div style={{
            background: "#FFFBEB", border: "1px solid #FDE68A",
            borderRadius: "var(--radius)", padding: "0.875rem 1.25rem",
            marginBottom: "1.5rem", display: "flex", alignItems: "center",
            gap: "0.75rem", fontSize: "0.875rem", color: "#92400E"
          }}>
            <Lock size={16} />
            <span>
              You need to{" "}
              <Link to="/login" style={{ color: "var(--primary)", fontWeight: 500 }}>
                login
              </Link>{" "}
              to view or download files.
            </span>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="loading">Loading notes...</div>
        ) : data?.results?.length === 0 ? (
          <div className="empty">
            <h3>No notes yet</h3>
            <p>Check back later</p>
          </div>
        ) : (
          <div className="grid-2">
            {data?.results?.map(note => {
              const typeStyle = FILE_TYPE_COLORS[note.file_type] || FILE_TYPE_COLORS.other;
              return (
                <div
                  key={note.id}
                  className="card"
                  style={{ padding: "1.25rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}
                >
                  {/* File type icon */}
                  <div style={{ background: typeStyle.bg, borderRadius: "8px", padding: "10px", flexShrink: 0 }}>
                    <FileText size={20} color={typeStyle.color} />
                  </div>

                  {/* Note info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: "0.95rem", fontWeight: 600,
                      color: "var(--gray-900)", fontFamily: "DM Sans, sans-serif",
                      marginBottom: "0.25rem"
                    }}>
                      {note.title}
                    </h3>
                    {note.description && (
                      <p style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginBottom: "0.5rem" }}>
                        {note.description.slice(0, 80)}{note.description.length > 80 ? "..." : ""}
                      </p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                      <span className="badge" style={{ background: typeStyle.bg, color: typeStyle.color }}>
                        {note.file_type?.toUpperCase()}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
                        {note.file_size_display}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--gray-400)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Eye size={12} /> {note.download_count} downloads
                      </span>
                    </div>
                  </div>

                  {/* View + Download buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flexShrink: 0 }}>
                    <button
                      onClick={() => handleDownload(note, true)}
                      className="btn btn-sm"
                      style={{ background: "var(--gray-100)", color: "var(--gray-700)", border: "none", justifyContent: "center" }}
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      onClick={() => handleDownload(note, false)}
                      className="btn btn-sm"
                      style={{
                        background: isAuthenticated ? "var(--primary)" : "var(--gray-100)",
                        color: isAuthenticated ? "white" : "var(--gray-500)",
                        border: "none", justifyContent: "center"
                      }}
                    >
                      {isAuthenticated ? <Download size={13} /> : <Lock size={13} />}
                      {isAuthenticated ? "Download" : "Login"}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
 