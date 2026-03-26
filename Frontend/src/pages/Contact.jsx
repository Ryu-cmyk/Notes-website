import { Mail, Phone, MapPin, QrCode, ExternalLink } from "lucide-react";
import qr from "../assets/qr.jpeg";

export default function Contact() {
  const socials = [
    {
      label: "Facebook",
      initial: "f",
      handle: "@bcatutor",
      url: "https://www.facebook.com/profile.php?id=61577498932087",
      color: "#1877F2",
      bg: "#EBF5FF",
    },
    {
      label: "Instagram",
      initial: "in",
      handle: "@bcatutor",
      url: "https://www.instagram.com/bca_tutor?igsh=b2N0bmJ3dXczajB6",
      color: "#E1306C",
      bg: "#FFF0F5",
    },
    {
      label: "YouTube",
      initial: "yt",
      handle: "BCA Tutor",
      url: "https://youtube.com/@bcatutor",
      color: "#FF0000",
      bg: "#FFF0F0",
    },
    {
      label: "Email",
      initial: "@",
      handle: "bcatutor@gmail.com",
      url: "mailto:bcatutor@gmail.com",
      color: "#059669",
      bg: "#ECFDF5",
    },
  ];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: "800px" }}>

        {/* Header */}
        <div className="page-header" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "2rem", color: "var(--gray-900)" }}>Contact Us</h1>
          <p style={{ color: "var(--gray-500)", marginTop: "0.5rem", fontSize: "0.95rem" }}>
            Have questions or need support? Reach out to us through any of the channels below.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

          {/* Left — Social links */}
          <div>
            <h2 style={{ fontSize: "1rem", fontFamily: "DM Sans, sans-serif", fontWeight: 600, color: "var(--gray-700)", marginBottom: "1rem" }}>
              Find us on
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {socials.map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <div className="card" style={{
                    padding: "1rem 1.25rem",
                    display: "flex", alignItems: "center", gap: "1rem",
                    transition: "all 0.2s"
                  }}>
                    <div style={{
                      background: item.bg, borderRadius: "10px",
                      width: "40px", height: "40px", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, color: item.color, fontSize: "0.85rem"
                    }}>
                      {item.initial}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--gray-800)" }}>{item.label}</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--gray-400)" }}>{item.handle}</p>
                    </div>
                    <div style={{ marginLeft: "auto", color: "var(--gray-300)" }}>
                      <ExternalLink size={14} />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right — QR code + support */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* QR Code */}
            <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
              <h2 style={{ fontSize: "1rem", fontFamily: "DM Sans, sans-serif", fontWeight: 600, color: "var(--gray-700)", marginBottom: "1rem" }}>
                Support Us
              </h2>
              <div style={{
                display: "inline-flex", padding: "1rem",
                background: "var(--gray-50)", borderRadius: "12px",
                border: "1px solid var(--gray-200)"
              }}>
                <img
                  src={qr}
                  alt="QR Code"
                  style={{ width: "140px", height: "140px", objectFit: "contain" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentNode.innerHTML = `<div style="width:140px;height:140px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#9CA3AF;font-size:12px;"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/></svg><span>Add qr.jpeg to assets</span></div>`;
                  }}
                />
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--gray-400)", marginTop: "0.75rem" }}>
                Scan For Donatiom
              </p>
            </div>

            {/* Support info */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <h2 style={{ fontSize: "1rem", fontFamily: "DM Sans, sans-serif", fontWeight: 600, color: "var(--gray-700)", marginBottom: "1rem" }}>
                Support
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ background: "#EFF6FF", borderRadius: "8px", padding: "7px", display: "flex" }}>
                    <Mail size={16} color="var(--primary)" />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>Email Support</p>
                    <a href="mailto:bcatutor@gmail.com" style={{ fontSize: "0.875rem", color: "var(--primary)", fontWeight: 500 }}>
                      bcatutor@gmail.com
                    </a>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ background: "#ECFDF5", borderRadius: "8px", padding: "7px", display: "flex" }}>
                    <Phone size={16} color="#059669" />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>Phone</p>
                    <p style={{ fontSize: "0.875rem", color: "var(--gray-800)", fontWeight: 500 }}>+977 98XXXXXXXX</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ background: "#FFFBEB", borderRadius: "8px", padding: "7px", display: "flex" }}>
                    <MapPin size={16} color="#D97706" />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>Location</p>
                    <p style={{ fontSize: "0.875rem", color: "var(--gray-800)", fontWeight: 500 }}>Kathmandu, Nepal</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}