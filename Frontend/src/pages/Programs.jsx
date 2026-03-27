
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, ArrowRight } from "lucide-react";
import { getPrograms } from "../services/api";
 
export function Programs() {
  const { data, isLoading } = useQuery({ queryKey: ["programs"], queryFn: () => getPrograms().then(r => r.data) });
 
  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Programs</h1>
          <p>Choose a program to browse its semesters and subjects</p>
        </div>
        {isLoading ? (
          <div className="loading">Loading programs...</div>
        ) : (
          <div className="grid-3">
            {data?.results?.map(program => (
              <Link key={program.id} to={`/programs/${program.id}/semesters`}>
                <div className="card" style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div style={{ background: "var(--primary-light)", borderRadius: "8px", padding: "8px", display: "flex" }}>
                      <GraduationCap size={22} color="var(--primary)" />
                    </div>
                    <span className="badge badge-blue">{program.code}</span>
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--gray-900)", marginBottom: "0.5rem", fontFamily: "DM Sans, sans-serif" }}>{program.name}</h3>
                  {program.description && <p style={{ fontSize: "0.82rem", color: "var(--gray-500)", marginBottom: "1rem" }}>{program.description.slice(0, 90)}{program.description.length > 90 ? "..." : ""}</p>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                    <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--gray-400)" }}>
                      <span>{program.semesters_count} semesters</span>
                      <span>{program.notes_count} notes</span>
                    </div>
                    <ArrowRight size={16} color="var(--primary)" />
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
 