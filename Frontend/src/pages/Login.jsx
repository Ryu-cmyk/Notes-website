import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { login } from "../services/api";
import { getProfile } from "../services/api";
import useAuthStore from "../store/authStore";

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const { login: storeLogin } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await login(data);
      const tokens = res.data;
      // fetch profile
      localStorage.setItem("access_token", tokens.access);
      const profile = await getProfile();
      storeLogin(tokens, profile.data);
      toast.success("Welcome back!");
      navigate("/programs");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid email or password");
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "inline-flex", background: "var(--primary)", borderRadius: "12px", padding: "10px", marginBottom: "1rem" }}>
            <BookOpen size={24} color="white" />
          </div>
          <h1 style={{ fontSize: "1.75rem", color: "var(--gray-900)" }}>Welcome back</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.9rem", marginTop: "0.25rem" }}>Sign in to your BCA Tutor account</p>
        </div>

        <div className="card" style={{ padding: "2rem" }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.3rem" }}>{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  style={{ paddingRight: "2.5rem" }}
                  {...register("password", { required: "Password is required" })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.3rem" }}>{errors.password.message}</p>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}
              style={{ width: "100%", justifyContent: "center", padding: "0.75rem", marginTop: "0.5rem" }}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--gray-500)" }}>
          Don't have an account? <Link to="/register" style={{ color: "var(--primary)", fontWeight: 500 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}