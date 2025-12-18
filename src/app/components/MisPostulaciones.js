import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; 
import { 
  FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, 
  FaClock, FaTimesCircle, FaSpinner 
} from "react-icons/fa";
import "../../style.css";
import {loadSession} from "../../caracteristicas/autenticacion/authService";

export default function MisPostulaciones() {
  const navigate = useNavigate();
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ HELPER: CAZADOR DE IDs (Busca el ID donde sea que se esconda)
  const getJobIdFromApp = (app) => {
      // 1. ¿Viene directo en la raíz? (Lo más probable en SQL)
      if (app.job_id) return app.job_id;
      
      // 2. ¿Viene dentro de un objeto 'job'? (Lo más probable en Mongo populate)
      if (app.job) {
          if (typeof app.job === 'object') {
              return app.job.job_id || app.job._id || app.job.id;
          }
          // Si app.job es un número/string, ese es el ID
          return app.job;
      }

      // 3. ¿Viene como jobId (camelCase)?
      if (app.jobId) return app.jobId;

      return null;
  };

    useEffect(() => {
        const fetchFullData = async () => {
            try {
                // ✅ Usar tu sesión centralizada
                const { token, actor } = loadSession();

                // ✅ Validación de sesión + rol
                if (!actor || !token || actor.type !== "candidate") {
                    navigate("/login");
                    return;
                }

                // ✅ candidate_id desde el actor
                const candidateId = actor.candidate_id;
                if (!candidateId) {
                    console.error("❌ No viene candidate_id en actor:", actor);
                    navigate("/login");
                    return;
                }

                const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

                // 1. Pedir lista de postulaciones
                const res = await api.get(
                    `/applications/candidates/${candidateId}/applications`,
                    authHeaders
                );

                const listaCruda = res.data?.items || res.data?.data || [];

                // 🔍 DEBUG: Ver qué demonios está llegando
                console.log("📦 Lista Cruda del Backend:", listaCruda);

                // 2. 🪄 MAGIA FRONTEND: Buscar detalles
                const listaCompleta = await Promise.all(
                    listaCruda.map(async (app) => {
                        // Usamos el Cazador de IDs
                        const jobId = getJobIdFromApp(app);
                        let jobData = { title: "Cargando...", company: { name: "..." } };

                        if (jobId) {
                            try {
                                const jobRes = await api.get(`/jobs/${jobId}`, authHeaders);

                                // Normalizamos la respuesta de la vacante
                                if (jobRes.data) {
                                    const fullJob = jobRes.data.data || jobRes.data;

                                    // Arreglamos el logo
                                    if (
                                        fullJob.company &&
                                        !fullJob.company.logo_full_path &&
                                        fullJob.company.logo
                                    ) {
                                        fullJob.company.logo_full_path = fullJob.company.logo;
                                    }

                                    jobData = fullJob;
                                }
                            } catch (err) {
                                console.warn(`No se encontró info para job ${jobId}`);
                                jobData = {
                                    title: "Vacante no disponible (Eliminada)",
                                    company: { name: "Desconocida" },
                                };
                            }
                        } else {
                            console.error("❌ No se encontró ID en este objeto:", app);
                        }

                        // IMPORTANTE: Guardamos el ID encontrado en _resolvedJobId
                        return {
                            ...app,
                            job: jobData,
                            _resolvedJobId: jobId,
                        };
                    })
                );

                setPostulaciones(listaCompleta);
            } catch (err) {
                console.error("Error general:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFullData();
    }, [navigate]);


    // Helpers visuales
  const renderStatus = (status) => {
    const s = status ? status.toUpperCase() : "APPLIED";
    switch (s) {
      case "APPLIED": return <span className="status-badge sent"><FaClock /> Enviada</span>;
      case "REVIEWING": return <span className="status-badge process"><FaCheckCircle /> En revisión</span>;
      case "INTERVIEW": return <span className="status-badge process"><FaCheckCircle /> Entrevista</span>;
      case "OFFERED": return <span className="status-badge finalist">🌟 Oferta</span>;
      case "REJECTED": return <span className="status-badge rejected"><FaTimesCircle /> Descartado</span>;
      default: return <span className="status-badge sent">{s}</span>;
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("es-ES") : "Reciente";

  const getLogo = (company) => {
      if (company?.logo_full_path) return company.logo_full_path;
      if (company?.logo) return company.logo;
      const name = encodeURIComponent(company?.name || "E");
      return `https://ui-avatars.com/api/?name=${name}&background=f1f5f9&color=64748b`;
  };

  return (
    <div className="dashboard-wrapper">
      <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "40px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "10px", color: "var(--emp-text)" }}>
          Mis Postulaciones
        </h2>

        {loading ? (
           <div style={{textAlign:'center', padding:'60px', color:'#888'}}>
              <FaSpinner className="fa-spin" size={30}/> <p>Cargando tus datos...</p>
           </div>
        ) : postulaciones.length === 0 ? (
           <div style={{textAlign:'center', padding:'60px', background:'#fff', borderRadius:'16px', border:'1px solid #e2e8f0'}}>
              <h3>Aún no tienes postulaciones</h3>
              <button className="btn-text-red" onClick={() => navigate("/dashboard")}>Ir a buscar empleo</button>
           </div>
        ) : (
          <div className="applications-list">
            {postulaciones.map((app, i) => {
              const job = app.job || {}; 
              const company = job.company || {}; 
              // Usamos el ID que resolvimos en la carga
              const finalJobId = app._resolvedJobId;

              return (
                <div key={i} className="app-card">
                  <div className="app-main-info">
                    <img src={getLogo(company)} alt="logo" className="app-logo" />
                    <div>
                      <h3 className="app-title">{job.title}</h3>
                      <p className="app-company">{company.name}</p>
                      <div className="app-meta">
                        <span><FaMapMarkerAlt /> {job.city || job.work_location_type || "Remoto"}</span>
                        <span><FaCalendarAlt /> {formatDate(app.application_date || app.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="app-status-col">
                    <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                        {renderStatus(app.status)}
                    </div>
                    <div style={{ textAlign: 'right' }}>
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}