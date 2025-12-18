import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import "../../style.css";
import api from "../../services/api";

import { AUTH_STORAGE, ACTOR_TYPES } from "../../caracteristicas/autenticacion/authTypes";

/* Vacantes */
import { VacantesGrid } from "../../app/components/VacanteCard";
import "./VacanteCard.css";

/* =========================
   SESSION (FUENTE ÚNICA)
========================= */
const actorRaw = localStorage.getItem(AUTH_STORAGE.ACTOR);
const actor = actorRaw ? JSON.parse(actorRaw) : null;
const token = localStorage.getItem(AUTH_STORAGE.TOKEN);

/* =========================
   Config
========================= */
const EMPRESAS_A_MOSTRAR = 8;
const EMPRESAS_POR_FILA = 4;
const VACANTES_A_MOSTRAR = 50;
const JOBS_POR_EMPRESA = 10;
const RECENT_POOL_MAX = 30;

export default function Inicio() {
    const [empresas, setEmpresas] = useState([]);
    const [vacantesPayload, setVacantesPayload] = useState({ meta: null, data: [] });
    const navigate = useNavigate();

    /* =========================
       SESSION
    ========================= */
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user_data");
    const user = userRaw ? JSON.parse(userRaw) : null;

    /* =========================
       Utils
    ========================= */
    const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

    const chunkArray = (arr, size) => {
        const out = [];
        for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
        return out;
    };

    const normalizeList = (payload) => {
        if (Array.isArray(payload)) return payload;
        if (payload && Array.isArray(payload.data)) return payload.data;
        return [];
    };

    const dedupeByJobId = (jobs) => {
        const map = new Map();
        for (const j of jobs) {
            if (!map.has(j.job_id)) map.set(j.job_id, j);
        }
        return Array.from(map.values());
    };

    const sortByRecentListedTimeDesc = (jobs) =>
        [...jobs].sort(
            (a, b) =>
                new Date(b.listed_time || b.createdAt || 0) -
                new Date(a.listed_time || a.createdAt || 0)
        );

    const getCompanyLogoSrc = (emp) =>
        emp?.logo_full_path
            ? emp.logo_full_path
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  emp?.name || "Company"
              )}&background=0D8ABC&color=fff`;

    /* =========================
       LOAD HOME
    ========================= */
    useEffect(() => {
        let alive = true;

        const loadHome = async () => {
            try {
                const featuredRes = await api.get("/companies/featured");
                const featuredList = normalizeList(featuredRes.data);

                const selectedCompanies = shuffleArray(featuredList).slice(
                    0,
                    EMPRESAS_A_MOSTRAR
                );

                if (!alive) return;
                setEmpresas(selectedCompanies);

                const jobRequests = selectedCompanies.map((c) =>
                    api.get(`/companies/${c.company_id}/jobs`, {
                        params: {
                            limit: JOBS_POR_EMPRESA,
                            include_company: "true",
                        },
                    })
                );

                const settled = await Promise.allSettled(jobRequests);

                const allJobs = settled.flatMap((r, idx) =>
                    r.status === "fulfilled"
                        ? normalizeList(r.value.data).map((j) => ({
                              ...j,
                              company: j.company || selectedCompanies[idx],
                          }))
                        : []
                );

                const unique = dedupeByJobId(allJobs);
                const recent = sortByRecentListedTimeDesc(unique)
                    .slice(0, RECENT_POOL_MAX)
                    .slice(0, VACANTES_A_MOSTRAR);

                if (!alive) return;

                setVacantesPayload({
                    meta: { page: 1, limit: recent.length, total: recent.length },
                    data: recent,
                });
            } catch (err) {
                console.error("Error cargando Inicio", err);
            }
        };

        loadHome();
        return () => (alive = false);
    }, []);

    /* =========================
       NAVIGATION RULES
    ========================= */
    const irADetalle = (jobId) => {
        navigate(`/dashboard?jobId=${jobId}`);
    };

    const handleVerTodas = () => {
    if (actor?.type === ACTOR_TYPES.COMPANY) {
        navigate(`/company/${actor.company_id}/dashboard`);
        return;
    }

    navigate("/dashboard");
};



    const handlePublicarVacante = () => {
    if (!actor || !token) {
        toast.info("Inicia sesión para publicar una vacante");
        navigate("/login");
        return;
    }

    if (actor.type !== ACTOR_TYPES.COMPANY) {
        toast.error("Solo las empresas pueden publicar vacantes");
        return;
    }

    navigate("/dashboard/vacantes");
};




    const empresaRows = chunkArray(empresas, EMPRESAS_POR_FILA);

    /* =========================
       RENDER
    ========================= */
    return (
        <div className="inicio-bg">
            {/* HERO */}
            <section className="hero">
                <h1>Tu próximo empleo te está esperando</h1>
                <p>Conecta con empresas reales y aplica a vacantes verificadas.</p>
                <a href="#vacantes" className="hero-btn">
                    Explorar vacantes
                </a>
            </section>

            {/* EMPRESAS */}
            <section className="empresas-section">
                <h2>Empresas destacadas</h2>
                {empresaRows.map((row, idx) => (
                    <div key={idx} className="empresas-grid empresas-top">
                        {row.map((emp) => (
                            <div
                                key={emp.company_id}
                                className="empresa-card"
                                onClick={() => navigate(`/empresa/${emp.company_id}`)}
                            >
                                <img
                                    src={getCompanyLogoSrc(emp)}
                                    alt={emp.name}
                                    className="empresa-logo"
                                />
                                <span>{emp.name}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </section>

            {/* VACANTES */}
            <section id="vacantes" className="empresa-vacantes-clean">
                <h2>Vacantes más recientes</h2>

                <VacantesGrid
                    payload={vacantesPayload}
                    showDescription={false}
                    onCardClick={(job) => irADetalle(job.job_id)}
                    onCompanyClick={(id) => navigate(`/empresa/${id}`)}
                />

                <button className="ver-todas-btn" onClick={handleVerTodas}>
                    Ver todas las vacantes
                </button>
            </section>

            {/* CTA EMPRESAS */}
            <div className="employer-cta">
                <div className="cta-icon">💼</div>
                <h2>Publica tu vacante y encuentra al candidato ideal</h2>
                <p>Gestiona tu proceso de selección fácilmente.</p>
                <button className="cta-btn" onClick={handlePublicarVacante}>
                    Publicar una vacante
                </button>
            </div>

            <footer className="footer">
                © 2025 Job Posting — Plataforma de empleo profesional
            </footer>
        </div>
    );
}

