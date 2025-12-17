import React, { useState, useRef, useEffect } from "react";
import "./VacanteCard.css";
import { toast } from "react-toastify";
import api from "../../services/api";

/* ================================ HELPERS ================================ */
function normalizeList(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
    return [];
}

function joinNonEmpty(parts, sep = ", ") {
    return parts.filter((x) => typeof x === "string" && x.trim()).join(sep);
}

function truncate(text, max = 160) {
    if (!text || typeof text !== "string") return "";
    const t = text.trim();
    return t.length <= max ? t : t.slice(0, max).trimEnd() + "…";
}

/* ================================ FORMATTERS ================================ */
function formatModalidad(m) {
    if (!m) return null;
    const map = {
        REMOTE: { label: "Remoto", cls: "jc-chip--remote" },
        HYBRID: { label: "Híbrido", cls: "jc-chip--hybrid" },
        ONSITE: { label: "Presencial", cls: "jc-chip--onsite" },
    };
    return map[m] || { label: m.replaceAll("_", " "), cls: "" };
}

function formatWorkType(w) {
    if (!w) return "";
    const map = {
        FULL_TIME: "Tiempo completo",
        PART_TIME: "Medio tiempo",
        CONTRACT: "Contrato",
        INTERNSHIP: "Prácticas",
        TEMPORARY: "Temporal",
    };
    return map[w] || w.replaceAll("_", " ");
}

function formatPayPeriod(p) {
    if (!p) return "";
    const map = {
        HOURLY: "hora",
        DAILY: "día",
        WEEKLY: "semana",
        BIWEEKLY: "quincena",
        MONTHLY: "mes",
        YEARLY: "año",
    };
    return map[p] || p.toLowerCase();
}

function formatMoney(value, currency = "USD") {
    if (value == null || Number.isNaN(Number(value))) return "";
    const amount = Number(value).toLocaleString("en-US", {
        maximumFractionDigits: 0,
    });
    return `$${amount} ${currency}`;
}

function formatSalario(min, max, currency, payPeriod) {
    const hasMin = min != null && !Number.isNaN(Number(min));
    const hasMax = max != null && !Number.isNaN(Number(max));
    if (!hasMin && !hasMax) return "";

    const suffix = payPeriod ? ` / ${formatPayPeriod(payPeriod)}` : "";

    if (hasMin && hasMax)
        return `${formatMoney(min, currency)} – ${formatMoney(max, currency)}${suffix}`;
    if (hasMin) return `${formatMoney(min, currency)}+${suffix}`;
    return `Hasta ${formatMoney(max, currency)}${suffix}`;
}

/* ================================ COMPANY HELPERS ================================ */
function getCompanyName(job, company) {
    return company?.name || job?.company?.name || job?.company_name || "";
}

function getCompanyLogo(job, company) {
    return (
        company?.logo_full_path ||
        company?.logo ||
        job?.company?.logo_full_path ||
        job?.company?.logo ||
        job?.logo_full_path ||
        ""
    );
}

function getCompanyId(job, company) {
    return company?.company_id || job?.company?.company_id || job?.company_id || null;
}

