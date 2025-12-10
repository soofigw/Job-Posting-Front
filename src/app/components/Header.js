import { Link } from "react-router-dom";
import "../../style.css";

function Header() {
  return (
    <header className="navbar">
      <div className="nav-content">

        {/* LOGO */}
        <div className="logo">
          <span className="logo-main">Job</span>
          <span className="logo-accent">Posting</span>
        </div>

        {/* MENÚ */}
        <nav className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/login">Login</Link>
          <Link to="/registro" className="btn-nav">Registrarme</Link>
        </nav>

      </div>
    </header>
  );
}

export default Header;
