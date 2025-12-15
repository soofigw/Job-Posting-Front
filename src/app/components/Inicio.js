import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style.css";
import api from "../../services/api";

/* ✅ MISMO VacantesGrid que PerfilEmpresa */
import { VacantesGrid } from "../../app/components/VacanteCard";
import "./VacanteCard.css";

/* =========================
   Config ajustable
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
            const id = j?.job_id;
            if (id == null) continue;
            if (!map.has(id)) map.set(id, j);
        }
        return Array.from(map.values());
    };

    const sortByRecentListedTimeDesc = (jobs) => {
        return [...jobs].sort((a, b) => {
            const ta = new Date(a?.listed_time || a?.createdAt || 0).getTime();
            const tb = new Date(b?.listed_time || b?.createdAt || 0).getTime();
            return tb - ta;
        });
    };

    const clampPositiveInt = (n, fallback) => {
        const x = Number(n);
        if (!Number.isFinite(x)) return fallback;
        const i = Math.floor(x);
        return i > 0 ? i : fallback;
    };

    const getCompanyLogoSrc = (emp) => {
        if (emp?.logo_full_path) return emp.logo_full_path;
        const name = encodeURIComponent(emp?.name || "Company");
        return `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff`;
    };

    // ✅ Para que cada job SIEMPRE tenga job.company usable por VacantesGrid
    const toJobCompany = (emp) => {
        if (!emp) return null;
        const logoFull = emp.logo_full_path || emp.logo || null;
        return {
            company_id: emp.company_id,
            name: emp.name,
            logo: logoFull,
            logo_full_path: logoFull,
            city: emp.city,
            state: emp.state,
            country: emp.country,
            description: emp.description,
            company_size_min: emp.company_size_min,
            company_size_max: emp.company_size_max,
        };
    };

    const normalizeJobCompanyFields = (job) => {
        if (!job) return job;

        // si viene company pero con logo en otro campo, lo normalizamos
        if (job.company && !job.company.logo_full_path && job.company.logo) {
            job.company.logo_full_path = job.company.logo;
        }
        if (job.company && !job.company.logo && job.company.logo_full_path) {
            job.company.logo = job.company.logo_full_path;
        }
        return job;
    };

    /* =========================
       Home load
       ========================= */
    useEffect(() => {
        let alive = true;

        const loadHome = async () => {
            try {
                const empresasAMostrar = clampPositiveInt(EMPRESAS_A_MOSTRAR, 6);
                const vacantesAMostrar = clampPositiveInt(VACANTES_A_MOSTRAR, 12);
                const jobsPorEmpresa = clampPositiveInt(JOBS_POR_EMPRESA, 10);
                const poolMax = clampPositiveInt(RECENT_POOL_MAX, 30);

                // 1) featured
                const featuredRes = await api.get("/companies/featured");
                const featuredList = normalizeList(featuredRes.data);

                // 2) pick N
                const selectedCompanies = shuffleArray(featuredList).slice(0, empresasAMostrar);

                if (!alive) return;
                setEmpresas(selectedCompanies);

                // 3) jobs por empresa
                const jobRequests = selectedCompanies.map((c) =>
                    api.get(`/companies/${c.company_id}/jobs`, {
                        params: {
                            limit: jobsPorEmpresa,
                            include_company: "true",
                            sortBy: "listed_time",
                            sortDir: "desc",
                        },
                    })
                );

                const settled = await Promise.allSettled(jobRequests);

                const allJobs = settled.flatMap((r, idx) => {
                    if (r.status !== "fulfilled") return [];
                    const emp = selectedCompanies[idx];
                    const jobs = normalizeList(r.value.data);

                    return jobs.map((j) => {
                        const merged = {
                            ...j,
                            company_id: j.company_id ?? emp?.company_id,
                            company: j.company ?? toJobCompany(emp),
                        };
                        return normalizeJobCompanyFields(merged);
                    });
                });

                let unique = dedupeByJobId(allJobs);
                let recentOrdered = sortByRecentListedTimeDesc(unique);

                // fallback global
                if (recentOrdered.length === 0) {
                    const fallbackRes = await api.get("/jobs", {
                        params: {
                            limit: Math.max(vacantesAMostrar * 6, 20),
                            include_company: "true",
                            sortBy: "listed_time",
                            sortDir: "desc",
                        },
                    });

                    const fallbackJobs = normalizeList(fallbackRes.data).map((j) =>
                        normalizeJobCompanyFields({ ...j })
                    );

                    unique = dedupeByJobId(fallbackJobs);
                    recentOrdered = sortByRecentListedTimeDesc(unique);
                }

                const recentPool = recentOrdered.slice(0, poolMax);
                const selectedJobs = shuffleArray(recentPool).slice(0, vacantesAMostrar);

                if (!alive) return;

                // ✅ payload completo como PerfilEmpresa
                setVacantesPayload({
                    meta: {
                        page: 1,
                        limit: vacantesAMostrar,
                        total: selectedJobs.length,
                        totalPages: 1,
                    },
                    data: selectedJobs,
                });
            } catch (err) {
                console.error("Error cargando Home", err);
            }
        };

        loadHome();

        return () => {
            alive = false;
        };
    }, []);

    const empresaRows = chunkArray(empresas, EMPRESAS_POR_FILA);
    const vacantesList = Array.isArray(vacantesPayload?.data) ? vacantesPayload.data : [];

    return (
        <div className="inicio-bg">
            {/* HERO */}
            <section className="hero">
                <h1>Tu próximo empleo te está esperando</h1>
                <p>
                    Conecta con empresas reales y aplica a miles de vacantes verificadas
                    cada día.
                </p>
                <a href="#vacantes" className="hero-btn">
                    Explorar vacantes
                </a>
            </section>

            {/* EMPRESAS DESTACADAS */}
            <section className="empresas-section">
                <h2>Empresas destacadas</h2>

                {empresaRows.map((row, idx) => {
                    const isFirstRow = idx === 0;
                    const isSmallRow = row.length <= 2;
                    const rowClass = isFirstRow || !isSmallRow ? "empresas-top" : "empresas-bottom";

                    return (
                        <div key={`row-${idx}`} className={`empresas-grid ${rowClass}`}>
                            {row.map((emp) => (
                                <div
                                    key={emp.company_id}
                                    className="empresa-card"
                                    onClick={() => navigate(`/empresa/${emp.company_id}`)}
                                    style={{ cursor: "pointer" }}
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
                    );
                })}
            </section>

            {/* ✅ VACANTES (MISMO LOOK QUE PERFIL EMPRESA) */}
            <section id="vacantes" className="empresa-vacantes-clean">
                <h2>Vacantes más recientes</h2>

                {vacantesList.length === 0 && (
                    <p className="no-vacantes">Aún no hay vacantes recientes.</p>
                )}

                <VacantesGrid
                    payload={vacantesPayload}
                    containerClassName="empresa-vacantes-grid"
                    showDescription={false}
                    onCardClick={(job) => navigate("/dashboard")}
                    onCompanyClick={(companyId) => navigate(`/empresa/${companyId}`)}
                    empty={null}
                />

                <a href="/login" className="ver-todas-btn">
                    Ver todas las vacantes
                </a>
            </section>

            {/* CTA EMPRESAS */}
            <div className="employer-cta">
                <div className="cta-icon">💼</div>
                <h2>Publica tu vacante y encuentra al candidato ideal</h2>
                <p>
                    Conecta con profesionales verificados y gestiona tu proceso de
                    selección de forma rápida y sencilla.
                </p>
                <a href="/login" className="cta-btn">
                    Publicar una vacante
                </a>
            </div>

            <footer className="footer">© 2025 Job Posting — Plataforma de empleo profesional</footer>
        </div>
    );
}
