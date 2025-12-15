import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Componentes originales / Dani
import Header from "./app/components/Header";
import Login from "./app/components/Login";
import Registro from "./app/components/Registro";
import Dashboard from "./app/components/Dashboard";
import Vacantes from "./app/components/Vacantes";
import Inicio from "./app/components/Inicio";
import DetalleVacante from "./app/components/DetalleVacante";

// Tus componentes nuevos
import MiCV from "./app/components/MiCV";
import MisPostulaciones from "./app/components/MisPostulaciones";

function App() {
  return (
    <Router>
      <Header />

      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vacantes" element={<Vacantes />} />
        <Route path="/detallevacante" element={<DetalleVacante />}/>
        <Route path="/mi-cv" element={<MiCV />} />
        <Route path="/postulaciones" element={<MisPostulaciones />} />
      </Routes>
    </Router>
  );
}

export default App;
