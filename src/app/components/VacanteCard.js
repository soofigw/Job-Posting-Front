import React from "react";
import "./VacanteCard.css";

function normalizeList(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
}

function joinNonEmpty(parts, sep = ", ") {
    return parts.filter((x) => typeof x === "string" && x.trim()).join(sep);
}

function truncate(text, max = 160) {
    if (!text || typeof text !== "string") return "";
    const t = text.trim();
    if (t.length <= max) return t;
    return t.slice(0, max).trimEnd() + "…";
}

function formatModalidad(m) {
    if (!m) return "";
    if (m === "REMOTE") return { label: "Remoto", cls: "jc-chip--remote" };
    if (m === "HYBRID") return { label: "Híbrido", cls: "jc-chip--hybrid" };
    if (m === "ONSITE") return { label: "Presencial", cls: "jc-chip--onsite" };
    return { label: String(m).replaceAll("_", " "), cls: "" };
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
    return map[w] || String(w).replaceAll("_", " ");
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
    return map[p] || String(p).toLowerCase();
}

function formatMoney(value, currency) {
    if (value == null || value === "" || Number.isNaN(Number(value))) return "";
    const cur = currency || "USD";
    try {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: cur,
            maximumFractionDigits: 0,
        }).format(Number(value));
    } catch {
        return `$${Number(value).toLocaleString()} ${cur}`;
    }
}

function formatSalario(min, max, currency, payPeriod) {
    const hasMin = min != null && min !== "" && !Number.isNaN(Number(min));
    const hasMax = max != null && max !== "" && !Number.isNaN(Number(max));
    if (!hasMin && !hasMax) return "";

    const period = formatPayPeriod(payPeriod);
    const suffix = period ? ` / ${period}` : "";

    if (hasMin && hasMax) return `${formatMoney(min, currency)} - ${formatMoney(
        max,
        currency
    )}${suffix}`;
    if (hasMin) return `${formatMoney(min, currency)}+${suffix}`;
    return `Hasta ${formatMoney(max, currency)}${suffix}`;
}

function getCompanyName(job, companyOverride) {
    return companyOverride?.name || job?.company?.name || job?.company_name || "";
}

function getCompanyLogo(job, companyOverride) {
    return (
        companyOverride?.logo_full_path ||
        companyOverride?.logo ||
        job?.company?.logo_full_path ||
        job?.company?.logo ||
        job?.logo_full_path ||
        ""
    );
}

function getCompanyId(job, companyOverride) {
    return (
        companyOverride?.company_id ||
        job?.company?.company_id ||
        job?.company_id ||
        null
    );
}

function getLogoFallback(companyName) {
    const name = encodeURIComponent(companyName || "Company");
    return `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff`;
}

export default function VacanteCard({
                                        job,
                                        company,
                                        onClick,
                                        onCompanyClick, // ✅ NUEVO: para ir a la página de empresa
                                        className = "",
                                        showDescription = false,
                                        descriptionMaxChars = 180,
                                    }) {
    if (!job) return null;

    const companyName = getCompanyName(job, company);
    const companyId = getCompanyId(job, company);
    const logoSrc = getCompanyLogo(job, company) || getLogoFallback(companyName);

    const location = joinNonEmpty([job.city, job.state, job.country], ", ");
    const modalidad = formatModalidad(job.work_location_type);
    const tipo = formatWorkType(job.work_type);
    const salario = formatSalario(job.min_salary, job.max_salary, job.currency, job.pay_period);

    const desc = showDescription ? truncate(job.description, descriptionMaxChars) : "";
    const hasBadges = Boolean(modalidad?.label || tipo);

    const canGoCompany = Boolean(companyId && typeof onCompanyClick === "function");

    const handleCompanyClick = (e) => {
        // ✅ evita que dispare el click de la card
        e.preventDefault();
        e.stopPropagation();
        if (!canGoCompany) return;
        onCompanyClick(companyId, job);
    };

    return (
        <div
            className={`jc-card ${className}`.trim()}
            onClick={onClick}
            style={onClick ? { cursor: "pointer" } : undefined}
        >
            {/* TOP: logo + (title arriba) + (company abajo) */}
            <div className="jc-top">
                <img
                    src={logoSrc}
                    alt={companyName || "Empresa"}
                    className={`jc-logo ${canGoCompany ? "jc-company-link" : ""}`.trim()}
                    onClick={canGoCompany ? handleCompanyClick : undefined}
                    onError={(e) => {
                        e.currentTarget.src = getLogoFallback(companyName);
                    }}
                />

                <div className="jc-head">
                    {job.title && <h3 className="jc-title">{job.title}</h3>}

                    {companyName && (
                        <p
                            className={`jc-company ${canGoCompany ? "jc-company-link" : ""}`.trim()}
                            onClick={canGoCompany ? handleCompanyClick : undefined}
                            title={canGoCompany ? "Ver empresa" : undefined}
                        >
                            {companyName}
                        </p>
                    )}
                </div>
            </div>

            <div className="jc-body">
                {location && <p className="jc-location">{location}</p>}
                {desc && <p className="jc-desc">{desc}</p>}

                {(hasBadges || salario) && (
                    <div className="jc-footer">
                        {hasBadges ? (
                            <div className="jc-badges">
                                {modalidad?.label && (
                                    <span className={`jc-chip ${modalidad.cls}`.trim()}>
                    {modalidad.label}
                  </span>
                                )}
                                {tipo && <span className="jc-chip">{tipo}</span>}
                            </div>
                        ) : (
                            <span />
                        )}

                        {salario && <div className="jc-salary">{salario}</div>}
                    </div>
                )}
            </div>
        </div>
    );
}

export function VacantesGrid({
                                 payload,
                                 containerClassName = "jc-grid",
                                 onCardClick,
                                 company,
                                 onCompanyClick, // ✅ NUEVO
                                 empty = null,
                                 showDescription = false,
                             }) {
    const jobs = normalizeList(payload);
    if (!jobs.length) return empty;

    return (
        <div className={containerClassName}>
            {jobs.map((job) => (
                <VacanteCard
                    key={job.job_id || job._id}
                    job={job}
                    company={company}
                    onClick={onCardClick ? () => onCardClick(job) : undefined}
                    onCompanyClick={onCompanyClick}
                    showDescription={showDescription}
                />
            ))}
        </div>
    );
}
