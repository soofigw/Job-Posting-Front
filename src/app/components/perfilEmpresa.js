import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../style.css";
import api from "../../services/api";

// ✅ Ajusta esta ruta según dónde guardaste el componente
import { VacantesGrid } from "../../app/components/VacanteCard";

export default function PerfilEmpresa() {
    const { companyId } = useParams();
    const navigate = useNavigate();

    const [empresa, setEmpresa] = useState(null);

    // ✅ guardamos el payload completo { meta, data } para poder reutilizar VacantesGrid
    const [vacantesPayload, setVacantesPayload] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;

        async function cargarDatos() {
            try {
                // Empresa
                const resEmpresa = await api.get(`/companies/${companyId}`);
                if (!alive) return;
                setEmpresa(resEmpresa.data);

                // Vacantes de esa empresa (payload completo)
                const resVacantes = await api.get(`/companies/${companyId}/jobs`, {
                    params: {
                        include_company: "true",
                        sortBy: "listed_time",
                        sortDir: "desc",
                        limit: 50
                    }
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

    const vacantesList = Array.isArray(vacantesPayload?.data) ? vacantesPayload.data : [];

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
                    </div>
                </div>
            </section>

            {/* ===== VACANTES ===== */}
            <section className="empresa-vacantes-clean">
                <h2>Vacantes disponibles</h2>

                {vacantesList.length === 0 && (
                    <p className="no-vacantes">Esta empresa no tiene vacantes publicadas.</p>
                )}

                {/* ✅ AQUÍ YA SE USA LA CARD REUTILIZABLE */}
                <VacantesGrid
                    payload={vacantesPayload}                 // acepta {meta,data}
                    containerClassName="empresa-vacantes-grid" // mantiene tu grid y tu CSS
                    company={empresa}                         // fuerza logo/nombre de la empresa
                    showDescription={false}                   // (cámbialo a true si quieres mostrar descripción)
                    onCardClick={(job) => navigate(`/dashboard`)} // o navega a /vacante/${job.job_id}
                    empty={null}
                />
            </section>
        </div>
    );
}

