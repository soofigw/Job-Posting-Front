import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./app/components/Header";
import Login from "./app/components/Login";
import Registro from "./app/components/Registro";
import Dashboard from "./app/components/Dashboard";
import Vacantes from "./app/components/Vacantes";
import Inicio from "./app/components/Inicio";

// PERFIL EMPRESA
import PerfilEmpresa from "./app/components/perfilEmpresa";

// VACANTES Y USUARIO
import MiCV from "./app/components/MiCV";
import MisPostulaciones from "./app/components/MisPostulaciones";
import MisFavoritos from "./app/components/MisFavoritos";

function App() {
  return (
    <Router>
      <Header />

      <Routes>
        {/* PÚBLICAS */}
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/vacantes" element={<Vacantes />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* PERFIL DE EMPRESA */}
        <Route path="/empresa/:companyId" element={<PerfilEmpresa />} />


        {/* USUARIO */}
        <Route path="/mi-cv" element={<MiCV />} />
        <Route path="/postulaciones" element={<MisPostulaciones />} />
        <Route path="/favoritos" element={<MisFavoritos />} />
      </Routes>
    </Router>
  );
}

export default App;
