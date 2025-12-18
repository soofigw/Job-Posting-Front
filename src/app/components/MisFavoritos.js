import { useEffect, useState } from "react";
import {
    FaHeart,
    FaTrashAlt,
    FaMapMarkerAlt,
    FaDollarSign,
    FaExternalLinkAlt
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../style.css";

export default function MisFavoritos() {
    const navigate = useNavigate();

    const [favoritos, setFavoritos] = useState([]);
    const [loading, setLoading] = useState(true);

    /* =========================
       LOAD FAVORITES FROM API
    ========================= */
    useEffect(() => {
        const fetchFavoritos = async () => {
            try {
                const res = await api.get("/favorites");
                setFavoritos(res.data?.data || []);
            } catch (err) {
                console.error(err);
                toast.error("Error al cargar favoritos");
            } finally {
                setLoading(false);
            }
        };

        fetchFavoritos();
    }, []);

    /* =========================
       DELETE FAVORITE
    ========================= */
    const eliminarFavorito = async (favoriteId) => {
        try {
            await api.delete(`/favorites/${favoriteId}`);
            setFavoritos(prev => prev.filter(f => f.favorite_id !== favoriteId));
            toast.info("Eliminado de favoritos");
        } catch (err) {
            console.error(err);
            toast.error("No se pudo eliminar");
        }
    };

    const getLogo = (job) => {
        if (job?.company?.logo_full_path) return job.company.logo_full_path;
        const name = encodeURIComponent(job?.company?.name || "Company");
        return `https://ui-avatars.com/api/?name=${name}&background=FF5A5F&color=fff`;
    };

    const formatSalario = (min, max) => {
        if (!min && !max) return "Salario no especificado";
        const f = (n) => `$${Number(n).toLocaleString()}`;
        if (min && max) return `${f(min)} - ${f(max)}`;
        return f(min || max);
    };

    return (
        <div className="dashboard-wrapper">
            <ToastContainer position="bottom-right" autoClose={2000} />

            <div style={{ maxWidth: 900, margin: "0 auto" }}>
                <h2
                    style={{
                        fontSize: 28,
                        fontWeight: 700,
                        marginBottom: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 12
                    }}
                >
                    Mis Favoritos <FaHeart color="var(--primary)" />
                </h2>

                <p style={{ color: "var(--emp-text-soft)", marginBottom: 30 }}>
                    Vacantes que has guardado para revisar después.
                </p>

                {loading ? (
                    <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>
                        Cargando favoritos...
                    </div>
                ) : favoritos.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 50, color: "#aaa" }}>
                        <h3>No tienes favoritos guardados</h3>
                        <FaHeart size={40} color="#eee" style={{ marginTop: 20 }} />
                    </div>
                ) : (
                    <div className="favorites-grid">
                        {favoritos.map((fav) => {
                            const job = fav.job;

                            return (
                                <div key={fav.favorite_id} className="fav-card">
                                    {/* HEADER */}
                                    <div className="fav-header">
                                        <img
                                            src={getLogo(job)}
                                            alt={job.company?.name}
                                            className="fav-logo"
                                            onError={(e) => {
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                    job.company?.name || "Company"
                                                )}&background=FF5A5F&color=fff`;
                                            }}
                                        />

                                        <div style={{ flex: 1 }}>
                                            <h3 className="fav-title">{job.title}</h3>
                                            <p className="fav-company">{job.company?.name}</p>
                                        </div>

                                        <button
                                            className="btn-icon-danger"
                                            onClick={() => eliminarFavorito(fav.favorite_id)}
                                            title="Quitar de favoritos"
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    </div>

                                    {/* BODY */}
                                    <div className="fav-body">
                                        <div className="fav-info-item">
                                            <FaMapMarkerAlt />{" "}
                                            {job.city || job.state || "Ubicación N/A"}
                                        </div>

                                        <div className="fav-info-item">
                                            <FaDollarSign />{" "}
                                            {formatSalario(job.min_salary, job.max_salary)}
                                        </div>
                                    </div>

                                    {/* FOOTER */}
                                    <div className="fav-footer" style={{ textAlign: "center" }}>
                                        <button
                                            className="btn-text-red"
                                            onClick={() =>
                                                navigate(`/dashboard?jobId=${job.job_id}`)
                                            }
                                        >
                                            <FaExternalLinkAlt style={{ marginRight: 8 }} />
                                            Ver Vacante
                                        </button>
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
