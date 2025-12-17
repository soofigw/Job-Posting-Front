import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { loadSession } from "../../caracteristicas/autenticacion/authService";
import "./postulantes.css";

export default function PostulantesVacante() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { actor } = loadSession();

  const [postulantes, setPostulantes] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ======================
     CARGAR POSTULANTES
  ====================== */
  useEffect(() => {
    let alive = true;

    async function cargarPostulantes() {
      try {
        const res = await api.get(
          `/applications/companies/${actor.company_id}/applications_with_candidates`,
          {
            params: { job_id: jobId },
          }
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

  /* ======================
     ABRIR CV EN NUEVA PESTAÑA
  ====================== */
  async function abrirCv(candidateId) {
    try {
      const res = await api.get(
        `/candidates/${candidateId}/cv`,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Error cargando CV", err);
      alert("No se pudo abrir el CV del candidato");
    }
  }

  if (loading) {
    return <p style={{ padding: 40 }}>Cargando postulantes…</p>;
  }

  return (
    <div className="postulantes-page">
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Volver a vacantes
      </button>

      <h1>Postulantes</h1>

      {postulantes.length === 0 && (
        <div className="postulantes-empty">
          <div className="empty-icon">👥</div>
          <h3>Aún no hay postulantes</h3>
          <p>
            Cuando alguien se postule a esta vacante,
            aquí podrás ver su perfil y CV.
          </p>
        </div>
      )}

      <div className="postulantes-list">
        {postulantes.map((p) => (
          <div key={p.application_id} className="postulante-card">
            <h3>{p.candidate.full_name}</h3>
            <p>{p.candidate.headline}</p>
            <p>
              📍 {p.candidate.city}, {p.candidate.country}
            </p>

            <button
              className="btn-link"
              onClick={() => abrirCv(p.candidate.candidate_id)}
            >
              Ver CV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
