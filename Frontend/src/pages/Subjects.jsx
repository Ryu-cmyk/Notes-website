import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { getSubjects, getSemester } from "../services/api";
import { BookOpen, FileText } from "lucide-react";
 
export function Subjects() {
  const { semesterId } = useParams();
  const { data: semester } = useQuery({ queryKey: ["semester", semesterId], queryFn: () => getSemester(semesterId).then(r => r.data) });
  const { data, isLoading } = useQuery({ queryKey: ["subjects", semesterId], queryFn: () => getSubjects({ semester: semesterId }).then(r => r.data) });
 
  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/programs">Programs</Link> /
          <Link to={`/programs/${semester?.program}/semesters`}>Semesters</Link> /
          <span>{semester?.name}</span>
        </div>
        <div className="page-header">
          <h1>Subjects</h1>
          <p>{semester?.name} — pick a subject to view notes and papers</p>
        </div>
        {isLoading ? (
          <div className="loading">Loading subjects...</div>
        ) : (
          <div className="grid-3">
            {data?.results?.map(subject => (
              <div key={subject.id} className="card" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div style={{ background: "#F0FDFA", borderRadius: "8px", padding: "8px", display: "flex" }}>
                    <BookOpen size={20} color="#0D9488" />
                  </div>
                  <span className="badge" style={{ background: "#F0FDFA", color: "#0D9488" }}>{subject.code}</span>
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--gray-900)", marginBottom: "1rem", fontFamily: "DM Sans, sans-serif" }}>{subject.name}</h3>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <Link to={`/subjects/${subject.id}/notes`} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                    <BookOpen size={13} /> Notes ({subject.notes_count})
                  </Link>
                  <Link to={`/subjects/${subject.id}/past-year-papers`} className="btn btn-sm" style={{ flex: 1, justifyContent: "center", background: "#F0FDFA", color: "#0D9488", border: "1.5px solid #0D9488" }}>
                    <FileText size={13} /> Papers ({subject.past_year_papers_count})
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}