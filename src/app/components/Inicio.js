import React from "react";
import "../../style.css";

export default function Inicio() {

  // EMPRESAS MOCK (con logos)
  const empresasDestacadas = [
    { name: "Google", logo: "/logos/google.png" },
    { name: "Microsoft", logo: "/logos/microsoft.png" },
    { name: "Amazon", logo: "/logos/amazon.png" },
    { name: "Meta", logo: "/logos/meta.png" },
    { name: "Netflix", logo: "/logos/netflix.png" },
    { name: "Tesla", logo: "/logos/tesla.png" }
  ];

  // VACANTES MOCK
  const vacantesMock = [
    { puesto: "Full Stack Developer", empresa: "Google", modalidad: "Remoto", salario: "$25,000 - $40,000 MXN" },
    { puesto: "Diseñador UI/UX", empresa: "Microsoft", modalidad: "Híbrido", salario: "$20,000 - $35,000 MXN" },
    { puesto: "Data Analyst", empresa: "Amazon", modalidad: "Presencial", salario: "$22,000 - $38,000 MXN" }
  ];

  return (
    <div className="inicio-bg">

      {/* HERO */}
      <section className="hero">
        <h1>Tu próximo empleo te está esperando</h1>
        <p>Conecta con empresas reales y aplica a cientos de vacantes verificadas cada día.</p>
        <a href="#vacantes" className="hero-btn">Explorar vacantes</a>
      </section>

      {/* EMPRESAS DESTACADAS */}
      <section className="empresas-section">
        <h2>Empresas destacadas</h2>

        <div className="empresas-grid">
          {empresasDestacadas.map((emp, idx) => (
            <div key={idx} className="empresa-card">
              <img src={emp.logo} alt={emp.name} className="empresa-logo" />
              <span>{emp.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* VACANTES RECIENTES */}
      <section id="vacantes" className="vacantes-section">
        <h2>Vacantes más recientes</h2>

        <div className="vacantes-list">
          {vacantesMock.map((v, i) => (
            <div key={i} className="vacante-card">
              <h3>{v.puesto}</h3>
              <p>Empresa: {v.empresa}</p>
              <p>Modalidad: {v.modalidad}</p>
              <p>Salario: {v.salario}</p>
            </div>
          ))}
        </div>

        <a href="/vacantes" className="ver-todas-btn">Ver todas las vacantes</a>
      </section>

      <footer className="footer">
        © 2025 Job Posting — Plataforma de empleo profesional
      </footer>
    </div>
  );
}
