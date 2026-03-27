import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import {Programs} from "./pages/Programs.jsx";
import {Semesters} from "./pages/Semesters.jsx";
import {Subjects} from "./pages/Subjects.jsx";
import Notes from "./pages/Notes.jsx";
import PastYearPapers from "./pages/PastYearPapers.jsx";
import Profile from "./pages/Profile.jsx";
import Contact from "./pages/Contact.jsx";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/programs/:programId/semesters" element={<Semesters />} />
          <Route path="/semesters/:semesterId/subjects" element={<Subjects />} />
          <Route path="/subjects/:subjectId/notes" element={<Notes />} />
          <Route path="/subjects/:subjectId/past-year-papers" element={<PastYearPapers />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}