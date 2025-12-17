import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./postulantes.css";

export default function PostulantesVacante() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [postulantes, setPostulantes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function cargarPostulantes() {
      try {
        const res = await api.get(`/jobs/${jobId}/applications`);
        if (!alive) return;
        setPostulantes(res.data || []);
      } catch (err) {
        console.error("Error cargando postulantes", err);
      } finally {
        if (alive) setLoading(false);
      }
    }

    cargarPostulantes();
    return () => (alive = false);
  }, [jobId]);

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

            <a
              href={p.candidate.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-link"
            >
              Ver CV
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
