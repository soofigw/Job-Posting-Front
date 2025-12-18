import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSpinner,
} from "react-icons/fa";
import "../../style.css";

/* ======================
   MAPA DE ESTADOS (BACK → ESP)
====================== */
const STATUS_MAP = {
  APPLIED: {
    label: "Postulado",
    class: "sent",
    icon: <FaClock />,
  },
  REVIEWING: {
    label: "En revisión",
    class: "process",
    icon: <FaCheckCircle />,
  },
  INTERVIEW: {
    label: "Entrevista",
    class: "process",
    icon: <FaCheckCircle />,
  },
  OFFERED: {
    label: "Oferta enviada",
    class: "finalist",
    icon: "🌟",
  },
  HIRED: {
    label: "Contratado",
    class: "finalist",
    icon: <FaCheckCircle />,
  },
  REJECTED: {
    label: "Rechazado",
    class: "rejected",
    icon: <FaTimesCircle />,
  },
};

export default function MisPostulaciones() {
  const navigate = useNavigate();
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);

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
     CARGAR POSTULACIONES
  ====================== */
  useEffect(() => {
    const fetchFullData = async () => {
      try {
        const storedUser = localStorage.getItem("user_data");
        const token = localStorage.getItem("token");
        const user = storedUser ? JSON.parse(storedUser) : null;

        if (!user || !token || user.type !== "candidate") {
          navigate("/login");
          return;
        }

        const res = await api.get(
          `/applications/candidates/${user.candidate_id}/applications`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const listaCruda = res.data.items || res.data.data || [];

        const listaCompleta = await Promise.all(
          listaCruda.map(async (app) => {
            const jobId = getJobIdFromApp(app);
            let jobData = { title: "Vacante no disponible", company: { name: "—" } };

            if (jobId) {
              try {
                const jobRes = await api.get(`/jobs/${jobId}`);
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

        setPostulaciones(listaCompleta);
      } catch (err) {
        console.error("Error cargando postulaciones:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFullData();
  }, [navigate]);

  /* ======================
     HELPERS VISUALES
  ====================== */
  const renderStatus = (status) => {
    const key = status?.toUpperCase() || "APPLIED";
    const cfg = STATUS_MAP[key];

    if (!cfg) {
      return <span className="status-badge sent">{key}</span>;
    }

    return (
      <span className={`status-badge ${cfg.class}`}>
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("es-MX") : "Reciente";

  const getLogo = (company) => {
    if (company?.logo_full_path) return company.logo_full_path;
    if (company?.logo) return company.logo;
    const name = encodeURIComponent(company?.name || "E");
    return `https://ui-avatars.com/api/?name=${name}&background=f1f5f9&color=64748b`;
  };

  /* ======================
     RENDER
  ====================== */
  return (
    <div className="dashboard-wrapper">
      <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "40px" }}>
        <h2
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "16px",
          }}
        >
          Mis Postulaciones
        </h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#888" }}>
            <FaSpinner className="fa-spin" size={30} />
            <p>Cargando tus postulaciones…</p>
          </div>
        ) : postulaciones.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              background: "#fff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3>Aún no tienes postulaciones</h3>
            <button
              className="btn-text-red"
              onClick={() => navigate("/dashboard")}
            >
              Ir a buscar empleo
            </button>
          </div>
        ) : (
          <div className="applications-list">
            {postulaciones.map((app, i) => {
              const job = app.job || {};
              const company = job.company || {};
              const finalJobId = app._resolvedJobId;

              return (
                <div key={i} className="app-card">
                  <div className="app-main-info">
                    <img
                      src={getLogo(company)}
                      alt="logo"
                      className="app-logo"
                    />
                    <div>
                      <h3 className="app-title">{job.title}</h3>
                      <p className="app-company">{company.name}</p>
                      <div className="app-meta">
                        <span>
                          <FaMapMarkerAlt />{" "}
                          {job.city || job.work_location_type || "Remoto"}
                        </span>
                        <span>
                          <FaCalendarAlt />{" "}
                          {formatDate(app.application_date || app.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="app-status-col">
                    <div style={{ textAlign: "right", marginBottom: "8px" }}>
                      {renderStatus(app.status)}
                    </div>

                    {finalJobId && (
                      <div style={{ textAlign: "right" }}>
                        <button
                          className="btn-text-red"
                          onClick={() =>
                            navigate(`/dashboard?jobId=${finalJobId}`)
                          }
                        >
                          Ver vacante
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
