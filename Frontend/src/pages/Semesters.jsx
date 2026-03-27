import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";

import { getSemesters, getProgram } from "../services/api";
import { Calendar } from "lucide-react";
 
export function Semesters() {
  const { programId } = useParams();
  const { data: program } = useQuery({ queryKey: ["program", programId], queryFn: () => getProgram(programId).then(r => r.data) });
  const { data, isLoading } = useQuery({ queryKey: ["semesters", programId], queryFn: () => getSemesters({ program: programId }).then(r => r.data) });
 
  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/programs">Programs</Link> / <span>{program?.name}</span>
        </div>
        <div className="page-header">
          <h1>Semesters</h1>
          <p>{program?.name} — select a semester to browse subjects</p>
        </div>
        {isLoading ? (
          <div className="loading">Loading semesters...</div>
        ) : (
          <div className="grid-3">
            {data?.results?.map(sem => (
              <Link key={sem.id} to={`/semesters/${sem.id}/subjects`}>
                <div className="card" style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <div style={{ background: "#EFF6FF", borderRadius: "8px", padding: "8px", display: "flex" }}>
                      <Calendar size={20} color="var(--primary)" />
                    </div>
                    <span className="badge badge-blue">Sem {sem.number}</span>
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--gray-900)", fontFamily: "DM Sans, sans-serif" }}>{sem.name}</h3>
                  <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--gray-400)", display: "flex", gap: "1rem" }}>
                    <span>{sem.subjects_count} subjects</span>
                    <span>{sem.notes_count} notes</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
 