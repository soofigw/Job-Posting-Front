import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    FaChevronDown,
    FaHome,
    FaFileAlt,
    FaSearch,
    FaRegPaperPlane,
    FaHeart,
    FaPowerOff,
    FaBriefcase,
    FaPlusCircle,
    FaUserEdit,
} from "react-icons/fa";

import { logout } from "../../caracteristicas/autenticacion/authSlice";
import { ACTOR_TYPES } from "../../caracteristicas/autenticacion/authTypes";
import "../../style.css";

function Header() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const actor = useSelector((state) => state.auth.actor);
    const isLogged = Boolean(actor);
    const userType = actor?.type;

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    /* ======================
       CLICK FUERA
    ====================== */
    useEffect(() => {
        const close = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    /* ======================
       LOGO CLICK
    ====================== */
       const handleLogoClick = () => {
    navigate("/");
};



    /* ======================
       LOGOUT
    ====================== */
    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    return (
        <header className="navbar">
            <div className="nav-content">

                {/* LOGO */}
                <div
                    className="logo"
                    style={{ cursor: "pointer" }}
                    onClick={handleLogoClick}
                >
                    <span className="logo-main">Job</span>
                    <span className="logo-accent">Posting</span>
                </div>

                <nav className="nav-links">

                    {/* ======================
                        NO LOGUEADO
                    ====================== */}
                    {!isLogged && (
                        <>
                            <Link to="/">Inicio</Link>
                            <Link to="/login">Login</Link>
                            <Link to="/registro" className="btn-nav">
                                Registrarme
                            </Link>
                        </>
                    )}

                    {/* ======================
                        LOGUEADO
                    ====================== */}
                    {isLogged && (
                        <div className="profile-dropdown-wrapper" ref={menuRef}>
                            <div
                                className="profile-btn"
                                onClick={() => setMenuOpen(v => !v)}
                            >
                                <img
                                    src="https://ui-avatars.com/api/?name=User&background=FF5A5F&color=fff"
                                    alt="Avatar"
                                    className="avatar-circle"
                                />
                                <FaChevronDown size={12} />
                            </div>

                            {menuOpen && (
                                <div className="dropdown-menu">

                                    <div className="dropdown-section-label">
                                        MI ÁREA
                                    </div>

                                    {/* ===== INICIO ===== */}
                                    {userType === ACTOR_TYPES.CANDIDATE && (
                                        <Link to="/dashboard" className="dropdown-item">
                                            <FaHome /> Inicio
                                        </Link>
                                    )}

                                    {userType === ACTOR_TYPES.COMPANY && (
                                        <Link
                                          to={`/company/${actor.company_id}/dashboard`}
                                          className="dropdown-item"
                                        >
                                          <FaHome /> Inicio
                                        </Link>
                                    )}


                                    {/* ===== POSTULANTE ===== */}
                                    {userType === ACTOR_TYPES.CANDIDATE && (
                                    <>
                                        <Link to="/perfil" className="dropdown-item">
                                            <FaUserEdit /> Editar perfil
                                        </Link>

                                        <div className="separator" />
                                        
                                        <Link to="/postulaciones" className="dropdown-item">
                                            <FaRegPaperPlane /> Mis postulaciones
                                        </Link>

                                        <Link to="/favoritos" className="dropdown-item">
                                            <FaHeart /> Favoritos
                                        </Link>
                                    </>
                                )}


                                    {/* ===== EMPRESA ===== */}
                                    {userType === ACTOR_TYPES.COMPANY && (
                                      <>
                                        <div className="separator" />

                                        <Link
                                          to={`/company/${actor.company_id}/editar`}
                                          className="dropdown-item"
                                        >
                                          <FaFileAlt /> Editar empresa
                                        </Link>

                                        <Link to="/dashboard/vacantes" className="dropdown-item">
                                          <FaPlusCircle /> Publicar vacante
                                        </Link>
                                      </>
                                    )}


                                    <div className="separator" />

                                    <button
                                        className="dropdown-item item-danger"
                                        onClick={handleLogout}
                                    >
                                        <FaPowerOff /> Cerrar sesión
                                    </button>

                                </div>
                            )}
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;
