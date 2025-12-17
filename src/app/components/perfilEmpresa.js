import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../style.css";
import api from "../../services/api";
import { VacantesGrid } from "../../app/components/VacanteCard";

// 👉 helper para saber quién está logeado
function getActor() {
  try {
    return JSON.parse(localStorage.getItem("actor"));
  } catch {
    return null;
  }
}

export default function PerfilEmpresa() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const actor = getActor();
  const isOwner = actor?.type === "company";

  const [empresa, setEmpresa] = useState(null);
  const [vacantesPayload, setVacantesPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function cargarDatos() {
      try {
        // ===== EMPRESA =====
        const resEmpresa = await api.get(`/companies/${companyId}`);
        if (!alive) return;
        setEmpresa(resEmpresa.data);

        // ===== VACANTES =====
        const resVacantes = await api.get(`/companies/${companyId}/jobs`, {
          params: {
            include_company: "true",
            sortBy: "listed_time",
            sortDir: "desc",
            limit: 50,
          },
        });

        if (!alive) return;
        setVacantesPayload(resVacantes.data);
      } catch (err) {
        console.error("Error cargando empresa", err);
      } finally {
        if (alive) setLoading(false);
      }
    }

    cargarDatos();
    return () => {
      alive = false;
    };
  }, [companyId]);

  const vacantesList = Array.isArray(vacantesPayload?.data)
    ? vacantesPayload.data
    : [];

  if (loading) return <p style={{ padding: 40 }}>Cargando empresa…</p>;
  if (!empresa) return <p>No se encontró la empresa</p>;

  return (
    <div className="perfil-empresa-page">
      {/* ===== HERO ===== */}
      <section className="empresa-hero">
        <div className="empresa-hero-card">
          <img
            src={empresa.logo_full_path}
            alt={empresa.name}
            className="empresa-logo-hero"
          />

          <div className="empresa-hero-info">
            <h1>{empresa.name}</h1>

            <div className="empresa-hero-meta">
              <span>
                📍 {empresa.city}, {empresa.state}, {empresa.country}
              </span>

              {empresa.company_size_min && empresa.company_size_max && (
                <span>
                  👥 {empresa.company_size_min.toLocaleString()} –{" "}
                  {empresa.company_size_max.toLocaleString()} empleados
                </span>
              )}
            </div>

            {empresa.description && (
              <p className="empresa-hero-desc">
                {empresa.description.slice(0, 260)}…
              </p>
            )}

            {/* ===== SOLO SI ES LA EMPRESA DUEÑA ===== */}
            
          </div>
        </div>
      </section>

      {/* ===== VACANTES ===== */}
      <section className="empresa-vacantes-clean">
        <h2>Vacantes disponibles</h2>

        {vacantesList.length === 0 && (
          <p className="no-vacantes">
            Esta empresa no tiene vacantes publicadas.
          </p>
        )}

        <VacantesGrid
        payload={vacantesPayload}
        company={empresa}
        mode={isOwner ? "owner" : "public"}
        onEdit={(job) => navigate(`/dashboard/vacantes/${job.job_id}`)}
        onViewApplicants={(job) =>
          navigate(`/dashboard/vacantes/${job.job_id}/postulantes`)
        }
        onCardClick={(job) =>
          isOwner
            ? navigate(`/dashboard/vacantes/${job.job_id}`)
            : navigate(`/vacante/${job.job_id}`)
        }
        onRefresh={() => window.location.reload()}
        empty={null}
      />



      </section>
    </div>
  );
}
