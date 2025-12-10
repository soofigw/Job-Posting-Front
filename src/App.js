import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./app/components/Header";
import Login from "./app/components/Login";
import Registro from "./app/components/Registro";
import Dashboard from "./app/components/Dashboard";

function App() {
  return (
    <Router>
      <Header />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </Router>
  );
}

export default App;
