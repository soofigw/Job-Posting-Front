import { useEffect, useState } from "react";
import api from "../../services/api";
import { loadSession } from "../../caracteristicas/autenticacion/authService";
import { toast } from "react-toastify";
import "./editarPerfil.css";

export default function EditarPerfil() {
  const { actor } = loadSession();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    headline: ""
  });

  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ======================
     CARGAR PERFIL
  ====================== */
  useEffect(() => {
    async function cargarPerfil() {
      try {
        const res = await api.get(`/candidates/${actor.candidate_id}`);
        const c = res.data.candidate;

        setForm({
          full_name: c.full_name || "",
          email: c.contact?.email || "",
          phone: c.contact?.phone || "",
          country: c.country || "",
          state: c.state || "",
          city: c.city || "",
          headline: c.headline || ""
        });
      } catch {
        toast.error("Error cargando perfil");
      } finally {
        setLoading(false);
      }
    }

    cargarPerfil();
  }, [actor.candidate_id]);

  /* ======================
     HANDLERS
  ====================== */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleCvChange(e) {
    setCvFile(e.target.files[0]);
  }

  /* ======================
     VER CV
  ====================== */
  async function abrirCv() {
    try {
      const res = await api.get(
        `/candidates/${actor.candidate_id}/cv`,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("No se pudo abrir el CV");
    }
  }

  /* ======================
     GUARDAR
  ====================== */
  async function guardar(e) {
    e.preventDefault();

    try {
      await api.patch(`/candidates/${actor.candidate_id}`, {
        full_name: form.full_name,
        contact: {
          email: form.email,
          phone: form.phone
        },
        country: form.country,
        state: form.state,
        city: form.city,
        headline: form.headline
      });

      if (cvFile) {
        const fd = new FormData();
        fd.append("cv", cvFile);
        await api.post(`/candidates/${actor.candidate_id}/cv`, fd);
      }

      toast.success("Perfil actualizado correctamente");
    } catch {
      toast.error("Error guardando cambios");
    }
  }

  if (loading) return <p style={{ padding: 40 }}>Cargando perfil…</p>;

  return (
    <div className="editar-perfil-page">
      <h1>Editar perfil</h1>

      <form className="editar-perfil-card" onSubmit={guardar}>
        {/* ================= DATOS ================= */}
        <div className="field">
          <label>Nombre completo</label>
          <input name="full_name" value={form.full_name} onChange={handleChange} />
        </div>

        <div className="row">
          <div className="field">
            <label>Email</label>
            <input name="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Teléfono</label>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>País</label>
            <input name="country" value={form.country} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Estado</label>
            <input name="state" value={form.state} onChange={handleChange} />
          </div>
        </div>

        <div className="field">
          <label>Ciudad</label>
          <input name="city" value={form.city} onChange={handleChange} />
        </div>

        <div className="field">
          <label>Headline</label>
          <input name="headline" value={form.headline} onChange={handleChange} />
        </div>

        {/* ================= CV ================= */}
        <div className="cv-box">
          <h3>Currículum</h3>
          <p className="cv-text">
            Este es el CV que las empresas ven cuando te postulas.
          </p>

          <button
            type="button"
            className="btn-outline"
            onClick={abrirCv}
          >
            Ver CV actual
          </button>

          <div className="cv-divider" />

          <p className="cv-text">
            ¿Quieres cambiar tu CV? Sube un nuevo archivo PDF.
          </p>

          <input
            type="file"
            accept="application/pdf"
            onChange={handleCvChange}
          />
        </div>

        <button className="btn-primary large">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}




