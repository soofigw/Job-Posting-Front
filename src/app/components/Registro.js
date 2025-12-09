import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../style.css";
import { useNavigate } from "react-router-dom";

function Registro() {
  const [form, setForm] = useState({
    tipo: "postulante",
    nombre: "",
    email: "",
    password: "",
    cv: null,
    empresa: ""
  });

  const navigate = useNavigate();

  const enviar = (e) => {
    e.preventDefault();

    if (!form.nombre || !form.email || !form.password) {
      return toast.error("Completa todos los campos obligatorios");
    }

    if (form.tipo === "postulante" && !form.cv) {
      return toast.error("Por favor, sube tu CV");
    }

    setTimeout(() => navigate("/dashboard"), 900);
  };


  return (
    <div className="page-center">
      <ToastContainer />

      <div className="card">
        <h2 className="card-title">Crear cuenta</h2>
        <p className="card-subtitle">Únete para encontrar o publicar empleos</p>

        <form onSubmit={enviar}>

          <label className="label">Registrarme como:</label>
          <select
            className="input"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          >
            <option value="postulante">Postulante</option>
            <option value="empresa">Empresa</option>
          </select>

          <input
            type="text"
            className="input"
            placeholder={form.tipo === "empresa" ? "Nombre de la empresa" : "Nombre completo"}
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

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

        {form.tipo === "postulante" && (
        <div className="upload-wrapper">
        <label className="upload-label">Subir CV (PDF)</label>

        <label htmlFor="cvInput" className="upload-box">
            <span>{form.cv ? form.cv.name : "Seleccionar archivo"}</span>
        </label>

        <input
            id="cvInput"
            type="file"
            accept=".pdf"
            className="upload-input"
            onChange={(e) => {
            const file = e.target.files[0];
            setForm({ ...form, cv: file });
            toast.success("CV cargado: " + file.name);
            }}
        />

        {form.cv && (
            <p className="upload-file-name"> {form.cv.name}</p>
        )}
        </div>

        )}


          <button type="submit" className="btn-primary">
            Crear cuenta
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "18px" }}>
          ¿Ya tienes cuenta?{" "}
          <a className="text-link" href="/login">
            Iniciar sesión
          </a>
        </p>
      </div>
    </div>
  );
}

export default Registro;
