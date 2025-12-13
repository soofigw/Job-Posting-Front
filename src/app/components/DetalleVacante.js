
export default function DetalleVacante() {
  return (
    <div className="detalle-layout">

      {/* COLUMNA IZQUIERDA */}
      <aside className="detalle-list">
        <h3>Vacantes</h3>

        <div className="mini-card active">
          <h4>Jefe de operaciones</h4>
          <p>Empresa importante</p>
          <span>Torreón, Coahuila</span>
        </div>

        <div className="mini-card">
          <h4>Asesor bancario</h4>
          <p>Sector financiero</p>
          <span>Torreón, Coahuila</span>
        </div>
      </aside>

      {/* COLUMNA DERECHA */}
      <section className="detalle-card">
        <div className="detalle-header">
          <h1>Jefe de operaciones</h1>
          <p className="empresa">Empresa importante del sector</p>
          <p className="ubicacion">📍 Torreón, Coahuila</p>
        </div>

        <div className="detalle-actions">
          <button className="btn-postular">Postularme</button>
          <button className="btn-icon">♡</button>
          <button className="btn-icon">↗</button>
          <button className="btn-icon">⋮</button>
        </div>

        <div className="detalle-info">
          <div>💰 $19,999 MXN (Mensual)</div>
          <div>🕒 Tiempo completo</div>
          <div>📄 Contrato indefinido</div>
          <div>🏢 Presencial</div>
        </div>

        <div className="detalle-descripcion">
          <h3>Descripción</h3>
          <p>
            Buscamos líder operativo para coordinar equipos, mejorar procesos
            y asegurar el cumplimiento de objetivos estratégicos.
          </p>

          <h3>Requisitos</h3>
          <ul>
            <li>Licenciatura concluida</li>
            <li>2+ años de experiencia</li>
            <li>Liderazgo y toma de decisiones</li>
          </ul>

          <h3>Ofrecemos</h3>
          <ul>
            <li>Sueldo competitivo</li>
            <li>Prestaciones de ley</li>
            <li>Crecimiento profesional</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
