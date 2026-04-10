import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { getPastYearPapers, getSubject } from "../services/api";
import { FileCheck, Download, Lock, Eye, BookOpen } from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import API_URL from "../config";

export default function PastYearPapers() {
  const { subjectId } = useParams();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState({});

  const { data: subject } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: () => getSubject(subjectId).then(r => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["papers", subjectId],
    queryFn: () => getPastYearPapers({ subject: subjectId }).then(r => r.data),
  });

  const getTab = (paperId) => activeTab[paperId] || "question";
  const setTab = (paperId, tab) => setActiveTab(prev => ({ ...prev, [paperId]: tab }));

  const openViewer = (url, name) => {
    if (!url) { toast.error("File not available"); return; }
    const viewerUrl = `/view?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;
    window.open(viewerUrl, "_blank");
  };

  const handleDownload = async (url, filename) => {
    if (!url) { toast.error("File not available"); return; }
    if (!isAuthenticated) { toast.error("Please login to download"); return; }
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Failed");
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(objectUrl);
      toast.success("Download started!");
    } catch {
      toast.error("Failed to download file");
    }
  };

  const getFiles = (paper) => {
    const questionFile = paper.file || paper.paper_files?.[0]?.file;
    const solutionFile = paper.solution_files?.[0]?.file;
    return { questionFile, solutionFile };
  };

  return (
    <div className="page">
      <div className="container">

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/programs">Programs</Link> /
          <span>{subject?.name}</span> /
          <span>Past Year Papers</span>
        </div>

        {/* Page header */}
        <div className="page-header">
          <h1>{subject?.name} — Past Year Papers</h1>
          <p>{data?.count || 0} papers available</p>
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
              View papers freely.{" "}
              <Link to="/login" style={{ color: "var(--primary)", fontWeight: 500 }}>Login</Link>{" "}
              to view solutions and download.
            </span>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="loading">Loading papers...</div>
        ) : data?.results?.length === 0 ? (
          <div className="empty">
            <h3>No papers yet</h3>
            <p>Check back later</p>
          </div>
        ) : (
          <div className="grid-2">
            {data?.results?.map(paper => {
              const tab = getTab(paper.id);
              const { questionFile, solutionFile } = getFiles(paper);
              const hasSolution = !!solutionFile || paper.solution_files?.length > 0;
              const activeFile = tab === "question" ? questionFile : solutionFile;
              const activeName = `${paper.title} ${paper.year} — ${tab === "question" ? "Question" : "Solution"}`;

              return (
                <div key={paper.id} className="card" style={{ padding: "1.25rem" }}>

                  {/* Top row */}
                  <div style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div style={{
                      background: "var(--primary-light)", borderRadius: "8px",
                      padding: "9px", flexShrink: 0
                    }}>
                      <FileCheck size={18} color="var(--primary)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: "0.925rem", fontWeight: 600,
                        color: "var(--gray-900)", marginBottom: "0.35rem",
                        fontFamily: "DM Sans, sans-serif"
                      }}>
                        {paper.title}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                        <span className="badge badge-blue">{paper.year}</span>
                        {hasSolution && (
                          <span className="badge badge-green">
                            {isAuthenticated ? "✓ Solution" : "🔒 Solution"}
                          </span>
                        )}
                        <span style={{ fontSize: "0.73rem", color: "var(--gray-400)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                          <Eye size={11} /> {paper.download_count}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Question / Solution pill toggle */}
                  <div style={{
                    display: "flex", background: "var(--gray-100)",
                    borderRadius: "8px", padding: "3px", marginBottom: "1rem"
                  }}>
                    <button
                      onClick={() => setTab(paper.id, "question")}
                      style={{
                        flex: 1, padding: "0.45rem 0.5rem",
                        borderRadius: "6px", border: "none", cursor: "pointer",
                        fontSize: "0.8rem", fontWeight: 500,
                        fontFamily: "DM Sans, sans-serif",
                        background: tab === "question" ? "white" : "transparent",
                        color: tab === "question" ? "var(--gray-900)" : "var(--gray-400)",
                        boxShadow: tab === "question" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                        transition: "all 0.15s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem"
                      }}
                    >
                      <BookOpen size={13} /> Question
                    </button>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          toast.error("Please login to view solutions");
                          return;
                        }
                        if (!hasSolution) return;
                        setTab(paper.id, "solution");
                      }}
                      style={{
                        flex: 1, padding: "0.45rem 0.5rem",
                        borderRadius: "6px", border: "none",
                        cursor: hasSolution ? "pointer" : "not-allowed",
                        fontSize: "0.8rem", fontWeight: 500,
                        fontFamily: "DM Sans, sans-serif",
                        background: tab === "solution" ? "white" : "transparent",
                        color: tab === "solution" ? "var(--success)" : hasSolution ? "var(--gray-400)" : "var(--gray-300)",
                        boxShadow: tab === "solution" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                        transition: "all 0.15s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem",
                        opacity: hasSolution ? 1 : 0.5
                      }}
                    >
                      <FileCheck size={13} />
                      Solution
                      {!isAuthenticated && hasSolution && <Lock size={11} />}
                      {!hasSolution && <span style={{ fontSize: "0.7rem" }}>(N/A)</span>}
                    </button>
                  </div>

                  {/* View + Download buttons */}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => openViewer(activeFile, activeName)}
                      className="btn btn-sm"
                      style={{
                        flex: 1, justifyContent: "center",
                        background: "var(--gray-100)", color: "var(--gray-700)", border: "none"
                      }}
                      disabled={!activeFile}
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      onClick={() => handleDownload(
                        `${API_URL}/api/past-year-papers/${paper.id}/download/`,
                        `${paper.title}-${paper.year}`
                      )}
                      className="btn btn-sm btn-primary"
                      style={{ flex: 1, justifyContent: "center", border: "none" }}
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