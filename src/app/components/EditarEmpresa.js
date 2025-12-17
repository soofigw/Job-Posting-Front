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

  /* ======================
     CARGAR EMPRESA
  ====================== */
  useEffect(() => {
    api.get(`/companies/${companyId}`).then((res) => {
      setForm({
        name: res.data.name || "",
        description: res.data.description || "",
        country: res.data.country || "",
        state: res.data.state || "",
        city: res.data.city || "",
        company_size_min: res.data.company_size_min || "",
        company_size_max: res.data.company_size_max || "",
        logo_full_path: res.data.logo_full_path || "",
        logo_preview: "",
      });
      setLoading(false);
    });
  }, [companyId]);

  /* ======================
     UBICACIONES
  ====================== */
  useEffect(() => {
    api.get("/locations/countries").then((r) => setCountries(r.data));
  }, []);

  useEffect(() => {
    if (!form.country) return;
    api.get(`/locations/${form.country}/states`).then((r) => setStates(r.data));
  }, [form.country]);

  useEffect(() => {
    if (!form.country || !form.state) return;
    api
      .get(`/locations/${form.country}/${form.state}/cities`)
      .then((r) => setCities(r.data));
  }, [form.country, form.state]);

  /* ======================
     HANDLERS
  ====================== */
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
    if (!file) return;

    setLogoFile(file);
    setForm((f) => ({
      ...f,
      logo_preview: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
  };

  if (loading) return <p style={{ padding: 40 }}>Cargando datos…</p>;

  return (
    <div className="editar-empresa-page">
      <h1>Editar empresa</h1>

      <div className="editar-empresa-card">
        {/* ===== HEADER ===== */}
        <div className="empresa-header">
          <div className="empresa-logo-section">
            <div className="empresa-logo-wrapper">
              <img
                src={
                  form.logo_preview ||
                  form.logo_full_path ||
                  "/placeholder-logo.png"
                }
                alt="Logo empresa"
              />
            </div>

            <label className="btn-upload">
              Cambiar logo
              <input
                type="file"
                accept="image/png,image/jpeg"
                hidden
                onChange={handleLogoChange}
              />
            </label>

            <span className="hint">PNG o JPG · máx 2MB</span>
          </div>

          <div className="empresa-main-info">
            <div className="field">
              <label>Nombre de la empresa</label>
              <input name="name" value={form.name} onChange={handleChange} />
            </div>

            <div className="field">
              <label>Descripción</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* ===== FORM ===== */}
        <form className="editar-empresa-form" onSubmit={handleSubmit}>
          <h3 className="section-title">Ubicación</h3>

          <div className="row">
            <div className="field">
              <label>País</label>
              <select name="country" value={form.country} onChange={handleChange}>
                <option value="">Selecciona un país</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Estado</label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                disabled={!form.country}
              >
                <option value="">Selecciona un estado</option>
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <div className="field full">
              <label>Ciudad</label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                disabled={!form.state}
              >
                <option value="">Selecciona una ciudad</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <h3 className="section-title">Tamaño de la empresa</h3>

          <div className="row empleados">
            <div className="field">
              <label>Empleados mínimo</label>
              <input
                type="number"
                name="company_size_min"
                value={form.company_size_min}
                onChange={handleChange}
                min={1}
              />
            </div>

            <div className="field">
              <label>Empleados máximo</label>
              <input
                type="number"
                name="company_size_max"
                value={form.company_size_max}
                onChange={handleChange}
                min={form.company_size_min || 1}
              />
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
