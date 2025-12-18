import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "../../style.css";
import { loadSession } from "../../caracteristicas/autenticacion/authService";

export default function MisPostulaciones() {
  const navigate = useNavigate();

  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ======================
     PAGINACIÓN
  ====================== */
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  const canPrev = page > 1;
  const canNext = useMemo(() => page * limit < total, [page, limit, total]);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  /* ======================
     CAZADOR DE JOB ID
  ====================== */
  const getJobIdFromApp = (app) => {
    if (app.job_id) return app.job_id;
    if (app.job) {
      if (typeof app.job === "object") {
        return app.job.job_id || app.job._id || app.job.id;
      }
      return app.job;
    }
    if (app.jobId) return app.jobId;
    return null;
  };

  /* ======================
     LOAD DATA
  ====================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { token, actor } = loadSession();

        if (!actor || !token || actor.type !== "candidate") {
          navigate("/login");
          return;
        }

        const auth = { headers: { Authorization: `Bearer ${token}` } };

        const res = await api.get(
          `/applications/candidates/${actor.candidate_id}/applications`,
          {
            ...auth,
            params: { page, limit },
          }
        );

        const items = res.data?.items || [];
        setTotal(res.data?.total || res.data?.meta?.total || 0);

        const enriched = await Promise.all(
          items.map(async (app) => {
            const jobId = getJobIdFromApp(app);
            let jobData = { title: "Vacante no disponible", company: { name: "—" } };

            if (jobId) {
              try {
                const jobRes = await api.get(`/jobs/${jobId}`, auth);
                const fullJob = jobRes.data?.data || jobRes.data;

                if (
                  fullJob.company &&
                  !fullJob.company.logo_full_path &&
                  fullJob.company.logo
                ) {
                  fullJob.company.logo_full_path = fullJob.company.logo;
                }

                jobData = fullJob;
              } catch {
                jobData = {
                  title: "Vacante eliminada",
                  company: { name: "Desconocida" },
                };
              }
            }

            return {
              ...app,
              job: jobData,
              _resolvedJobId: jobId,
            };
          })
        );

        setPostulaciones(enriched);
      } catch (err) {
        console.error("Error cargando postulaciones:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, page]);

  /* ======================
     HELPERS UI
  ====================== */
  const renderStatus = (status) => {
    const s = (status || "APPLIED").toUpperCase();
    switch (s) {
      case "APPLIED":
        return (
          <span className="status-badge sent">
            <FaClock /> Enviada
          </span>
        );
      case "REVIEWING":
        return (
          <span className="status-badge process">
            <FaCheckCircle /> En revisión
          </span>
        );
      case "INTERVIEW":
        return (
          <span className="status-badge process">
            <FaCheckCircle /> Entrevista
          </span>
        );
      case "OFFERED":
        return <span className="status-badge finalist">🌟 Oferta</span>;
      case "REJECTED":
        return (
          <span className="status-badge rejected">
            <FaTimesCircle /> Rechazado
          </span>
        );
      default:
        return <span className="status-badge sent">{s}</span>;
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("es-MX") : "Reciente";

  const getLogo = (company) => {
    if (company?.logo_full_path) return company.logo_full_path;
    const name = encodeURIComponent(company?.name || "E");
    return `https://ui-avatars.com/api/?name=${name}&background=f1f5f9&color=64748b`;
  };

  /* ======================
     RENDER
  ====================== */
  return (
    <div className="dashboard-wrapper">
      <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 40 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
          Mis Postulaciones
        </h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#888" }}>
            <FaSpinner className="fa-spin" size={30} />
            <p>Cargando postulaciones…</p>
          </div>
        ) : postulaciones.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              background: "#fff",
              borderRadius: 16,
            }}
          >
            <h3>Aún no tienes postulaciones</h3>
            <button className="btn-text-red" onClick={() => navigate("/dashboard")}>
              Buscar empleo
            </button>
          </div>
        ) : (
          <>
            <div className="applications-list">
              {postulaciones.map((app, i) => {
                const job = app.job || {};
                const company = job.company || {};
                const finalJobId = app._resolvedJobId;

                return (
                  <div key={i} className="app-card">
                    <div className="app-main-info">
                      <img src={getLogo(company)} alt="logo" className="app-logo" />
                      <div>
                        <h3 className="app-title">{job.title}</h3>
                        <p className="app-company">{company.name}</p>
                        <div className="app-meta">
                          <span>
                            <FaMapMarkerAlt />{" "}
                            {job.city || job.work_location_type || "Remoto"}
                          </span>
                          <span>
                            <FaCalendarAlt /> {formatDate(app.applied_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="app-status-col">
                      <div style={{ textAlign: "right", marginBottom: 8 }}>
                        {renderStatus(app.status)}
                      </div>

                      {finalJobId && (
                        <button
                          className="btn-text-red"
                          onClick={() => navigate(`/dashboard?jobId=${finalJobId}`)}
                        >
                          Ver vacante
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINACIÓN */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 16,
                marginTop: 24,
              }}
            >
              <button
                disabled={!canPrev}
                onClick={() => setPage((p) => p - 1)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: canPrev ? "#ef4444" : "#aaa",
                  cursor: canPrev ? "pointer" : "default",
                }}
              >
                <FaChevronLeft /> Anterior
              </button>

              <span>
                Página {page} de {totalPages}
              </span>

              <button
                disabled={!canNext}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: canNext ? "#ef4444" : "#aaa",
                  cursor: canNext ? "pointer" : "default",
                }}
              >
                Siguiente <FaChevronRight />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
