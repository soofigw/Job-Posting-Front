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
    confirmarPassword: "",
    cv: null,

    rfc: "",
    sitio: "",
    contacto: "",
    documento: null,
  });

  const navigate = useNavigate();

  const dominiosInvalidos = [
    "gmail.com", "hotmail.com", "outlook.com", "yahoo.com",
    "live.com", "icloud.com", "proton.me"
  ];

  const validarCorreoCorporativo = (email) => {
    const dominio = email.split("@")[1];
    return dominio && !dominiosInvalidos.includes(dominio);
  };

  const validarRFC = (rfc) => {
    const regexRFC = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
    return regexRFC.test(rfc);
  };

  const validarFormulario = () => {
    if (!form.nombre) return "El nombre es obligatorio";
    if (!form.email.includes("@")) return "Correo electrónico inválido";

    if (form.password.length < 6)
      return "La contraseña debe tener al menos 6 caracteres";

    if (form.password !== form.confirmarPassword)
      return "Las contraseñas no coinciden";

    // VALIDACIONES DE POSTULANTE
    if (form.tipo === "postulante") {
      if (!form.cv) return "Debes subir tu CV en PDF";
    }

    // VALIDACIONES DE EMPRESA
    if (form.tipo === "empresa") {
      if (!validarRFC(form.rfc))
        return "RFC inválido";

      if (!form.sitio.startsWith("http"))
        return "La URL del sitio debe comenzar con https://";

      if (!validarCorreoCorporativo(form.email))
        return "Usa un correo corporativo (no Gmail/Outlook/etc.)";

      if (!form.documento)
        return "Debes subir un documento de verificación de la empresa";
    }

    return null;
  };

  const enviar = (e) => {
    e.preventDefault();

    const error = validarFormulario();
    if (error) return toast.error(error);

    toast.success("Cuenta creada correctamente 🎉");

    setTimeout(() => navigate("/dashboard"), 800);
  };

  return (
    <div className="page-center">
      <ToastContainer />

      <div className="card">
        <h2 className="card-title">Crear cuenta</h2>
        <p className="card-subtitle">
          Únete para encontrar o publicar empleos
        </p>

        <form onSubmit={enviar}>

          {/* Tipo de registro */}
          <label className="label">Registrarme como:</label>
          <select
            className="input"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          >
            <option value="postulante">Postulante</option>
            <option value="empresa">Empresa</option>
          </select>

          {/* Nombre */}
          <input
            type="text"
            className="input"
            placeholder={
              form.tipo === "empresa"
                ? "Nombre legal de la empresa"
                : "Nombre completo"
            }
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          {/* EMAIL */}
          <input
            type="email"
            className="input"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          {/* CAMPOS EXCLUSIVOS PARA EMPRESAS */}
          {form.tipo === "empresa" && (
            <>
              <input
                type="text"
                className="input"
                placeholder="RFC de la empresa"
                value={form.rfc}
                onChange={(e) =>
                  setForm({ ...form, rfc: e.target.value.toUpperCase() })
                }
              />

              <input
                type="text"
                className="input"
                placeholder="Sitio web (https://...)"
                value={form.sitio}
                onChange={(e) => setForm({ ...form, sitio: e.target.value })}
              />

              <input
                type="text"
                className="input"
                placeholder="Nombre de contacto empresarial"
                value={form.contacto}
                onChange={(e) => setForm({ ...form, contacto: e.target.value })}
              />

              <label className="upload-title">Documento de verificación:</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="input"
                onChange={(e) =>
                  setForm({ ...form, documento: e.target.files[0] })
                }
              />
            </>
          )}

          {/* Contraseña */}
          <input
            type="password"
            className="input"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {/* Confirmar contraseña */}
          <input
            type="password"
            className="input"
            placeholder="Confirmar contraseña"
            value={form.confirmarPassword}
            onChange={(e) =>
              setForm({ ...form, confirmarPassword: e.target.value })
            }
          />

          {/* Subir CV solo si es postulante */}
          {form.tipo === "postulante" && (
            <div className="upload-container">
              <label className="upload-title">Subir CV</label>

              <div
                className={`upload-dropzone ${form.cv ? "filled" : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    setForm({ ...form, cv: file });
                    toast.success("CV cargado: " + file.name);
                  }
                }}
                onClick={() => document.getElementById("cvInput").click()}
              >
                <span className="upload-icon">📄</span>

                {form.cv ? (
                  <strong className="file-name">{form.cv.name}</strong>
                ) : (
                  <>
                    <p className="drag-text">Arrastra tu archivo aquí</p>
                    <p className="click-text">o haz clic para elegir</p>
                  </>
                )}
              </div>

              <input
                id="cvInput"
                type="file"
                accept=".pdf"
                className="upload-input-hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setForm({ ...form, cv: file });
                  toast.success("CV cargado: " + file.name);
                }}
              />
            </div>
          )}

          <button type="submit" className="btn-primary">
            Crear cuenta
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "18px" }}>
          ¿Ya tienes cuenta?{" "}
          <a className="text-link" href="/Dashboard">
            Iniciar sesión
          </a>
        </p>
      </div>
    </div>
  );
}

export default Registro;
