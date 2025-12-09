import { useState } from "react"; 
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../style.css"; 
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const enviar = (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      return toast.error("Completa los campos");
    }
    
    toast.success("Bienvenido");
    setTimeout(() => navigate("/"), 800);
  };

  return (
    <div className="page-center">
      <ToastContainer />

      <div className="card">
        <h2 className="card-title">Bienvenido de nuevo</h2>
        <p className="card-subtitle">Ingresa para continuar</p>

        <form onSubmit={enviar} className="login-form">

          <input
            type="email"
            className="input"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            className="input"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button type="submit" className="btn-primary">
            Entrar
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "18px" }}>
          ¿No tienes cuenta?{" "}
          <a className="text-link" href="/registro">
            Crear cuenta
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;