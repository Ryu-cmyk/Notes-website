import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.jpeg";

export default function Footer() {
  return (
    <footer style={{ background: "var(--gray-900)", color: "var(--gray-400)", padding: "2.5rem 0" }}>
      <div className="container" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
         <img
                     src={logo}
                     alt="BCA Tutor"
                     style={{ width: "50px", height: "50px", borderRadius: "30px", objectFit: "contain" }}
                   />
          <span style={{ fontFamily: "Fraunces, serif", color: "white", fontSize: "1rem" }}>BCA Tutor</span>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.85rem" }}>
          <Link to="/" style={{ color: "var(--gray-400)" }}>Home</Link>
          <Link to="/programs" style={{ color: "var(--gray-400)" }}>Programs</Link>
          <Link to="/login" style={{ color: "var(--gray-400)" }}>Login</Link>
        </div>
        <p style={{ fontSize: "0.8rem" }}>© {new Date().getFullYear()} BCA Tutor. All rights reserved.</p>
      </div>
    </footer>
  );
}