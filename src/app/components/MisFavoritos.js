import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaHeart,
    FaTrashAlt,
    FaMapMarkerAlt,
    FaDollarSign,
    FaExternalLinkAlt,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import api from "../../services/api";
import "../../style.css";

export default function MisFavoritos() {
    const navigate = useNavigate();

    const actor = useSelector((state) => state.auth?.actor);
    const isCandidate = actor?.type === "candidate";

    const [loading, setLoading] = useState(true);

    // paginación
    const [page, setPage] = useState(1);
    const limit = 20;

    // respuesta API
    // items: [{ favorited_at, job }]
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);

    const canPrev = page > 1;
    const canNext = useMemo(() => page * limit < total, [page, limit, total]);

    /* ======================
       Helpers
    ====================== */
    const timeAgo = (dateLike) => {
        if (!dateLike) return "—";
        const d = new Date(dateLike);
        if (isNaN(d.getTime())) return "—";

        const diffMs = Date.now() - d.getTime();
        const sec = Math.floor(diffMs / 1000);
        if (sec < 60) return "Hace unos segundos";
        const min = Math.floor(sec / 60);
        if (min < 60) return `Hace ${min} min`;
        const hr = Math.floor(min / 60);
        if (hr < 24) return `Hace ${hr} h`;
        const day = Math.floor(hr / 24);
        if (day < 7) return `Hace ${day} día${day === 1 ? "" : "s"}`;
        const week = Math.floor(day / 7);
        if (week < 5) return `Hace ${week} semana${week === 1 ? "" : "s"}`;
        const month = Math.floor(day / 30);
        if (month < 12) return `Hace ${month} mes${month === 1 ? "" : "es"}`;
        const year = Math.floor(day / 365);
        return `Hace ${year} año${year === 1 ? "" : "s"}`;
    };

    const safeErrMessage = (err) =>
        err?.response?.data?.message ||
        err?.message ||
        "Ocurrió un error inesperado.";

    /* ======================
       API
    ====================== */
    const cargarFavoritos = async (p = page) => {
        try {
            setLoading(true);

            const res = await api.get("/favorites", {
                params: { page: p, limit },
            });

            // contrato:
            // { status: "ok", total, page, limit, items: [{ favorited_at, job }] }
            const data = res.data;

            if (data?.status !== "ok") {
                toast.error("Respuesta inesperada del servidor.");
                setItems([]);
                setTotal(0);
                return;
            }

            setItems(Array.isArray(data.items) ? data.items : []);
            setTotal(Number(data.total || 0));
            setPage(Number(data.page || p));
        } catch (err) {
            toast.error(safeErrMessage(err));
            setItems([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isCandidate) {
            setLoading(false);
            setItems([]);
            setTotal(0);
            return;
        }

        cargarFavoritos(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCandidate]);

    /* ======================
       Acciones
    ====================== */
    const eliminarFavorito = async (job_id) => {
        if (!job_id) return;

        try {
            const res = await api.delete(`/favorites/${job_id}`);

            if (res.data?.status === "removed") {
                setItems((prev) =>
                    prev.filter((it) => it?.job?.job_id !== job_id)
                );
                setTotal((t) => Math.max(0, t - 1));
                toast.info("Eliminado de favoritos");
                return;
            }

            toast.info("Favorito actualizado.");
        } catch (err) {
            toast.error(safeErrMessage(err));
        }
    };

    const verVacante = (job_id) => {
        if (!job_id) return;
        navigate(`/jobs/${job_id}`);
    };

    /* ======================
       Render
    ====================== */
    return (
        <div className="dashboard-wrapper">
            <ToastContainer position="bottom-right" autoClose={2000} />

            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                <h2
                    style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        marginBottom: "10px",
                        color: "var(--emp-text)",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    Mis Favoritos
                    <FaHeart style={{ color: "var(--primary)" }} size={26} />
                </h2>

                <p style={{ color: "var(--emp-text-soft)", marginBottom: "20px" }}>
                    Vacantes que has guardado para revisar después.
                </p>

                {!isCandidate && (
                    <div style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>
                        <h3>Esta sección es solo para candidatos</h3>
                        <p style={{ marginTop: "10px" }}>
                            Inicia sesión como candidato para ver tus favoritos.
                        </p>
                    </div>
                )}

                {isCandidate && (
                    <>
                        {/* Header paginación */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "18px",
                                gap: "12px",
                                flexWrap: "wrap",
                            }}
                        >
                            <div style={{ color: "var(--emp-text-soft)" }}>
                                {loading ? "Cargando..." : `${total} favorito(s)`}
                            </div>

                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <button
                                    className="btn-text-red"
                                    disabled={!canPrev || loading}
                                    onClick={() => cargarFavoritos(page - 1)}
                                >
                                    Anterior
                                </button>

                                <span style={{ color: "var(--emp-text-soft)" }}>
                                    Página {page}
                                </span>

                                <button
                                    className="btn-text-red"
                                    disabled={!canNext || loading}
                                    onClick={() => cargarFavoritos(page + 1)}
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>

                        {/* Contenido */}
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "50px", color: "#aaa" }}>
                                Cargando favoritos...
                            </div>
                        ) : items.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "50px", color: "#aaa" }}>
                                <h3>No tienes favoritos guardados aún</h3>
                                <FaHeart size={40} color="#eee" style={{ marginTop: "20px" }} />
                                <p style={{ marginTop: "10px" }}>
                                    Dale al corazón en las vacantes que te interesen.
                                </p>
                            </div>
                        ) : (
                            <div className="favorites-grid">
                                {items.map(({ job, favorited_at }) => (
                                    <div key={job.job_id} className="fav-card">
                                        <div className="fav-header">
                                            <img
                                                src={
                                                    job.company?.logo ||
                                                    "https://ui-avatars.com/api/?name=JP&background=0D8ABC&color=fff"
                                                }
                                                alt="logo"
                                                className="fav-logo"
                                            />

                                            <div style={{ flex: 1 }}>
                                                <h3 className="fav-title">{job.title}</h3>
                                                <p className="fav-company">
                                                    {job.company?.name}
                                                </p>
                                            </div>

                                            <button
                                                className="btn-icon-danger"
                                                onClick={() =>
                                                    eliminarFavorito(job.job_id)
                                                }
                                                title="Quitar de favoritos"
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </div>

                                        <div className="fav-body">
                                            <div className="fav-info-item">
                                                <FaMapMarkerAlt />
                                                {job.city}, {job.state}, {job.country}
                                            </div>

                                            <div className="fav-info-item">
                                                <FaDollarSign />
                                                {job.min_salary && job.max_salary
                                                    ? `${job.currency ?? "MXN"} ${job.min_salary} - ${job.max_salary}`
                                                    : "Salario no especificado"}
                                            </div>

                                            <div
                                                className="fav-info-item"
                                                style={{ fontSize: "12px", color: "#aaa" }}
                                            >
                                                Publicado: {timeAgo(job.listed_time)}
                                            </div>

                                            <div
                                                className="fav-info-item"
                                                style={{ fontSize: "12px", color: "#aaa" }}
                                            >
                                                Guardado: {timeAgo(favorited_at)}
                                            </div>
                                        </div>

                                        <div
                                            className="fav-footer"
                                            style={{ textAlign: "center", marginTop: "10px" }}
                                        >
                                            <button
                                                className="btn-text-red"
                                                onClick={() => verVacante(job.job_id)}
                                            >
                                                <FaExternalLinkAlt
                                                    style={{ marginRight: "8px" }}
                                                />
                                                Ver Vacante
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
