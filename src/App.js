import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "./app/components/Header";
import Login from "./app/components/Login";
import Registro from "./app/components/Registro";
import Dashboard from "./app/components/Dashboard";
import Vacantes from "./app/components/Vacantes";
import Inicio from "./app/components/Inicio";
import DashboardEmpresa from "./app/components/DashboardEmpresa";
import PostulantesVacante from "./app/components/PostulantesVacante";
import EditarEmpresa from "./app/components/EditarEmpresa";
import EditarPerfil from "./app/components/perfil";

// PERFIL EMPRESA
import PerfilEmpresa from "./app/components/perfilEmpresa";

// USUARIO
import MiCV from "./app/components/MiCV";
import MisPostulaciones from "./app/components/MisPostulaciones";
import MisFavoritos from "./app/components/MisFavoritos";

function App() {
  return (
    <Router>
      {/* HEADER FIJO */}
      <Header />

      {/* 🔔 TOASTS (debajo del header) */}
      <ToastContainer
        position="bottom-center"
        autoClose={2500}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        style={{ marginTop: "80px" }} // 👈 AJUSTA si tu header es más alto
      />

      {/* RUTAS */}
      <Routes>
        {/* ==================== PÚBLICAS ==================== */}
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* ==================== DASHBOARD GENERAL ==================== */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* ==================== DASHBOARD EMPRESA ==================== */}
        <Route
          path="/company/:companyId/dashboard"
          element={<DashboardEmpresa />}
        />

        <Route
          path="/dashboard/vacantes/:jobId/postulantes"
          element={<PostulantesVacante />}
        />

        <Route
          path="/company/:companyId/editar"
          element={<EditarEmpresa />}
        />

        {/* ==================== VACANTES EMPRESA ==================== */}
        <Route path="/dashboard/vacantes" element={<Vacantes />} />
        <Route path="/dashboard/vacantes/:jobId" element={<Vacantes />} />

        {/* ==================== PERFIL EMPRESA ==================== */}
        <Route path="/empresa/:companyId" element={<PerfilEmpresa />} />

        {/* ==================== USUARIO ==================== */}
        <Route path="/mi-cv" element={<MiCV />} />
        <Route path="/postulaciones" element={<MisPostulaciones />} />
        <Route path="/favoritos" element={<MisFavoritos />} />
        <Route path="/perfil" element={<EditarPerfil />} />

      </Routes>
    </Router>
  );
}

export default App;
