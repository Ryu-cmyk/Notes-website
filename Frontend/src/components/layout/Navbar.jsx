import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "../../assets/logo.jpeg";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/programs", label: "Programs" },
    { to: "/contact", label: "Contact Us" },
  ];

  return (
    <>
      <nav style={{
        background: "white", borderBottom: "1px solid var(--gray-200)",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
      }}>
        <div className="container" style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", height: "64px"
        }}>

          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} onClick={() => setMenuOpen(false)}>
            <img
              src={logo}
              alt="BCA Tutor"
              style={{ width: "80px", height: "60px", borderRadius: "20px", objectFit: "contain" }}
            />
            <span style={{ fontFamily: "Fraunces, serif", fontSize: "1.2rem", fontWeight: 700, color: "var(--gray-900)" }}>
              BCA Tutor
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }} className="desktop-only">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                fontSize: "0.9rem",
                color: isActive(to) ? "var(--primary)" : "var(--gray-600)",
                fontWeight: isActive(to) ? 600 : 400,
                transition: "color 0.2s"
              }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }} className="desktop-only">
            {isAuthenticated ? (
              <>
                <Link to="/profile" style={{
                  fontSize: "0.85rem",
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--gray-200)",
                  background: isActive("/profile") ? "var(--primary-light)" : "white",
                  transition: "all 0.2s"
                }}>
                  <User size={14} color={isActive("/profile") ? "var(--primary)" : "var(--gray-500)"} />
                  <span style={{ color: isActive("/profile") ? "var(--primary)" : "var(--gray-600)" }}>
                    {user?.first_name || user?.email || "Profile"}
                  </span>
                </Link>
                <button onClick={handleLogout} className="btn btn-outline btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <LogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-only"
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "8px", color: "var(--gray-700)",
              display: "flex", alignItems: "center"
            }}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", top: "64px", left: 0, right: 0, bottom: 0,
          background: "white", zIndex: 99,
          padding: "1.5rem",
          display: "flex", flexDirection: "column", gap: "0.5rem",
          borderTop: "1px solid var(--gray-200)"
        }}>
          {/* Nav links */}
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: "0.875rem 1rem",
                borderRadius: "var(--radius)",
                fontSize: "1rem",
                fontWeight: isActive(to) ? 600 : 400,
                color: isActive(to) ? "var(--primary)" : "var(--gray-700)",
                background: isActive(to) ? "var(--primary-light)" : "transparent",
                display: "block"
              }}
            >
              {label}
            </Link>
          ))}

          <div style={{ borderTop: "1px solid var(--gray-200)", marginTop: "0.5rem", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    padding: "0.875rem 1rem", borderRadius: "var(--radius)",
                    fontSize: "1rem", color: isActive("/profile") ? "var(--primary)" : "var(--gray-700)",
                    background: isActive("/profile") ? "var(--primary-light)" : "var(--gray-50)",
                    display: "flex", alignItems: "center", gap: "0.5rem"
                  }}
                >
                  <User size={16} /> {user?.first_name || user?.email || "Profile"}
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "0.875rem 1rem", borderRadius: "var(--radius)",
                    fontSize: "1rem", color: "var(--danger)",
                    background: "#FEF2F2", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    fontFamily: "DM Sans, sans-serif"
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn btn-outline"
                  style={{ justifyContent: "center", padding: "0.875rem" }}>
                  Login
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn btn-primary"
                  style={{ justifyContent: "center", padding: "0.875rem" }}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        .desktop-only { display: flex !important; }
        .mobile-only { display: none !important; }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </>
  );
}