import { useState, useEffect } from "react";
import "../../style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Vacantes() {
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    salario: "",
    modalidad: "Remoto",
    estado: "",
    municipio: "",
    tipo: "Tiempo completo",
    imagenes: [],
  });

  const [dragActive, setDragActive] = useState(false);
  const [estados, setEstados] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  useEffect(() => {
    fetch("https://api.copomex.com/query/get_estados?token=prueba")
      .then((res) => res.json())
      .then((data) => setEstados(data.response.estado))
      .catch(() => toast.error("No se pudieron cargar los estados"));
  }, []);

  useEffect(() => {
    if (!form.estado) return;

    fetch(
      `https://api.copomex.com/query/get_municipio_por_estado/${form.estado}?token=prueba`
    )
      .then((res) => res.json())
      .then((data) => setMunicipios(data.response.municipios))
      .catch(() => toast.error("No se pudieron cargar los municipios"));
  }, [form.estado]);

  // Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    setForm({ ...form, imagenes: files });
    toast.success("Imágenes cargadas");
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setForm({ ...form, imagenes: files });
    toast.success("Imágenes seleccionadas");
  };

  const publicarVacante = () => {
    if (!form.titulo || !form.descripcion || !form.estado || !form.municipio) {
      return toast.error("Completa todos los campos obligatorios");
    }

    toast.success("Vacante publicada 🎉");
  };

  return (
    <div className="vacantes-container">
      <ToastContainer />

      <h2 className="vacantes-title">Publicar vacante</h2>
      <p className="vacantes-subtitle">
        Completa los datos para publicar tu oferta laboral
      </p>

      {/* DROPZONE */}
      <div
        className={`vacantes-dropzone ${dragActive ? "drag-active" : ""}`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => document.getElementById("fileInput").click()}
      >
        <div className="dropzone-inner">
          <span className="dropzone-icon">📁</span>
          <p>Arrastra tus imágenes aquí</p>
          <strong>o haz clic para elegir</strong>
        </div>
      </div>

      <input
        type="file"
        id="fileInput"
        multiple
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

      {/* FORMULARIO */}
      <div className="vacantes-form">
        <label>Título de la vacante</label>
        <input
          className="vacante-input"
          placeholder="Ej. Desarrollador Full Stack"
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
        />

        <label>Descripción</label>
        <textarea
          className="vacante-textarea"
          placeholder="Describe la posición..."
          value={form.descripcion}
          onChange={(e) =>
            setForm({
              ...form,
              descripcion: e.target.value,
            })
          }
        />

        <div className="vacantes-grid">
          <div>
            <label>Salario</label>
            <input
              className="vacante-input"
              placeholder="$25,000 - $40,000 MXN"
              value={form.salario}
              onChange={(e) =>
                setForm({ ...form, salario: e.target.value })
              }
            />
          </div>

          <div>
            <label>Modalidad</label>
            <select
              className="vacante-select"
              value={form.modalidad}
              onChange={(e) =>
                setForm({ ...form, modalidad: e.target.value })
              }
            >
              <option>Remoto</option>
              <option>Híbrido</option>
              <option>Presencial</option>
            </select>
          </div>
        </div>

        <div className="vacantes-grid">
          <div>
            <label>Estado</label>
            <select
              className="vacante-select"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              <option value="">Selecciona un estado</option>
              {estados.map((e, idx) => (
                <option key={idx}>{e}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Municipio</label>
            <select
              className="vacante-select"
              value={form.municipio}
              onChange={(e) => setForm({ ...form, municipio: e.target.value })}
            >
              <option value="">Selecciona un municipio</option>
              {municipios.map((m, idx) => (
                <option key={idx}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <label>Tipo de puesto</label>
        <select
          className="vacante-select"
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
        >
          <option>Tiempo completo</option>
          <option>Medio tiempo</option>
          <option>Contrato</option>
          <option>Freelance</option>
        </select>

        <button className="vacantes-btn" onClick={publicarVacante}>
          Publicar vacante
        </button>
      </div>
    </div>
  );
}

export default Vacantes;
