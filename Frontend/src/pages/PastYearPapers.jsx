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

  const getTab = (paperId) => activeTab[paperId] || "paper";
  const setTab = (paperId, tab) => setActiveTab(prev => ({ ...prev, [paperId]: tab }));

  const handleDownload = async (url, filename, view = false) => {
    if (!isAuthenticated && !view) {
      toast.error("Please login to download files");
      return;
    }

    try {
      if (view) {
        const viewerUrl = `/view?url=${encodeURIComponent(url)}&name=${encodeURIComponent(filename)}`;
        window.open(viewerUrl, "_blank");
        return;
      }

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
              You can view files freely.{" "}
              <Link to="/login" style={{ color: "var(--primary)", fontWeight: 500 }}>
                Login
              </Link>{" "}
              to download.
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
              const hasSolution = paper.solution_files?.length > 0;
              const files = tab === "paper" ? paper.paper_files : paper.solution_files;
              const filePrefix = tab === "paper" ? "page" : "solution";
              const fileEndpoint = tab === "paper"
                ? "past-year-paper-files"
                : "past-year-paper-solutions";

              return (
                <div key={paper.id} className="card" style={{ padding: "1.25rem" }}>

                  {/* Header row */}
                  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div style={{
                      background: "var(--primary-light)", borderRadius: "8px",
                      padding: "10px", flexShrink: 0
                    }}>
                      <FileCheck size={20} color="var(--primary)" />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: "0.95rem", fontWeight: 600,
                        color: "var(--gray-900)", fontFamily: "DM Sans, sans-serif",
                        marginBottom: "0.4rem"
                      }}>
                        {paper.title}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span className="badge badge-blue">{paper.year}</span>
                        {hasSolution && <span className="badge badge-green">Solution available</span>}
                        <span style={{ fontSize: "0.75rem", color: "var(--gray-400)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Eye size={12} /> {paper.download_count}
                        </span>
                      </div>
                    </div>

                    {/* Main buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flexShrink: 0 }}>
                      <button
                        onClick={() => handleDownload(
                          `${API_URL}/api/past-year-papers/${paper.id}/view/`,
                          `${paper.title}-${paper.year}`, true
                        )}
                        className="btn btn-sm"
                        style={{ background: "var(--gray-100)", color: "var(--gray-700)", border: "none" }}
                      >
                        <Eye size={13} /> View
                      </button>
                      <button
                        onClick={() => handleDownload(
                          `${API_URL}/api/past-year-papers/${paper.id}/download/`,
                          `${paper.title}-${paper.year}`, false
                        )}
                        className="btn btn-sm btn-primary"
                        style={{ border: "none" }}
                      >
                        {isAuthenticated ? <Download size={13} /> : <Lock size={13} />}
                        {isAuthenticated ? "Download" : "Login"}
                      </button>
                    </div>
                  </div>

                  {/* Tab switcher */}
                  {(paper.paper_files?.length > 0 || hasSolution) && (
                    <>
                      <div style={{
                        display: "flex", borderBottom: "1px solid var(--gray-200)",
                        marginBottom: "0.75rem"
                      }}>
                        <button
                          onClick={() => setTab(paper.id, "paper")}
                          style={{
                            padding: "0.5rem 0.9rem",
                            fontSize: "0.8rem", fontWeight: 500,
                            fontFamily: "DM Sans, sans-serif",
                            background: "none", border: "none", cursor: "pointer",
                            borderBottom: tab === "paper" ? "2px solid var(--primary)" : "2px solid transparent",
                            color: tab === "paper" ? "var(--primary)" : "var(--gray-400)",
                            display: "flex", alignItems: "center", gap: "0.35rem",
                            transition: "all 0.15s",
                          }}
                        >
                          <BookOpen size={13} />
                          Pages
                          {paper.paper_files?.length > 0 && (
                            <span style={{
                              background: tab === "paper" ? "var(--primary-light)" : "var(--gray-100)",
                              color: tab === "paper" ? "var(--primary)" : "var(--gray-500)",
                              borderRadius: "999px", padding: "0 0.4rem",
                              fontSize: "0.7rem", fontWeight: 600,
                            }}>
                              {paper.paper_files.length}
                            </span>
                          )}
                        </button>

                        {hasSolution && (
                          <button
                            onClick={() => setTab(paper.id, "solution")}
                            style={{
                              padding: "0.5rem 0.9rem",
                              fontSize: "0.8rem", fontWeight: 500,
                              fontFamily: "DM Sans, sans-serif",
                              background: "none", border: "none", cursor: "pointer",
                              borderBottom: tab === "solution" ? "2px solid var(--success)" : "2px solid transparent",
                              color: tab === "solution" ? "var(--success)" : "var(--gray-400)",
                              display: "flex", alignItems: "center", gap: "0.35rem",
                              transition: "all 0.15s",
                            }}
                          >
                            <FileCheck size={13} />
                            Solutions
                            <span style={{
                              background: tab === "solution" ? "#ECFDF5" : "var(--gray-100)",
                              color: tab === "solution" ? "var(--success)" : "var(--gray-500)",
                              borderRadius: "999px", padding: "0 0.4rem",
                              fontSize: "0.7rem", fontWeight: 600,
                            }}>
                              {paper.solution_files.length}
                            </span>
                          </button>
                        )}
                      </div>

                      {/* File buttons */}
                      {files?.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                          {files.map(file => (
                            <div key={file.id} style={{ display: "flex", gap: "0.25rem" }}>
                              {/* View button → /view/ */}
                              <button
                                onClick={() => handleDownload(
                                  `${API_URL}/api/${fileEndpoint}/${file.id}/view/`,
                                  `${filePrefix}-${file.page_number}`, true
                                )}
                                className="btn btn-sm"
                                style={{
                                  background: tab === "solution" ? "#ECFDF5" : "var(--gray-100)",
                                  color: tab === "solution" ? "var(--success)" : "var(--gray-700)",
                                  border: "none", fontSize: "0.75rem", padding: "0.3rem 0.6rem"
                                }}
                              >
                                <Eye size={12} />
                                {tab === "paper" ? `Pg ${file.page_number}` : `Sol ${file.page_number}`}
                              </button>

                              {/* Download button → /download/ */}
                              <button
                                onClick={() => handleDownload(
                                  `${API_URL}/api/${fileEndpoint}/${file.id}/download/`,
                                  `${filePrefix}-${file.page_number}`, false
                                )}
                                className="btn btn-sm"
                                style={{
                                  background: "none",
                                  color: tab === "solution" ? "var(--success)" : "var(--primary)",
                                  border: `1px solid ${tab === "solution" ? "var(--success)" : "var(--primary)"}`,
                                  fontSize: "0.75rem", padding: "0.3rem 0.5rem"
                                }}
                              >
                                <Download size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: "0.8rem", color: "var(--gray-400)" }}>
                          No {tab === "paper" ? "pages" : "solutions"} uploaded yet.
                        </p>
                      )}
                    </>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}