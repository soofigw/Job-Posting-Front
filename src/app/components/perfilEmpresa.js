import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../style.css";

export default function PerfilEmpresa() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [empresa, setEmpresa] = useState(null);
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const resEmpresa = await fetch(
          `http://localhost:8000/api/companies/${companyId}`
        );
        const empresaData = await resEmpresa.json();
        setEmpresa(empresaData);

        const resVacantes = await fetch(
          `http://localhost:8000/api/companies/${companyId}/jobs`
        );
        const vacantesData = await resVacantes.json();
        setVacantes(vacantesData.data || []);
      } catch (err) {
        console.error("Error cargando empresa", err);
      } finally {
        setLoading(false);
      }
    }

    cargarDatos();
  }, [companyId]);

  if (loading) return <p style={{ padding: 40 }}>Cargando empresa…</p>;
  if (!empresa) return <p>No se encontró la empresa</p>;

  return (
    <div className="perfil-empresa-page">

      {/* ===== HERO EMPRESA ===== */}
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
              <span>📍 {empresa.city}, {empresa.state}, {empresa.country}</span>
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
          </div>
        </div>
      </section>

      {/* ===== VACANTES ===== */}
      <section className="empresa-vacantes-clean">
        <h2>Vacantes disponibles</h2>

        {vacantes.length === 0 && (
          <p className="no-vacantes">
            Esta empresa no tiene vacantes publicadas.
          </p>
        )}

        <div className="empresa-vacantes-list">
          {vacantes.map((v) => (
            <div
              key={v.job_id}
              className="vacante-clean-card"
              onClick={() => navigate(`/dashboard?job=${v.job_id}`)}
            >
              <img
                src={empresa.logo_full_path}
                alt={empresa.name}
                className="vacante-logo"
              />

              <div className="vacante-info">
                <h3>{v.title}</h3>

                <span className={`badge-mode ${v.work_location_type?.toLowerCase()}`}>
                  {v.work_location_type === "REMOTE"
                    ? "Remoto"
                    : v.work_location_type === "HYBRID"
                    ? "Híbrido"
                    : "Presencial"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
