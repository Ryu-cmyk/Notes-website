import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { getPastYearPapers, getSubject } from "../services/api";
import { FileCheck, Download, Lock, Eye } from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import API_URL from "../config";

export default function PastYearPapers() {
  const { subjectId } = useParams();
  const { isAuthenticated } = useAuthStore();

  const { data: subject } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: () => getSubject(subjectId).then(r => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["papers", subjectId],
    queryFn: () => getPastYearPapers({ subject: subjectId }).then(r => r.data),
  });

  const handleDownload = async (url, filename, view = false) => {
    if (!isAuthenticated) {
      toast.error("Please login to view or download files");
      return;
    }
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed");
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      if (view) {
        window.open(objectUrl, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(objectUrl);
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
          <div className="loading">Loading papers...</div>
        ) : data?.results?.length === 0 ? (
          <div className="empty">
            <h3>No papers yet</h3>
            <p>Check back later</p>
          </div>
        ) : (
          <div className="grid-2">
            {data?.results?.map(paper => (
              <div key={paper.id} className="card" style={{ padding: "1.25rem" }}>

                {/* Paper header row */}
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div style={{ background: "#F5F3FF", borderRadius: "8px", padding: "10px", flexShrink: 0 }}>
                    <FileCheck size={20} color="#7C3AED" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: "0.95rem", fontWeight: 600,
                      color: "var(--gray-900)", fontFamily: "DM Sans, sans-serif",
                      marginBottom: "0.4rem"
                    }}>
                      {paper.title}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                      <span className="badge" style={{ background: "#F5F3FF", color: "#7C3AED" }}>{paper.year}</span>
                      {paper.has_solution && <span className="badge badge-green">Has Solution</span>}
                      <span style={{ fontSize: "0.75rem", color: "var(--gray-400)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Eye size={12} /> {paper.download_count} downloads
                      </span>
                    </div>
                  </div>

                  {/* Main View + Download buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flexShrink: 0 }}>
                    <button
                      onClick={() => handleDownload(
                        `${API_URL}/api/past-year-papers/${paper.id}/download/`,
                        `${paper.title}-${paper.year}`,
                        true
                      )}
                      className="btn btn-sm"
                      style={{ background: "var(--gray-100)", color: "var(--gray-700)", border: "none", justifyContent: "center" }}
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      onClick={() => handleDownload(
                        `${API_URL}/api/past-year-papers/${paper.id}/download/`,
                        `${paper.title}-${paper.year}`,
                        false
                      )}
                      className="btn btn-sm"
                      style={{
                        background: isAuthenticated ? "#7C3AED" : "var(--gray-100)",
                        color: isAuthenticated ? "white" : "var(--gray-500)",
                        border: "none", justifyContent: "center"
                      }}
                    >
                      {isAuthenticated ? <Download size={13} /> : <Lock size={13} />}
                      {isAuthenticated ? "Download" : "Login"}
                    </button>
                  </div>
                </div>

                {/* Individual paper pages */}
                {paper.paper_files && paper.paper_files.length > 0 && (
                  <div style={{ borderTop: "1px solid var(--gray-200)", paddingTop: "0.75rem" }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginBottom: "0.5rem" }}>
                      Pages:
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {paper.paper_files.map(file => (
                        <div key={file.id} style={{ display: "flex", gap: "0.25rem" }}>
                          <button
                            onClick={() => handleDownload(
                              `${API_URL}/api/past-year-paper-files/${file.id}/download/`,
                              `page-${file.page_number}`,
                              true
                            )}
                            className="btn btn-sm"
                            style={{ background: "var(--gray-100)", color: "var(--gray-700)", border: "none", fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                          >
                            <Eye size={12} /> Pg {file.page_number}
                          </button>
                          <button
                            onClick={() => handleDownload(
                              `${API_URL}/api/past-year-paper-files/${file.id}/download/`,
                              `page-${file.page_number}`,
                              false
                            )}
                            className="btn btn-sm"
                            style={{ background: "var(--gray-100)", color: "#7C3AED", border: "1px solid #7C3AED", fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                          >
                            <Download size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Solution pages */}
                {paper.solution_files && paper.solution_files.length > 0 && (
                  <div style={{ borderTop: "1px solid var(--gray-200)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                    <p style={{ fontSize: "0.75rem", color: "#059669", marginBottom: "0.5rem" }}>
                      Solutions:
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {paper.solution_files.map(file => (
                        <div key={file.id} style={{ display: "flex", gap: "0.25rem" }}>
                          <button
                            onClick={() => handleDownload(
                              `${API_URL}/api/past-year-paper-solutions/${file.id}/download/`,
                              `solution-${file.page_number}`,
                              true
                            )}
                            className="btn btn-sm"
                            style={{ background: "#ECFDF5", color: "#059669", border: "none", fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                          >
                            <Eye size={12} /> Sol {file.page_number}
                          </button>
                          <button
                            onClick={() => handleDownload(
                              `${API_URL}/api/past-year-paper-solutions/${file.id}/download/`,
                              `solution-${file.page_number}`,
                              false
                            )}
                            className="btn btn-sm"
                            style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #059669", fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                          >
                            <Download size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}