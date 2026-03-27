import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStats, getPrograms } from "../services/api";
import { BookOpen, FileText, GraduationCap, Download, ArrowRight } from "lucide-react";

export default function Home() {
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: () => getStats().then(r => r.data) });
  const { data: programs } = useQuery({ queryKey: ["programs"], queryFn: () => getPrograms().then(r => r.data) });

  const statCards = [
  { label: "Programs", value: stats?.total_programs ?? 0, icon: GraduationCap, color: "var(--primary)" },
  { label: "Subjects", value: stats?.total_subjects ?? 0, icon: BookOpen, color: "#0EA5E9" },
  { label: "Notes", value: stats?.total_notes ?? 0, icon: FileText, color: "#059669" },
  { label: "Past Papers", value: stats?.total_past_year_papers ?? 0, icon: Download, color: "#D97706" },
];

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #0EA5E9 100%)",
        padding: "5rem 0 4rem", color: "white", textAlign: "center"
      }}>
        <div className="container">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.15)", borderRadius: "999px", padding: "0.35rem 1rem", marginBottom: "1.5rem", fontSize: "0.85rem" }}>
            <BookOpen size={14} /> Your academic resource hub
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontFamily: "Fraunces, serif", marginBottom: "1rem", color: "white" }}>
            Study Smarter with<br />BCA Tutor
          </h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.85, maxWidth: "500px", margin: "0 auto 2rem" }}>
            Access notes, question papers, and study materials for all BCA subjects — all in one place.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/programs" className="btn" style={{ background: "white", color: "var(--primary)", fontWeight: 600, padding: "0.75rem 1.75rem" }}>
              Browse Programs <ArrowRight size={16} />
            </Link>
            <Link to="/register" className="btn" style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1.5px solid rgba(255,255,255,0.4)", padding: "0.75rem 1.75rem" }}>
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: "white", padding: "2.5rem 0", borderBottom: "1px solid var(--gray-200)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem" }}>
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{ textAlign: "center", padding: "1.25rem" }}>
                <div style={{ display: "inline-flex", padding: "0.75rem", background: `${color}18`, borderRadius: "12px", marginBottom: "0.75rem" }}>
                  <Icon size={24} color={color} />
                </div>
                <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--gray-900)", fontFamily: "Fraunces, serif" }}>{value}</div>
                <div style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="page">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.6rem", color: "var(--gray-900)" }}>Browse Programs</h2>
              <p style={{ color: "var(--gray-500)", marginTop: "0.25rem", fontSize: "0.9rem" }}>Select a program to explore semesters and subjects</p>
            </div>
            <Link to="/programs" style={{ color: "var(--primary)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid-3">
            {programs?.results?.slice(0, 6).map(program => (
              <Link key={program.id} to={`/programs/${program.id}/semesters`}>
                <div className="card" style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <div style={{ background: "var(--primary-light)", borderRadius: "8px", padding: "8px", display: "flex" }}>
                      <GraduationCap size={20} color="var(--primary)" />
                    </div>
                    <span className="badge badge-blue">{program.code}</span>
                  </div>
                  <h3 style={{ fontSize: "1rem", fontFamily: "DM Sans, sans-serif", fontWeight: 600, color: "var(--gray-900)", marginBottom: "0.5rem" }}>{program.name}</h3>
                  {program.description && <p style={{ fontSize: "0.82rem", color: "var(--gray-500)", lineHeight: 1.5 }}>{program.description.slice(0, 80)}{program.description.length > 80 ? "..." : ""}</p>}
                  <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--gray-400)" }}>
                    <span>{program.semesters_count} semesters</span>
                    <span>{program.notes_count} notes</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}