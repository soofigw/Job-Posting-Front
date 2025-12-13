import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FaChevronDown, FaHome, FaFileAlt, FaSearch, 
  FaRegPaperPlane, FaHeart, FaCog, FaPowerOff 
} from "react-icons/fa";

import "../../style.css"; 

function Header() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Cierra el dropdown si se hace click afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simulación de login (frontend-only)
  const isLogged = !["/", "/login", "/registro"].includes(location.pathname);

  // Simulación de rol
  const userRole = "postulante"; // o "reclutador"

  return (
    <header className="navbar">
      <div className="nav-content">

        {/* LOGO */}
        <Link to="/" className="logo" style={{ textDecoration: "none" }}>
          <span className="logo-main">Job</span>
          <span className="logo-accent">Posting</span>
        </Link>

        {/* NAV */}
        <nav className="nav-links">

          {/* ======================
              USUARIO NO LOGUEADO
          ====================== */}
          {!isLogged && (
            <>
              <Link to="/">Inicio</Link>
              <Link to="/login">Login</Link>
              <Link to="/registro" className="btn-nav">Registrarme</Link>
              <Link to="/vacantes">Vacantes</Link>
            </>
          )}

          {/* ======================
              USUARIO LOGUEADO
          ====================== */}
          {isLogged && (
            <>
              {/* Accesos rápidos */}
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/vacantes/1">Detalle vacante</Link>

              {/* Solo reclutador */}
              {userRole === "reclutador" && (
                <Link to="/vacantes">Publicar vacante</Link>
              )}

              {/* DROPDOWN PERFIL */}
              <div className="profile-dropdown-wrapper" ref={menuRef}>
                <div 
                  className="profile-btn" 
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <img 
                    src="https://ui-avatars.com/api/?name=Usuario+Demo&background=FF5A5F&color=fff" 
                    alt="Avatar" 
                    className="avatar-circle"
                  />
                  <FaChevronDown size={12} />
                </div>

                {menuOpen && (
                  <div className="dropdown-menu">

                    <div className="dropdown-section-label">MI ÁREA</div>

                    <Link to="/dashboard" className="dropdown-item">
                      <FaHome /> Inicio
                    </Link>
                    <Link to="/mi-cv" className="dropdown-item">
                      <FaFileAlt /> Mi CV
                    </Link>

                    <div className="separator"></div>

                    <Link to="/vacantes" className="dropdown-item">
                      <FaSearch /> Buscar vacantes
                    </Link>
                    <Link to="/postulaciones" className="dropdown-item">
                      <FaRegPaperPlane /> Mis postulaciones
                    </Link>
                    <Link to="/favoritos" className="dropdown-item">
                      <FaHeart /> Favoritos
                    </Link>

                    <div className="separator"></div>

                    <Link to="/configuracion" className="dropdown-item">
                      <FaCog /> Configuración
                    </Link>

                    {/* Cerrar sesión vuelve a inicio */}
                    <Link to="/" className="dropdown-item item-danger">
                      <FaPowerOff /> Cerrar sesión
                    </Link>

                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
