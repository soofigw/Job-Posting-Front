import { Link, useLocation } from "react-router-dom";
import "../../style.css";

function Header() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <header className="navbar">
      <div className="nav-content">

        {/* LOGO */}
        <div className="logo">
          <span className="logo-main">Job</span>
          <span className="logo-accent">Posting</span>
        </div>

        {/* MENÚ — cambia según la pantalla */}
        <nav className="nav-links">

          {!isDashboard && (
            <>
              <Link to="/">Inicio</Link>
              <Link to="/login">Login</Link>
              <Link to="/registro" className="btn-nav">Registrarme</Link>
              <Link to="/vacantes">Publicar vacante</Link>
            </>
          )}

          {isDashboard && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/perfil">Mi cuenta</Link>
              <Link to="/vacantes">Publicar vacante</Link>
              <Link to="/logout">Cerrar sesión</Link>
            </>
          )}

        </nav>

      </div>
    </header>
  );
}

export default Header;
