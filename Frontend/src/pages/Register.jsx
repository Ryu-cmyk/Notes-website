import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { register as registerUser, login } from "../services/api";
import { getProfile } from "../services/api";
import useAuthStore from "../store/authStore";

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const { login: storeLogin } = useAuthStore();
  const navigate = useNavigate();
  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      await registerUser({ email: data.email, first_name: data.first_name, last_name: data.last_name, password: data.password, password2: data.password2, phone_number: data.phone_number || undefined });
      const res = await login({ email: data.email, password: data.password });
      const tokens = res.data;
      localStorage.setItem("access_token", tokens.access);
      const profile = await getProfile();
      storeLogin(tokens, profile.data);
      toast.success("Account created successfully!");
      navigate("/programs");
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        const msg = Object.values(errors).flat()[0];
        toast.error(msg || "Registration failed");
      } else {
        toast.error("Registration failed");
      }
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "460px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "inline-flex", background: "var(--primary)", borderRadius: "12px", padding: "10px", marginBottom: "1rem" }}>
            <BookOpen size={24} color="white" />
          </div>
          <h1 style={{ fontSize: "1.75rem", color: "var(--gray-900)" }}>Create account</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.9rem", marginTop: "0.25rem" }}>Join BCA Tutor today</p>
        </div>

        <div className="card" style={{ padding: "2rem" }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-input" placeholder="Ram" {...register("first_name", { required: "Required" })} />
                {errors.first_name && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.3rem" }}>{errors.first_name.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" placeholder="poudel" {...register("last_name", { required: "Required" })} />
                {errors.last_name && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.3rem" }}>{errors.last_name.message}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" {...register("email", { required: "Email is required" })} />
              {errors.email && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.3rem" }}>{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(Required)</span></label>
              <input className="form-input" placeholder="+9779800000000" {...register("phone_number", { required: "Phone number is required" })} />
              {errors.phone_number && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.3rem" }}>{errors.phone_number.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input className="form-input" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  style={{ paddingRight: "2.5rem" }}
                  {...register("password", { required: "Password is required", minLength: { value: 8, message: "Minimum 8 characters" } })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.3rem" }}>{errors.password.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                {...register("password2", { required: "Required", validate: v => v === password || "Passwords do not match" })} />
              {errors.password2 && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.3rem" }}>{errors.password2.message}</p>}
            </div>

            {/* Terms & Privacy */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", margin: "1rem 0" }}>
              <input
                type="checkbox"
                id="terms"
                style={{ marginTop: "3px", cursor: "pointer", accentColor: "var(--primary)", width: "15px", height: "15px", flexShrink: 0 }}
                {...register("terms", { required: "You must agree to the terms to continue" })}
              />
              <label htmlFor="terms" style={{ fontSize: "0.85rem", color: "var(--gray-600)", cursor: "pointer", lineHeight: 1.5 }}>
                I agree to the{" "}
                <Link to="/terms" target="_blank" style={{ color: "var(--primary)", fontWeight: 500 }}>Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy" target="_blank" style={{ color: "var(--primary)", fontWeight: 500 }}>Privacy Policy</Link>
                , including the use of my name, email, and phone number to operate and improve the platform.
              </label>
            </div>
            {errors.terms && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "-0.5rem", marginBottom: "0.75rem" }}>{errors.terms.message}</p>}

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}
              style={{ width: "100%", justifyContent: "center", padding: "0.75rem", marginTop: "0.5rem" }}>
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--gray-500)" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}