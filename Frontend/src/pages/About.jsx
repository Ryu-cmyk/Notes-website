import { BookOpen, Users, FileText, GraduationCap, Heart } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: <GraduationCap size={22} color="#2563EB" />,
      bg: "#EFF6FF",
      title: "Student-First",
      desc: "Built by BCA students, for BCA students. We know exactly what you need because we've been there.",
    },
    {
      icon: <FileText size={22} color="#059669" />,
      bg: "#ECFDF5",
      title: "Updated Resources",
      desc: "New syllabus means new notes and new question papers. We make sure everything here matches the current curriculum.",
    },
    {
      icon: <Users size={22} color="#D97706" />,
      bg: "#FFFBEB",
      title: "Community Driven",
      desc: "We started this to help our juniors. As the community grows, so does the quality of resources.",
    },
    {
      icon: <Heart size={22} color="#E1306C" />,
      bg: "#FFF0F5",
      title: "Free & Accessible",
      desc: "Education should be accessible to everyone. Our core resources are free for all BCA students.",
    },
  ];

  return (
    <div className="page">
      <style>{`
        .about-values-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-top: 2.5rem;
        }
        @media (max-width: 600px) {
          .about-values-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="container" style={{ maxWidth: "760px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-flex", background: "var(--primary)", borderRadius: "14px", padding: "12px", marginBottom: "1.25rem" }}>
            <BookOpen size={28} color="white" />
          </div>
          <h1 style={{ fontSize: "2rem", color: "var(--gray-900)", marginBottom: "0.75rem" }}>About BCA Tutor</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "1rem", lineHeight: 1.7, maxWidth: "560px", margin: "0 auto" }}>
            A platform built by BCA students, for BCA students — because we know how hard it is to find the right resources when the syllabus changes.
          </p>
        </div>

        {/* Our Story */}
        <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--gray-900)", marginBottom: "1rem" }}>
            Our Story
          </h2>
          <p style={{ color: "var(--gray-600)", lineHeight: 1.8, marginBottom: "1rem", fontSize: "0.95rem" }}>
            We are fellow BCA students who joined when the new BCA syllabus was released — making us the very first semester under this updated curriculum. Starting fresh meant one thing: almost everything we needed was hard to find. Notes were outdated, question papers didn't match, and resources built for the old syllabus weren't relevant anymore.
          </p>
          <p style={{ color: "var(--gray-600)", lineHeight: 1.8, marginBottom: "1rem", fontSize: "0.95rem" }}>
            We figured it out the hard way. But we didn't want our juniors to go through the same struggle.
          </p>
          <p style={{ color: "var(--gray-600)", lineHeight: 1.8, fontSize: "0.95rem" }}>
            So we built BCA Tutor — a place where students can find notes, past year question papers, and study materials that actually match the <strong>new syllabus</strong>. Everything here is made with the current curriculum in mind, so you spend less time searching and more time learning.
          </p>
        </div>

        {/* Mission */}
        <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem", borderLeft: "4px solid var(--primary)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--gray-900)", marginBottom: "0.75rem" }}>
            Our Mission
          </h2>
          <p style={{ color: "var(--gray-600)", lineHeight: 1.8, fontSize: "0.95rem" }}>
            To make quality study resources freely available to every BCA student in Nepal — especially those navigating the new syllabus for the first time. We want every junior to have a smoother academic journey than we did.
          </p>
        </div>

        {/* Values */}
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--gray-800)", marginTop: "2rem" }}>
          What we stand for
        </h2>
        <div className="about-values-grid">
          {values.map((v) => (
            <div className="card" key={v.title} style={{ padding: "1.5rem" }}>
              <div style={{ background: v.bg, borderRadius: "10px", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                {v.icon}
              </div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--gray-900)", marginBottom: "0.4rem" }}>{v.title}</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", lineHeight: 1.6 }}>{v.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "3rem", padding: "2rem", background: "var(--gray-50)", borderRadius: "16px", border: "1px solid var(--gray-200)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--gray-900)", marginBottom: "0.5rem" }}>
            Want to contribute?
          </h2>
          <p style={{ color: "var(--gray-500)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
            If you have notes, question papers, or resources that could help fellow students, reach out to us.
          </p>
          <a href="/contact" style={{ display: "inline-block", background: "var(--primary)", color: "white", padding: "0.65rem 1.5rem", borderRadius: "8px", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>
            Contact Us
          </a>
        </div>

      </div>
    </div>
  );
}