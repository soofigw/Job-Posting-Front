import { Link } from "react-router-dom";

function Header() {
  return (
    <nav style={{ padding: 20, background: "#eee" }}>
      <Link to="/">Dashboard</Link> |{" "}
      <Link to="/login">Login</Link> |{" "}
      <Link to="/registro">Registro</Link>
    </nav>
  );
}

export default Header;
