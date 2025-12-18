import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { loadSession } from "../../caracteristicas/autenticacion/authService";
import {
    FaTrashAlt,
    FaMapMarkerAlt,
    FaDollarSign,
    FaExternalLinkAlt,
    FaSpinner,
    FaCalendarAlt,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa";

export default function MisFavoritos() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [favoritos, setFavoritos] = useState([]);
    const [removingId, setRemovingId] = useState(null);

    // paginación
    const [page, setPage] = useState(1);
    const limit = 20;
    const [total, setTotal] = useState(0);

    const canPrev = page > 1;
    const canNext = useMemo(() => page * limit < total, [page, limit, total]);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const { token, actor } = loadSession();
                if (!actor || !token || actor.type !== "candidate") {
                    navigate("/login");
                    return;
                }

                const auth = { headers: { Authorization: `Bearer ${token}` } };

                // 1️⃣ favoritos
                const res = await api.get(`/favorites?page=${page}&limit=${limit}`, auth);
                const items = res.data?.items || [];

                // 2️⃣ resolver company
                const enriched = await Promise.all(
                    items.map(async (item) => {
                        const job = item.job;
                        if (!job?.company_id) return { ...item, company: null };

                        try {
                            const cRes = await api.get(`/companies/${job.company_id}`);
                            return { ...item, company: cRes.data };
                        } catch {
                            return { ...item, company: null };
                        }
                    })
                );

                setFavoritos(enriched);
                setTotal(res.data?.total || 0);
            } catch (err) {
                console.error("Error cargando favoritos:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [navigate, page]);

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString("es-MX") : "Reciente";

    const getSalary = (job) => {
        if (job?.min_salary && job?.max_salary) {
            return `$${job.min_salary.toLocaleString()} - $${job.max_salary.toLocaleString()}`;
        }
        return null;
    };

    const getLogo = (company) => {
        if (company?.logo_full_path) return company.logo_full_path;
        const name = encodeURIComponent(company?.name || "E");
        return `https://ui-avatars.com/api/?name=${name}&background=f1f5f9&color=64748b`;
    };

    const handleRemove = async (jobId) => {
        try {
            const { token } = loadSession();
            setRemovingId(jobId);

            await api.delete(`/favorites/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setFavoritos((prev) => prev.filter((f) => f.job.job_id !== jobId));
            setTotal((t) => t - 1);
        } catch (err) {
            console.error("Error quitando favorito:", err);
        } finally {
            setRemovingId(null);
        }
    };

    /* =========================
       ESTILOS INLINE
    ========================= */

    const fadeIn = {
        animation: "fadeIn 0.3s ease-in",
    };

    return (
        <div style={{ background: "#fafafa", minHeight: "100vh", padding: "40px 16px" }}>
            <style>
                {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
            </style>

            <div style={{ maxWidth: 900, margin: "0 auto" }}>
                <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>
                    Mis Favoritos
                </h2>

                {loading ? (
                    <div style={{ textAlign: "center", padding: 60, color: "#888" }}>
                        <FaSpinner className="fa-spin" size={30} />
                        <p>Cargando favoritos…</p>
                    </div>
                ) : favoritos.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: 60,
                            background: "#fff",
                            borderRadius: 16,
                            border: "1px solid #e5e7eb",
                        }}
                    >
                        <h3>Aún no tienes favoritos</h3>
                        <button
                            onClick={() => navigate("/dashboard")}
                            style={{
                                marginTop: 12,
                                border: "none",
                                background: "#ef4444",
                                color: "#fff",
                                padding: "10px 16px",
                                borderRadius: 8,
                                cursor: "pointer",
                            }}
                        >
                            Buscar empleo
                        </button>
                    </div>
                ) : (
                    <>
                        {favoritos.map((it, i) => {
                            const job = it.job;
                            const company = it.company;

                            return (
                                <div
                                    key={i}
                                    style={{
                                        ...fadeIn,
                                        background: "#fff",
                                        borderRadius: 16,
                                        padding: 20,
                                        marginBottom: 16,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        border: "1px solid #e5e7eb",
                                        transition: "box-shadow .2s, transform .2s",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.boxShadow =
                                            "0 10px 25px rgba(0,0,0,0.06)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.boxShadow = "none")
                                    }
                                >
                                    {/* info */}
                                    <div style={{ display: "flex", gap: 16 }}>
                                        <img
                                            src={getLogo(company)}
                                            alt="logo"
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 12,
                                                objectFit: "cover",
                                            }}
                                        />

                                        <div>
                                            <h3 style={{ margin: 0 }}>{job.title}</h3>
                                            <p style={{ margin: "4px 0", color: "#ef4444" }}>
                                                {company?.name || "Desconocida"}
                                            </p>

                                            <div style={{ display: "flex", gap: 14, fontSize: 14, color: "#666" }}>
                        <span>
                          <FaMapMarkerAlt /> {job.city}, {job.state}
                        </span>

                                                {getSalary(job) && (
                                                    <span>
                            <FaDollarSign /> {getSalary(job)}
                          </span>
                                                )}

                                                <span>
                          <FaCalendarAlt /> {formatDate(it.favorited_at)}
                        </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* acciones */}
                                    <div style={{ display: "flex", gap: 12 }}>
                                        <button
                                            onClick={() => navigate(`/dashboard?jobId=${job.job_id}`)}
                                            style={{
                                                background: "transparent",
                                                border: "none",
                                                color: "#ef4444",
                                                cursor: "pointer",
                                                fontWeight: 600,
                                            }}
                                        >
                                            <FaExternalLinkAlt /> Ver vacante
                                        </button>

                                        <button
                                            onClick={() => handleRemove(job.job_id)}
                                            disabled={removingId === job.job_id}
                                            style={{
                                                background: "transparent",
                                                border: "none",
                                                color: "#ef4444",
                                                cursor: "pointer",
                                                fontWeight: 600,
                                                opacity: removingId === job.job_id ? 0.6 : 1,
                                            }}
                                        >
                                            {removingId === job.job_id ? (
                                                <>
                                                    <FaSpinner className="fa-spin" /> Quitando…
                                                </>
                                            ) : (
                                                <>
                                                    <FaTrashAlt /> Quitar
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* paginación */}
                        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 20 }}>
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

                            <span>Página {page}</span>

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
