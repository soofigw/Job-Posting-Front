import { useEffect, useState } from "react";
import "../../style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://localhost:8000/api";

function Vacantes() {
  /* =============================
     FORM STATE
     ============================= */
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    salario: "",
    country: "",
    state: "",
    city: "",
    work_type: "",
    work_location_type: "",
  });

  /* =============================
     DATA FROM APIs
     ============================= */
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [workTypes, setWorkTypes] = useState([]);
  const [workLocationTypes, setWorkLocationTypes] = useState([]);

  /* =============================
     LOAD INITIAL DATA
     ============================= */

  // Países
  useEffect(() => {
    fetch(`${API_BASE}/locations/countries`)
      .then(res => res.json())
      .then(setCountries)
      .catch(() => toast.error("Error cargando países"));
  }, []);

  // Filtros dinámicos de jobs (FULL_TIME, FREELANCE, etc.)
  useEffect(() => {
    fetch(`${API_BASE}/jobs/filters/options`)
      .then(res => res.json())
      .then(data => {
        setWorkTypes(data.work_types || []);
        setWorkLocationTypes(data.work_location_types || []);
      })
      .catch(() => toast.error("Error cargando tipos de puesto"));
  }, []);

  // Estados por país
  useEffect(() => {
    if (!form.country) return;

    fetch(`${API_BASE}/locations/${form.country}/states`)
      .then(res => res.json())
      .then(setStates)
      .catch(() => toast.error("Error cargando estados"));
  }, [form.country]);

  // Ciudades por estado
  useEffect(() => {
    if (!form.country || !form.state) return;

    fetch(`${API_BASE}/locations/${form.country}/${form.state}/cities`)
      .then(res => res.json())
      .then(setCities)
      .catch(() => toast.error("Error cargando ciudades"));
  }, [form.state]);

  /* =============================
     CREATE JOB
     ============================= */
  const publicarVacante = async () => {
    if (
      !form.titulo ||
      !form.descripcion ||
      !form.country ||
      !form.state ||
      !form.city ||
      !form.work_type ||
      !form.work_location_type
    ) {
      return toast.error("Completa todos los campos");
    }

    let min_salary = null;
    let max_salary = null;

    const match = form.salario.replace(/,/g, "").match(/(\d+)\s*-\s*(\d+)/);
    if (match) {
      min_salary = Number(match[1]);
      max_salary = Number(match[2]);
    }

    const payload = {
      title: form.titulo,
      description: form.descripcion,
      work_type: form.work_type,
      work_location_type: form.work_location_type,

      country: form.country,
      state: form.state,
      city: form.city,

      min_salary,
      max_salary,
      pay_period: "MONTHLY",
      currency: "MXN",

      company_id: 1 // temporal
    };

    try {
      console.log("POST /api/jobs", payload);

      const res = await fetch(`${API_BASE}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Error creando vacante");

      await res.json();
      toast.success("Vacante publicada 🎉");

      setForm({
        titulo: "",
        descripcion: "",
        salario: "",
        country: "",
        state: "",
        city: "",
        work_type: "",
        work_location_type: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("No se pudo publicar la vacante");
    }
  };

  /* =============================
     UI
     ============================= */
  return (
    <div className="vacantes-container">
      <ToastContainer />

      <h2 className="vacantes-title">Publicar vacante</h2>
      <p className="vacantes-subtitle">
        Describe de la mejor manera para encontrar al mejor candidato
      </p>

      <div className="vacantes-form">
        <label>Título</label>
        <input
          className="vacante-input"
          value={form.titulo}
          onChange={e => setForm({ ...form, titulo: e.target.value })}
        />

        <label>Descripción</label>
        <textarea
          className="vacante-textarea"
          value={form.descripcion}
          onChange={e => setForm({ ...form, descripcion: e.target.value })}
        />

        <label>Salario (ej. 25000 - 40000)</label>
        <input
          className="vacante-input"
          value={form.salario}
          onChange={e => setForm({ ...form, salario: e.target.value })}
        />

        <label>Tipo de puesto</label>
        <select
          className="vacante-select"
          value={form.work_type}
          onChange={e => setForm({ ...form, work_type: e.target.value })}
        >
          <option value="">Selecciona</option>
          {workTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <label>Modalidad</label>
        <select
          className="vacante-select"
          value={form.work_location_type}
          onChange={e =>
            setForm({ ...form, work_location_type: e.target.value })
          }
        >
          <option value="">Selecciona</option>
          {workLocationTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <label>País</label>
        <select
          className="vacante-select"
          value={form.country}
          onChange={e =>
            setForm({
              ...form,
              country: e.target.value,
              state: "",
              city: ""
            })
          }
        >
          <option value="">Selecciona</option>
          {countries.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <label>Estado</label>
        <select
          className="vacante-select"
          value={form.state}
          disabled={!states.length}
          onChange={e =>
            setForm({ ...form, state: e.target.value, city: "" })
          }
        >
          <option value="">Selecciona</option>
          {states.map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <label>Ciudad</label>
        <select
          className="vacante-select"
          value={form.city}
          disabled={!cities.length}
          onChange={e => setForm({ ...form, city: e.target.value })}
        >
          <option value="">Selecciona</option>
          {cities.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <button className="vacantes-btn" onClick={publicarVacante}>
          Publicar vacante
        </button>
      </div>
    </div>
  );
}

export default Vacantes;
