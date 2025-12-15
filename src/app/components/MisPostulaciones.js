import { useState } from "react";
import { FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaEye, FaClock, FaTimesCircle, FaEllipsisV } from "react-icons/fa";
import "../../style.css";

export default function MisPostulaciones() {
  
  // DATOS MOCK: Simulamos las postulaciones del usuario
  const postulaciones = [
    {
      id: 1,
      puesto: "Frontend Developer React",
      empresa: "Tech Solutions",
      ubicacion: "Remoto",
      fecha: "14 Dic 2025",
      estado: "enviada", 
      logo: "https://ui-avatars.com/api/?name=T&background=FF5A5F&color=fff"
    },
    {
      id: 2,
      puesto: "Analista de Datos Jr.",
      empresa: "Banco Futuro",
      ubicacion: "Monterrey, NL",
      fecha: "10 Dic 2025",
      estado: "proceso",
      logo: "https://ui-avatars.com/api/?name=B&background=0D8ABC&color=fff"
    },
    {
      id: 3,
      puesto: "Diseñador UX/UI",
      empresa: "Creative Studio",
      ubicacion: "Guadalajara, Jal",
      fecha: "05 Dic 2025",
      estado: "enviada",
      logo: "https://ui-avatars.com/api/?name=C&background=333&color=fff"
    },
    {
      id: 4,
      puesto: "Soporte Técnico Nivel 1",
      empresa: "CompuWorld",
      ubicacion: "Torreón, Coah",
      fecha: "01 Dic 2025",
      estado: "enviada",
      logo: "https://ui-avatars.com/api/?name=C&background=f39c12&color=fff"
    }
  ];

  // renderiza el badge de estado segun el caso
  const renderStatus = (estado) => {
    switch (estado) {
      case "enviada":
        return <span className="status-badge sent"><FaClock /> Enviada</span>;
      case "proceso":
        return <span className="status-badge process"><FaCheckCircle /> En proceso</span>;
      case "finalista":
        return <span className="status-badge finalist">🌟 Finalista</span>;
      case "descartado":
        return <span className="status-badge rejected"><FaTimesCircle /> Descartado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "10px", color: "var(--emp-text)" }}>
          Mis Postulaciones
        </h2>
        <p style={{ color: "var(--emp-text-soft)", marginBottom: "30px" }}>
          Aquí puedes ver el seguimiento en tiempo real de tus aplicaciones.
        </p>

        <div className="applications-list">
          {postulaciones.map((app) => (
            <div key={app.id} className="app-card">
              
              {/* IZQUIERDA: LOGO E INFO */}
              <div className="app-main-info">
                <img src={app.logo} alt="logo" className="app-logo" />
                <div>
                  <h3 className="app-title">{app.puesto}</h3>
                  <p className="app-company">{app.empresa}</p>
                  <div className="app-meta">
                    <span><FaMapMarkerAlt /> {app.ubicacion}</span>
                    <span><FaCalendarAlt /> Aplicado el: {app.fecha}</span>
                  </div>
                </div>
              </div>

              {/* DERECHA: ESTADO Y ACCIONES */}
              <div className="app-status-col">
                <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                    {renderStatus(app.estado)}
                </div>
                
                {/* (ver detalle) */}
                <div style={{ textAlign: 'right' }}>
                    <button className="btn-text-red">Ver vacante</button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}