function getLogoFallback(name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name || "Company"
    )}&background=0D8ABC&color=fff`;
}

/* ================================ VACANTE CARD ================================ */
function VacanteCard({
    job,
    company,
    mode = "public",
    onClick,
    onCompanyClick,
    onViewApplicants,
    onEdit,
    onDeleted,
    showDescription = false,
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [status, setStatus] = useState(job.status); // ✅ estado local

    const menuRef = useRef(null);

    /* ✅ FIX LISTENER */
    useEffect(() => {
        const close = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
                setConfirmDelete(false);
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    if (!job) return null;

    const companyName = getCompanyName(job, company);
    const companyId = getCompanyId(job, company);
    const logoSrc = getCompanyLogo(job, company) || getLogoFallback(companyName);

    const location = joinNonEmpty([job.city, job.state, job.country]);
    const modalidad = formatModalidad(job.work_location_type);
    const tipo = formatWorkType(job.work_type);
    const salario = formatSalario(
        job.min_salary,
        job.max_salary,
        job.currency,
        job.pay_period
    );

    const isClosed = status === "CLOSED";
    const canGoCompany = Boolean(companyId && onCompanyClick);

    /* ================================ ACTIONS ================================ */
    const cambiarStatus = async (nuevoStatus, e) => {
        e.stopPropagation();
        if (loadingStatus) return;

        try {
            setLoadingStatus(true);

            if (nuevoStatus === "CLOSED") {
                await api.patch(`/jobs/${job.job_id}/close`);
                setStatus("CLOSED"); // ✅ update inmediato
                toast.success("Vacante cerrada");
            } else {
                await api.patch(`/jobs/${job.job_id}/open`);
                setStatus("OPEN");
                toast.success("Vacante reabierta");
            }

            setMenuOpen(false);
            onDeleted?.();
        } catch {
            toast.error("No se pudo actualizar el estado");
        } finally {
            setLoadingStatus(false);
        }
    };

    const confirmarEliminar = async (e) => {
        e.stopPropagation();
        try {
            await api.delete(`/jobs/${job.job_id}`);
            toast.success("Vacante eliminada");
            onDeleted?.();
        } catch {
            toast.error("No se pudo eliminar la vacante");
        }
    };

    const handleCompanyClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onCompanyClick(companyId, job);
    };

    return (
        <div className="jc-card">
            <div className="jc-top">
                <img
                    src={logoSrc}
                    alt={companyName}
                    className={`jc-logo ${canGoCompany ? "jc-company-link" : ""}`}
                    onClick={canGoCompany ? handleCompanyClick : undefined}
                    onError={(e) => (e.currentTarget.src = getLogoFallback(companyName))}
                />

                <div className="jc-head">
                    <h3 className="jc-title">{job.title}</h3>
                    <p
                        className={`jc-company ${canGoCompany ? "jc-company-link" : ""}`}
                        onClick={canGoCompany ? handleCompanyClick : undefined}
                    >
                        {companyName}
                    </p>
                </div>

                {mode === "owner" && (
                    <div
                        className="jc-actions"
                        ref={menuRef}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="jc-actions-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(v => !v);
                            }}
                        >
                            ⋮
                        </button>

                        {menuOpen && (
                        <>
                            {!confirmDelete && (
                                <div className="jc-actions-menu">
                                    <button onClick={(e) => { e.stopPropagation(); onViewApplicants?.(job); }}>
                                        👥 Ver postulantes
                                    </button>

                                    <button onClick={(e) => { e.stopPropagation(); onEdit?.(job); }}>
                                        ✏️ Editar
                                    </button>

                                    {!isClosed ? (
                                        <button onClick={(e) => cambiarStatus("CLOSED", e)}>
                                            🚫 Cerrar
                                        </button>
                                    ) : (
                                        <button onClick={(e) => cambiarStatus("OPEN", e)}>
                                            🔓 Reabrir
                                        </button>
                                    )}

                                    <button
                                        className="danger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirmDelete(true);
                                        }}
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            )}

                            {confirmDelete && (
                                <div
                                    className="jc-confirm"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <p>¿Eliminar esta vacante?</p>
                                    <div className="jc-confirm-actions">
                                        <button
                                            className="btn-danger"
                                            onClick={confirmarEliminar}
                                        >
                                            Sí, eliminar
                                        </button>
                                        <button
                                            className="btn-secondary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirmDelete(false);
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}


                        {confirmDelete && (
                            <div className="jc-confirm">
                                <p>¿Eliminar esta vacante?</p>
                                <div className="jc-confirm-actions">
                                    <button className="btn-danger" onClick={confirmarEliminar}>
                                        Sí, eliminar
                                    </button>
                                    <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}>
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div
                className="jc-main"
                onClick={!menuOpen ? onClick : undefined} // ✅ NO click si menú abierto
            >
                <div className="jc-body">
                    {location && <p className="jc-location">{location}</p>}
                    {showDescription && <p className="jc-desc">{truncate(job.description)}</p>}

                    <div className="jc-footer">
                        <div className="jc-badges">
                            {modalidad && <span className={`jc-chip ${modalidad.cls}`}>{modalidad.label}</span>}
                            {tipo && <span className="jc-chip">{tipo}</span>}
                            {mode === "owner" && isClosed && (
                                <span className="jc-chip jc-chip--closed">Cerrada</span>
                            )}
                        </div>

                        {salario && <div className="jc-salary">{salario}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ================================ GRID ================================ */
export function VacantesGrid({
    payload,
    company,
    mode = "public",
    onCardClick,
    onEdit,
    onViewApplicants,
    onRefresh,
    onCompanyClick,
    empty = null,
    showDescription = false,
}) {
    const jobs = normalizeList(payload);
    if (!jobs.length) return empty;

    return (
        <div className="jc-grid">
            {jobs.map((job) => (
                <VacanteCard
                    key={job.job_id || job._id}
                    job={job}
                    company={company}
                    mode={mode}
                    onEdit={onEdit}
                    onViewApplicants={onViewApplicants}
                    onDeleted={onRefresh}
                    onCompanyClick={onCompanyClick}
                    onClick={onCardClick ? () => onCardClick(job) : undefined}
                    showDescription={showDescription}
                />
            ))}
        </div>
    );
}

export default VacanteCard;
