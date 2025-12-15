import { useState, useEffect } from "react";
import { 
  FaSearch, FaMapMarkerAlt, FaRegBookmark, FaBriefcase, 
  FaDollarSign, FaShareAlt, FaBuilding 
} from "react-icons/fa";
import { getJobs } from "../services/api"; 
import "../../style.css";

const SERVER_URL = "http://localhost:8000";

export default function Dashboard() {
  
  const [vacantes, setVacantes] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [selectedJob, setSelectedJob] = useState(null); 
  
  const [busqueda, setBusqueda] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [filtros, setFiltros] = useState({ remoto: false, presencial: false });

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]); 

  const cargarDatos = async () => {
    setLoading(true);
    const filtrosAPI = {
      q: busqueda,
      city: ubicacion,
      remoto: filtros.remoto,
      presencial: filtros.presencial,
      limit: 50 
    };

    try {
      const respuesta = await getJobs(filtrosAPI);
      const lista = respuesta.data || respuesta.docs || [];
      setVacantes(lista);
      if (lista.length > 0) setSelectedJob(lista[0]);
      else setSelectedJob(null);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => { cargarDatos(); };

  // --- HELPERS ---
  const formatModalidad = (tipo) => {
    if (!tipo) return "N/A";
    if (tipo === 'REMOTE') return 'Remoto';
    if (tipo === 'HYBRID') return 'Híbrido';
    if (tipo === 'ONSITE') return 'Presencial';
    return tipo; 
  };

  const formatSalario = (min, max) => {
    if (!min && !max) return "No especificado";
    if (min && !max) return `$${Number(min).toLocaleString()}`;
    if (!min && max) return `$${Number(max).toLocaleString()}`;
    return `$${Number(min).toLocaleString()} - $${Number(max).toLocaleString()}`;
  };

  const getJobLogo = (job) => {
    if (!job) return "";
    let logoPath = job.company?.logo_full_path || job.logo_url;
    
    if (!logoPath && (job.company_id || job.company?.company_id)) {
        logoPath = `${job.company_id || job.company?.company_id}.png`;
    }

    const companyName = job.company?.name || job.company_name || "Empresa";
    const avatarBackup = `https://ui-avatars.com/api/?name=${companyName}&background=FF5A5F&color=fff&size=128`;

    if (!logoPath) return avatarBackup;

    logoPath = logoPath.replace(/\\/g, "/");
    if (logoPath.startsWith("http")) return logoPath;

    const partes = logoPath.split(/[/\\]/); 
    let nombreArchivo = partes[partes.length - 1];
    
    if (!nombreArchivo.endsWith(".png") && !nombreArchivo.includes(".")) {
        nombreArchivo = `${nombreArchivo}.png`;
    } else if (nombreArchivo.endsWith(".jpg") || nombreArchivo.endsWith(".jpeg")) {
        nombreArchivo = nombreArchivo.replace(/\.(jpg|jpeg)$/, ".png");
    }

    return `${SERVER_URL}/company_logos/processed/${nombreArchivo}`;
  };

  return (
    <div className="dashboard-wrapper">
      
      {/* BARRA DE BÚSQUEDA */}
      <div className="search-card">
        <div className="search-inputs-row">
          <div className="search-input-group">
            <FaBriefcase className="search-icon-inside" />
            <input type="text" className="input-search" placeholder="Cargo o keyword" 
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
          <div className="search-input-group">
            <FaMapMarkerAlt className="search-icon-inside" />
            <input type="text" className="input-search" placeholder="Ciudad" 
              value={ubicacion} onChange={(e) => setUbicacion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
          <button className="btn-search-dashboard" onClick={handleSearch}>Buscar</button>
        </div>

        <div className="filters-bar">
          <div className="filter-switch-group">
            <span>Remoto</span>
            <label className="switch">
              <input type="checkbox" checked={filtros.remoto} onChange={() => setFiltros({...filtros, remoto: !filtros.remoto})} />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="filter-switch-group">
            <span>Presencial</span>
             <label className="switch">
              <input type="checkbox" checked={filtros.presencial} onChange={() => setFiltros({...filtros, presencial: !filtros.presencial})} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="split-layout">
        
        {/* LISTA (Izquierda) */}
        <div className="job-list-col">
          {loading ? (
             <p style={{padding:'20px', textAlign:'center'}}>Cargando vacantes...</p>
          ) : vacantes.length === 0 ? (
             <div style={{padding:'20px', textAlign:'center', color:'#888'}}>
                <p>No hay resultados 😢</p>
             </div>
          ) : (
            <>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '5px', fontWeight:'600' }}>
                {vacantes.length} RESULTADOS
              </p>
              {vacantes.map((job) => {
                 // Lógica segura para saber si es el activo
                 const isSelected = selectedJob && (
                    (selectedJob._id && selectedJob._id === job._id) || 
                    (selectedJob.job_id && selectedJob.job_id === job.job_id)
                 );

                 return (
                  <div 
                    key={job._id || job.job_id} 
                    className={`job-card-item ${isSelected ? "active" : ""}`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <h3 className="job-card-title">{job.title}</h3>
                    <p className="job-card-company">
                      {job.company?.name || job.company_name} • {job.city || job.location?.city || "N/A"}
                    </p>
                    <div className="job-tags">
                      <span className="tag">{formatModalidad(job.work_location_type)}</span>
                      {(job.min_salary || job.max_salary) && (
                          <span className="tag money">{formatSalario(job.min_salary, job.max_salary)}</span>
                      )}
                    </div>
                    <div style={{marginTop: '12px', fontSize:'12px', color:'#bbb', textAlign:'right'}}>
                      {job.listed_time ? new Date(job.listed_time).toLocaleDateString() : "Reciente"}
                    </div>
                  </div>
                 );
              })}
            </>
          )}
        </div>

        {/* DETALLE (Derecha) */}
        <div className="job-detail-col">
          {selectedJob ? (
            <div className="detail-card">
              
              {/* HEADER FIJO: Título, Empresa, Logo y Botones */}
              <div className="detail-header-row">
                 <div className="header-left">
                   <h2 className="detail-title">{selectedJob.title}</h2>
                   <div style={{marginBottom: '15px'}}>
                     <span style={{color:'var(--primary)', fontWeight:'700', fontSize:'16px'}}>
                        {selectedJob.company?.name || selectedJob.company_name}
                     </span>
                     <span style={{color:'#94a3b8', margin: '0 8px'}}>•</span>
                     <span style={{color:'#64748b'}}>
                        {selectedJob.city ? `${selectedJob.city}, ` : ''} {selectedJob.state || selectedJob.country}
                     </span>
                   </div>

                   <div className="header-actions-row">
                      <button className="btn-apply-big">Postularme ahora</button>
                      <button className="btn-icon-circle"><FaRegBookmark /></button>
                      <button className="btn-icon-circle"><FaShareAlt /></button>
                   </div>
                 </div>

                 <img 
                    src={getJobLogo(selectedJob)} 
                    alt="logo" 
                    className="detail-company-logo" 
                    onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = `https://ui-avatars.com/api/?name=${selectedJob.company?.name || 'E'}&background=FF5A5F&color=fff&size=128`; 
                    }}
                 />
              </div>

              {/* BODY: Info, Divider, Descripción */}
              <div className="detail-body">
                
                {/* 1. INFO ROW (Sin margin-top inline para que el CSS controle la subida) */}
                <div className="detail-tags-row">
                    <div className="detail-pill">
                        <FaBriefcase/> {selectedJob.work_type?.replace('_', ' ') || "FULL TIME"}
                    </div>
                    <div className="detail-pill">
                        <FaDollarSign/> {formatSalario(selectedJob.min_salary, selectedJob.max_salary)}
                    </div>
                    <div className="detail-pill">
                        <FaBuilding/> {formatModalidad(selectedJob.work_location_type)}
                    </div>
                </div>

                {/* 2. LÍNEA DIVISORIA */}
                <hr style={{ margin: '0 0 20px 0', borderTop: '1px solid #f1f5f9' }} />

                {/* 3. DESCRIPCIÓN */}
                <h3 style={{ marginBottom: '10px' }}>Descripción del empleo</h3>
                <div 
                    style={{ 
                        lineHeight: '1.8', 
                        color: '#475569',
                        fontSize: '15px',
                        whiteSpace: 'pre-line' 
                    }}
                    dangerouslySetInnerHTML={{ 
                        __html: (selectedJob.description || "Sin descripción.")
                                .replace(/•/g, '<br/>• ') 
                    }} 
                />
                
                <div style={{marginTop:'30px', padding:'15px', background:'#fff9fa', borderRadius:'10px', fontSize:'13px', color:'#d66'}}>
                  <strong>Aviso de seguridad:</strong> Nunca envíes dinero o datos bancarios.
                </div>
              </div>
            </div>
          ) : (
             <div style={{textAlign:'center', marginTop:'50px', color:'#aaa'}}>Selecciona una vacante</div>
          )}
        </div>

      </div>
    </div>
  );
}