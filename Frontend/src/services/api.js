import axios from "axios";
import API_URL from "../config";
 
const BASE_URL = API_URL
 
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});
 
// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
 
// Auto refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem("refresh_token");
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh/`, { refresh });
        localStorage.setItem("access_token", data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
 
// Auth
export const login = (data) => api.post("/api/auth/login/", data);
export const register = (data) => api.post("/api/auth/register/", data);
export const getProfile = () => api.get("/api/auth/profile/");
export const changePassword = (data) => api.post("/api/auth/change-password/", data);
 
// Programs
export const getPrograms = (params) => api.get("/api/programs/", { params });
export const getProgram = (id) => api.get(`/api/programs/${id}/`);
 
// Semesters
export const getSemesters = (params) => api.get("/api/semesters/", { params });
export const getSemester = (id) => api.get(`/api/semesters/${id}/`);
 
// Subjects
export const getSubjects = (params) => api.get("/api/subjects/", { params });
export const getSubject = (id) => api.get(`/api/subjects/${id}/`);
 
// Notes
export const getNotes = (params) => api.get("/api/notes/", { params });
export const getNote = (id) => api.get(`/api/notes/${id}/`);
export const downloadNote = (id) => api.get(`/api/notes/${id}/download/`, { responseType: "blob" });
 
// Past Year Papers
export const getPastYearPapers = (params) => api.get("/api/past-year-papers/", { params });
export const getPastYearPaper = (id) => api.get(`/api/past-year-papers/${id}/`);
export const downloadPaper = (id) => api.get(`/api/past-year-papers/${id}/download/`, { responseType: "blob" });
 
// Stats
export const getStats = () => api.get("/api/stats/");
 
export default api;