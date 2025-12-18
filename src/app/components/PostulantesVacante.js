import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { loadSession } from "../../caracteristicas/autenticacion/authService";
import "./postulantes.css";

const STATUS_OPTIONS = [
  { value: "APPLIED", label: "Postulado" },
  { value: "REVIEWING", label: "En revisión" },
  { value: "INTERVIEW", label: "Entrevista" },
  { value: "OFFERED", label: "Oferta enviada" },
  { value: "HIRED", label: "Contratado" },
  { value: "REJECTED", label: "Rechazado" },
];

export default function PostulantesVacante() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { actor } = loadSession();

  const [postulantes, setPostulantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    let alive = true;

    async function cargarPostulantes() {
      try {
        const res = await api.get(
          `/applications/companies/${actor.company_id}/applications_with_candidates`,
          { params: { job_id: jobId } }
        );

        if (!alive) return;
        setPostulantes(res.data.items || []);
      } catch (err) {
        console.error("Error cargando postulantes", err);
      } finally {
        if (alive) setLoading(false);
      }
    }

    cargarPostulantes();
    return () => (alive = false);
  }, [jobId, actor.company_id]);

  async function abrirCv(candidateId) {
    try {
      const res = await api.get(
        `/candidates/${candidateId}/cv`,
        { responseType: "blob" }
      );

      const url = URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );

      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      alert("No se pudo abrir el CV");
    }
  }

  async function cambiarStatus(applicationId, nuevoStatus) {
    setUpdating(applicationId);

    try {
      await api.patch(
        `/applications/companies/${actor.company_id}/applications/${applicationId}/status`,
        { status: nuevoStatus }
      );

      setPostulantes((prev) =>
        prev.map((p) =>
          p.application_id === applicationId
            ? { ...p, status: nuevoStatus }
            : p
        )
      );
    } catch (err) {
      alert("Error actualizando estado");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return <p className="loading">Cargando postulantes…</p>;
  }

  return (
    <div className="postulantes-page">
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Volver a vacantes
      </button>

      <h1>Postulantes</h1>

      <div className="postulantes-list">
        {postulantes.map((p) => (
          <div key={p.application_id} className="postulante-card">
            <div className="postulante-top">
              <div className="postulante-info">
                <h3>{p.candidate.full_name}</h3>
                <p className="headline">{p.candidate.headline}</p>
                <p className="location">
                  📍 {p.candidate.city}, {p.candidate.country}
                </p>
              </div>

              <div className="status-wrapper">
                <select
                  className={`status-pill status-${p.status.toLowerCase()}`}
                  value={p.status}
                  disabled={updating === p.application_id}
                  onChange={(e) =>
                    cambiarStatus(p.application_id, e.target.value)
                  }
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="postulante-actions">
              <button
                className="btn-cv"
                onClick={() => abrirCv(p.candidate.candidate_id)}
              >
                Ver CV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
