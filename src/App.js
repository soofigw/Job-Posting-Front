import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Header from "./app/components/Header";
import Login from "./app/components/Login";
import Registro from "./app/components/Registro";
import Dashboard from "./app/components/Dashboard";

function App() {
  return (
    <Router>
      <MainRoutes />
    </Router>
  );
}

function MainRoutes() {
  const location = useLocation();

  const hideHeaderRoutes = ["/login", "/registro"];

  const hideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <>
      {!hideHeader && <Header />}

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </>
  );
}

export default App;
