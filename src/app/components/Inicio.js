import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style.css";

export default function Inicio() {
  const [empresas, setEmpresas] = useState([]);
  const [vacantes, setVacantes] = useState([]);
  const navigate = useNavigate();

  /* =========================
     Utils
     ========================= */
  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const formatModalidad = (m) => {
    if (m === "REMOTE") return "Remoto";
    if (m === "HYBRID") return "Híbrido";
    return "Presencial";
  };

  const formatSalario = (min, max, currency) => {
    if (!min || !max) return "Salario no especificado";
    return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}`;
  };

  /* =========================
     Cargar empresas destacadas
     ========================= */
  useEffect(() => {
    fetch("http://localhost:8000/api/companies?limit=20")
      .then((res) => res.json())
      .then((data) => {
        const shuffled = shuffleArray(data.data || []);
        setEmpresas(shuffled.slice(0, 6));
      })
      .catch((err) => console.error("Error cargando empresas", err));
  }, []);

  /* =========================
     Cargar vacantes recientes
     ========================= */
  useEffect(() => {
    fetch("http://localhost:8000/api/jobs?limit=20")
      .then((res) => res.json())
      .then((data) => {
        const shuffled = shuffleArray(data.data || []);
        setVacantes(shuffled.slice(0, 3));
      })
      .catch((err) => console.error("Error cargando vacantes", err));
  }, []);

  return (
    <div className="inicio-bg">

      {/* HERO */}
      <section className="hero">
        <h1>Tu próximo empleo te está esperando</h1>
        <p>
          Conecta con empresas reales y aplica a cientos de vacantes verificadas
          cada día.
        </p>
        <a href="#vacantes" className="hero-btn">
          Explorar vacantes
        </a>
      </section>

      {/* EMPRESAS DESTACADAS */}
      <section className="empresas-section">
        <h2>Empresas destacadas</h2>

        {/* FILA SUPERIOR (4) */}
        <div className="empresas-grid empresas-top">
          {empresas.slice(0, 4).map((emp) => (
            <div
              key={emp.company_id}
              className="empresa-card"
              onClick={() => navigate(`/empresa/${emp.company_id}`)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={emp.logo_full_path}
                alt={emp.name}
                className="empresa-logo"
              />
              <span>{emp.name}</span>
            </div>
          ))}
        </div>

        {/* FILA INFERIOR (2) */}
        <div className="empresas-grid empresas-bottom">
          {empresas.slice(4).map((emp) => (
            <div
              key={emp.company_id}
              className="empresa-card"
              onClick={() => navigate(`/empresa/${emp.company_id}`)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={emp.logo_full_path}
                alt={emp.name}
                className="empresa-logo"
              />
              <span>{emp.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* VACANTES RECIENTES */}
      <section id="vacantes" className="vacantes-section">
        <h2>Vacantes más recientes</h2>

        <div className="vacantes-list">
          {vacantes.map((v) => (
            <div
              key={v.job_id}
              className="vacante-card"
              onClick={() => navigate("/dashboard")}
              style={{ cursor: "pointer" }}
            >
              <h3>{v.title}</h3>

              <p>
                <strong>Empresa:</strong> {v.company?.name}
              </p>

              <span className="modalidad-badge">
                Modalidad: {formatModalidad(v.work_location_type)}
              </span>

              <p className="salario">
                Salario:{" "}
                {formatSalario(v.min_salary, v.max_salary, v.currency)}
              </p>
            </div>
          ))}
        </div>

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

      <footer className="footer">
        © 2025 Job Posting — Plataforma de empleo profesional
      </footer>
    </div>
  );
}
