import { useEffect, useState } from "react";
import "../../style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";
import { loadSession } from "../../caracteristicas/autenticacion/authService";

function Vacantes() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const isEdit = Boolean(jobId);

  const { actor } = loadSession();

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
     DATA
     ============================= */
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
  const [workLocationTypes, setWorkLocationTypes] = useState([]);

  /* =============================
     LOAD STATIC DATA
     ============================= */
  useEffect(() => {
    api.get("/locations/countries")
      .then(r => setCountries(r.data))
      .catch(() => toast.error("Error cargando países"));
  }, []);

  useEffect(() => {
    api.get("/jobs/filters/options")
      .then(r => {
        setWorkTypes(r.data.work_types || []);
        setWorkLocationTypes(r.data.work_location_types || []);
      })
      .catch(() => toast.error("Error cargando tipos de puesto"));
  }, []);

  /* =============================
     LOAD JOB (EDIT MODE)
     ============================= */
    useEffect(() => {
      if (!isEdit) return;

      let mounted = true;

      api.get(`/jobs/${jobId}`)
        .then(r => {
          if (!mounted) return;
          const job = r.data;

          setForm({
            titulo: job.title || "",
            descripcion: job.description || "",
            salario:
              job.min_salary && job.max_salary
                ? `${job.min_salary} - ${job.max_salary}`
                : "",
            country: job.country || "",
            state: job.state || "",
            city: job.city || "",
            work_type: job.work_type || "",
            work_location_type: job.work_location_type || "",
          });
        })
        .catch(() => {
          toast.error("No se pudo cargar la vacante");
          navigate(`/empresa/${actor?.company_id}`);
        });

      return () => {
        mounted = false;
      };
    }, [isEdit, jobId, navigate]); // 🔥 actor FUERA


  /* =============================
     LOAD DEPENDENT DATA
     ============================= */
  useEffect(() => {
    if (!form.country) return;

    api.get(`/locations/${form.country}/states`)
      .then(r => setStates(r.data))
      .catch(() => toast.error("Error cargando estados"));
  }, [form.country]);

  useEffect(() => {
    if (!form.country || !form.state) return;

    api.get(`/locations/${form.country}/${form.state}/cities`)
      .then(r => setCities(r.data))
      .catch(() => toast.error("Error cargando ciudades"));
  }, [form.country, form.state]);

  /* =============================
     SAVE / UPDATE JOB
     ============================= */
  const guardarVacante = async () => {
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
    };

    try {
      if (isEdit) {
        await api.put(`/jobs/${jobId}`, payload);
        toast.success("Vacante actualizada ✅");
      } else {
        await api.post("/jobs", payload);
        toast.success("Vacante publicada 🎉");
      }

      navigate(`/empresa/${actor.company_id}`);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo guardar la vacante");
    }
  };

  /* =============================
     UI
     ============================= */
  return (
    <div className="vacantes-container">
      <ToastContainer />

      <h2 className="vacantes-title">
        {isEdit ? "Editar vacante" : "Publicar vacante"}
      </h2>

      <p className="vacantes-subtitle">
        {isEdit
          ? "Actualiza la información de tu vacante"
          : "Describe de la mejor manera para encontrar al mejor candidato"}
      </p>

      <div className="vacantes-form">
        <label>Título</label>
        <input
          className="vacante-input"
          value={form.titulo}
          onChange={e =>
            setForm(f => ({ ...f, titulo: e.target.value }))
          }
        />

        <label>Descripción</label>
        <textarea
          className="vacante-textarea"
          value={form.descripcion}
          onChange={e =>
            setForm(f => ({ ...f, descripcion: e.target.value }))
          }
        />

        <label>Salario (ej. 25000 - 40000)</label>
        <input
          className="vacante-input"
          value={form.salario}
          onChange={e =>
            setForm(f => ({ ...f, salario: e.target.value }))
          }
        />

        <label>Tipo de puesto</label>
        <select
          className="vacante-select"
          value={form.work_type}
          onChange={e =>
            setForm(f => ({ ...f, work_type: e.target.value }))
          }
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
            setForm(f => ({ ...f, work_location_type: e.target.value }))
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
            setForm(f => ({
              ...f,
              country: e.target.value,
              state: isEdit ? f.state : "",
              city: isEdit ? f.city : "",
            }))
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
            setForm(f => ({
              ...f,
              state: e.target.value,
              city: isEdit ? f.city : "",
            }))
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
          onChange={e =>
            setForm(f => ({ ...f, city: e.target.value }))
          }
        >
          <option value="">Selecciona</option>
          {cities.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <button className="vacantes-btn" onClick={guardarVacante}>
          {isEdit ? "Guardar cambios" : "Publicar vacante"}
        </button>
      </div>
    </div>
  );
}

export default Vacantes;
