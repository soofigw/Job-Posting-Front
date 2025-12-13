import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./app/components/Header";
import Login from "./app/components/Login";
import Registro from "./app/components/Registro";
import Dashboard from "./app/components/Dashboard";
import Vacantes from "./app/components/Vacantes";
import Inicio from "./app/components/Inicio";
import DetalleVacante from "./app/components/DetalleVacante";

function App() {
  return (
    <Router>
      <Header />

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/vacantes" element={<Vacantes />} />
        <Route path="/detallevacante" element={<DetalleVacante />}/>
      </Routes>
    </Router>
  );
}

export default App;
