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
  const menuRef = useRef();

  //cierra el menu si se hace clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //detecta si esta logueado (si no esta en login/registro/home)
  const isLogged = !["/login", "/registro", "/"].includes(location.pathname);

  //simula el rol del usuario
  //postulante o reclutador
  const userRole = 'postulante'; 

  return (
    <header className="navbar">
      <div className="nav-content">

        {/* LOGO */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="logo">
            <span className="logo-main">Job</span>
            <span className="logo-accent">Posting</span>
          </div>
        </Link>

        {/* NAVEGACION */}
        <nav className="nav-links">
          
          {!isLogged ? (
            <>
              <Link to="/">Inicio</Link>
              <Link to="/login">Login</Link>
              <Link to="/registro" className="btn-nav">Registrarme</Link>
            </>
          ) : (
            <>
              {/* LOGICA DEL ROL: Solo el reclutador ve "Publicar vacante" */}
              {userRole === 'reclutador' && (
                <Link to="/vacantes">Publicar vacante</Link>
              )}
              
              {/* --- DROPDOWN PERFIL --- */}
              <div className="profile-dropdown-wrapper" ref={menuRef}>
                <div className="profile-btn" onClick={() => setMenuOpen(!menuOpen)}>
                  <img 
                    src="https://ui-avatars.com/api/?name=Sofia+Alejandra&background=FF5A5F&color=fff" 
                    alt="Avatar" 
                    className="avatar-circle" 
                  />
                  <FaChevronDown size={12} color="#555"/>
                </div>

                {menuOpen && (
                  <div className="dropdown-menu">
                    
                    <div className="dropdown-section-label">MI ÁREA</div>
                    
                    <Link to="/mi-area" className="dropdown-item">
                      <FaHome /> Inicio
                    </Link>
                    <Link to="/mi-cv" className="dropdown-item">
                      <FaFileAlt /> Mi CV
                    </Link>
                    
                    <div className="separator"></div>

                    <Link to="/dashboard" className="dropdown-item">
                      <FaSearch /> Buscar ofertas
                    </Link>
                    <Link to="/postulaciones" className="dropdown-item">
                      <FaRegPaperPlane /> Mis postulaciones
                    </Link>
                    <Link to="/favoritos" className="dropdown-item">
                      <FaHeart /> Mis favoritos
                    </Link>

                    <div className="separator"></div>

                    <Link to="/configuracion" className="dropdown-item">
                      <FaCog /> Configuración
                    </Link>
                    <Link to="/logout" className="dropdown-item item-danger">
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