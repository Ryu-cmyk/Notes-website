import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { getProfile, changePassword } from "../services/api";
import useAuthStore from "../store/authStore";
import { User, Mail, Phone, Lock, Calendar, Edit2, Check, X } from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    getProfile()
      .then(r => {
        setProfile(r.data);
        setUser(r.data);
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const onChangePassword = async (data) => {
    if (data.new_password !== data.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await changePassword({
        old_password: data.old_password,
        new_password: data.new_password,
      });
      toast.success("Password changed successfully!");
      reset();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to change password");
    }
  };

  const getInitials = (first, last) => {
    return `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: "700px" }}>

        {/* Profile header */}
        <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            {/* Avatar */}
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "var(--primary)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "1.5rem", fontWeight: 700, color: "white",
              flexShrink: 0
            }}>
              {getInitials(profile?.first_name, profile?.last_name)}
            </div>

            <div>
              <h1 style={{ fontSize: "1.4rem", color: "var(--gray-900)", marginBottom: "0.25rem" }}>
                {profile?.first_name} {profile?.last_name}
              </h1>
              <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>{profile?.email}</p>
              <span className="badge badge-blue" style={{ marginTop: "0.4rem" }}>
                {profile?.is_staff ? "Staff" : "Student"}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <button
            onClick={() => setActiveTab("info")}
            className="btn"
            style={{
              background: activeTab === "info" ? "var(--primary)" : "white",
              color: activeTab === "info" ? "white" : "var(--gray-600)",
              border: "1.5px solid",
              borderColor: activeTab === "info" ? "var(--primary)" : "var(--gray-200)",
            }}
          >
            <User size={15} /> My Info
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className="btn"
            style={{
              background: activeTab === "password" ? "var(--primary)" : "white",
              color: activeTab === "password" ? "white" : "var(--gray-600)",
              border: "1.5px solid",
              borderColor: activeTab === "password" ? "var(--primary)" : "var(--gray-200)",
            }}
          >
            <Lock size={15} /> Change Password
          </button>
        </div>

        {/* Info tab */}
        {activeTab === "info" && (
          <div className="card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontSize: "1rem", marginBottom: "1.5rem", color: "var(--gray-800)" }}>
              Account Information
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {[
                { icon: User, label: "First Name", value: profile?.first_name },
                { icon: User, label: "Last Name", value: profile?.last_name },
                { icon: Mail, label: "Email", value: profile?.email },
                { icon: Phone, label: "Phone Number", value: profile?.phone_number || "Not set" },
                { icon: Calendar, label: "Member Since", value: new Date(profile?.date_joined).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  padding: "0.875rem 1rem",
                  background: "var(--gray-50)", borderRadius: "var(--radius)",
                  border: "1px solid var(--gray-200)"
                }}>
                  <div style={{ background: "var(--primary-light)", borderRadius: "8px", padding: "7px", display: "flex", flexShrink: 0 }}>
                    <Icon size={16} color="var(--primary)" />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginBottom: "0.1rem" }}>{label}</p>
                    <p style={{ fontSize: "0.9rem", color: "var(--gray-800)", fontWeight: 500 }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Change password tab */}
        {activeTab === "password" && (
          <div className="card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontSize: "1rem", marginBottom: "1.5rem", color: "var(--gray-800)" }}>
              Change Password
            </h2>

            <form onSubmit={handleSubmit(onChangePassword)}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  {...register("old_password", { required: "Current password is required" })}
                />
                {errors.old_password && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.3rem" }}>{errors.old_password.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  {...register("new_password", { required: "New password is required", minLength: { value: 8, message: "Minimum 8 characters" } })}
                />
                {errors.new_password && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.3rem" }}>{errors.new_password.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  {...register("confirm_password", { required: "Please confirm your password" })}
                />
                {errors.confirm_password && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.3rem" }}>{errors.confirm_password.message}</p>}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ width: "100%", justifyContent: "center", padding: "0.75rem", marginTop: "0.5rem" }}
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}