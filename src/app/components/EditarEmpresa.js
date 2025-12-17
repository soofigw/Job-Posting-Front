import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./EditarEmpresa.css";

export default function EditarEmpresa() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    country: "",
    state: "",
    city: "",
    company_size_min: "",
    company_size_max: "",
    logo_full_path: "",
    logo_preview: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [compRes, countriesRes] = await Promise.all([
          api.get(`/companies/${companyId}`),
          api.get("/locations/countries")
        ]);
        setForm({ ...compRes.data, logo_preview: "" });
        setCountries(countriesRes.data);
      } catch (err) {
        console.error("Error al cargar", err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [companyId]);

  useEffect(() => {
    if (form.country) {
      api.get(`/locations/${form.country}/states`).then((r) => setStates(r.data));
    }
  }, [form.country]);

  useEffect(() => {
    if (form.country && form.state) {
      api.get(`/locations/${form.country}/${form.state}/cities`).then((r) => setCities(r.data));
    }
  }, [form.country, form.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
      ...(name === "country" && { state: "", city: "" }),
      ...(name === "state" && { city: "" }),
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setForm((f) => ({ ...f, logo_preview: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/companies/${companyId}`, {
        name: form.name,
        description: form.description,
        country: form.country,
        state: form.state,
        city: form.city,
        company_size_min: form.company_size_min,
        company_size_max: form.company_size_max,
      });

      if (logoFile) {
        const fd = new FormData();
        fd.append("logo", logoFile);
        await api.put(`/companies/${companyId}/logo`, fd);
      }
      navigate(`/company/${companyId}/dashboard`);
    } catch (err) {
      alert("Error al guardar cambios");
    }
  };

  if (loading) return <div className="editar-empresa-page">Cargando...</div>;

  return (
    <div className="editar-empresa-page">
      <h1>Configuración de la empresa</h1>
      <p className="subtitle">Actualiza la información pública y los detalles operativos de tu organización.</p>

      <div className="editar-empresa-card">
        {/* CABECERA: LOGO + INFO BÁSICA */}
        <div className="empresa-header">
          <div className="empresa-logo-section">
            <div className="empresa-logo-wrapper">
              <img
                src={form.logo_preview || form.logo_full_path || "/placeholder-logo.png"}
                alt="Logo"
              />
            </div>
            <label className="btn-upload">
              Cambiar logo
              <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
            </label>
            <span className="hint">Máximo 2MB</span>
          </div>

          <div className="info-basica">
            <div className="field">
              <label>Nombre de la empresa</label>
              <input name="name" value={form.name} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Descripción corta</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="3" />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* UBICACIÓN */}
          <h3 className="section-title">Ubicación principal</h3>
          <div className="row">
            <div className="field">
              <label>País</label>
              <select name="country" value={form.country} onChange={handleChange}>
                <option value="">Selecciona un país</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Estado / Provincia</label>
              <select name="state" value={form.state} onChange={handleChange} disabled={!form.country}>
                <option value="">Selecciona un estado</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Ciudad</label>
            <select name="city" value={form.city} onChange={handleChange} disabled={!form.state}>
              <option value="">Selecciona una ciudad</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* TAMAÑO EQUIPO */}
          <h3 className="section-title">Tamaño del equipo</h3>
          <div className="empleados-container">
            <div className="row empleados">
              <div className="field">
                <label>Mínimo de empleados</label>
                <input type="number" name="company_size_min" value={form.company_size_min} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Máximo de empleados</label>
                <input type="number" name="company_size_max" value={form.company_size_max} onChange={handleChange} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary large">
            Guardar cambios
          </button>
        </form>
      </div>
    </div>
  );
}