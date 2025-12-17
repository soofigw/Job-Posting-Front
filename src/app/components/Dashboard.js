import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { 
  FaSearch, FaMapMarkerAlt, FaRegBookmark, FaBriefcase, 
  FaDollarSign, FaShareAlt, FaBuilding, FaFilter, FaClock,
  FaChevronLeft, FaChevronRight, FaSortAmountDown 
} from "react-icons/fa";
import api from "../../services/api"; 
import "./Dashboard.css"; 

export default function Dashboard() {
  
  const navigate = useNavigate(); 
  const [vacantes, setVacantes] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [selectedJob, setSelectedJob] = useState(null); 
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  //FILTROS 
  const [busqueda, setBusqueda] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  
  const [salarioMin, setSalarioMin] = useState(""); 
  const [orden, setOrden] = useState("recent");     
  
  const [fechaPub, setFechaPub] = useState("");     
  

  const [filtros, setFiltros] = useState({ remoto: false, presencial: false });


  useEffect(() => {
    setPage(1); 
  }, [busqueda, ubicacion, salarioMin, orden, fechaPub, filtros]);

  
  useEffect(() => {
    const timer = setTimeout(() => { cargarDatos(); }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, ubicacion, salarioMin, orden, fechaPub, filtros, page]); 

  const cargarDatos = async () => {
    setLoading(true);
    
    // ORDENAMIENTO
    let sortField = "listed_time";
    let sortDirection = "desc";

    if (orden === "salary_desc") {
        sortField = "max_salary"; 
        sortDirection = "desc";   
    } else if (orden === "salary_asc") {
        sortField = "min_salary"; 
        sortDirection = "asc";    
    }

    const params = {
      q: busqueda,
      city: ubicacion,
      limit: 20, 
      page: page, 
      include_company: "true",
      sortBy: sortField,      
      sortDir: sortDirection  
    };

    // FILTROS API
    if (filtros.remoto) params.work_location_type = "REMOTE";
    if (filtros.presencial) params.work_location_type = "ONSITE";
    
    if (salarioMin) params.min_salary = salarioMin;
    
    if (fechaPub) {
        const diasRestar = parseInt(fechaPub); 
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - diasRestar);
        const yyyy = fecha.getFullYear();
        const mm = String(fecha.getMonth() + 1).padStart(2, '0');
        const dd = String(fecha.getDate()).padStart(2, '0');
        params.listed_from = `${yyyy}-${mm}-${dd}`;
    }

    try {
      const respuesta = await api.get("/jobs", { params });
      
      if (respuesta.data.meta) {
          setTotalPages(respuesta.data.meta.totalPages);
          setTotalJobs(respuesta.data.meta.total);
      }

      const rawList = normalizeList(respuesta.data);
      const listaLimpia = rawList.map((j) => normalizeJobCompanyFields({ ...j }));
      setVacantes(listaLimpia);
      
      if (listaLimpia.length > 0) {
         if (!selectedJob || !listaLimpia.find(j => (j._id === selectedJob._id) || (j.job_id === selectedJob.job_id))) {
             setSelectedJob(listaLimpia[0]);
         }
      } else {
         setSelectedJob(null);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => { if (page > 1) setPage(p => p - 1); };
  const handleNextPage = () => { if (page < totalPages) setPage(p => p + 1); };

  //HELPERS 
  const normalizeList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    if (payload && Array.isArray(payload.docs)) return payload.docs;
    return [];
  };

  const normalizeJobCompanyFields = (job) => {
    if (!job) return job;
    if (job.company && !job.company.logo_full_path && job.company.logo) {
        job.company.logo_full_path = job.company.logo;
    }
    if (job.company && !job.company.logo && job.company.logo_full_path) {
        job.company.logo = job.company.logo_full_path;
    }
    return job;
  };

  const formatModalidad = (t) => (!t ? "N/A" : t === 'REMOTE' ? 'Remoto' : t === 'HYBRID' ? 'Híbrido' : 'Presencial');
  const formatWorkType = (type) => type ? type.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : null;
  const formatSalario = (min, max) => {
    if (!min && !max) return null;
    const f = (n) => `$${Number(n).toLocaleString()}`;
    if (min && !max) return f(min);
    if (!min && max) return f(max);
    return `${f(min)} - ${f(max)}`;
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Reciente";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return "Hace un momento";
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    const days = Math.floor(diffInSeconds / 86400);
    if (days === 1) return "Ayer";
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString();
  };

  const getJobLogoSrc = (job) => {
    const emp = job?.company;
    if (emp?.logo_full_path) return emp.logo_full_path;
    const name = encodeURIComponent(emp?.name || "Company");
    return `https://ui-avatars.com/api/?name=${name}&background=FF5A5F&color=fff`;
  };

  const getModeClass = (mode) => {
      if (!mode) return "";
      return `dash-chip--${mode.toLowerCase()}`;
  };

  return (
    <div className="dashboard-wrapper">
      
      <div className="search-card">
        <div className="search-inputs-row">
          <div className="search-input-group">
            <FaBriefcase className="search-icon-inside" />
            <input type="text" className="input-search" placeholder="Cargo, empresa o keyword" 
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <div className="search-input-group">
            <FaMapMarkerAlt className="search-icon-inside" />
            <input type="text" className="input-search" placeholder="Ciudad o País" 
              value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />
          </div>
        </div>

        <div className="filters-bar">
          <div className="filter-group-switches">
            
            {/* SWITCH REMOTO */}
            <div className="filter-switch-item">
               <span>Remoto</span>
               <label className="switch">
                 <input 
                    type="checkbox" 
                    checked={filtros.remoto} 
                    onChange={() => setFiltros({ remoto: !filtros.remoto, presencial: false })} 
                 />
                 <span className="slider round"></span>
               </label>
            </div>

            {/* SWITCH P */}
            <div className="filter-switch-item">
               <span>Presencial</span>
               <label className="switch">
                 <input 
                    type="checkbox" 
                    checked={filtros.presencial} 
                    onChange={() => setFiltros({ presencial: !filtros.presencial, remoto: false })} 
                 />
                 <span className="slider round"></span>
               </label>
            </div>

          </div>

          <div className="filter-group-selects">
             
             {/* ORDENAMIENTO */}
             <div className="custom-select-wrapper">
                <FaSortAmountDown className="select-icon"/>
                <select className="custom-select" value={orden} onChange={(e) => setOrden(e.target.value)}>
                    <option value="recent">Más recientes</option>
                    <option value="salary_desc">Mayor salario</option>
                    <option value="salary_asc">Menor salario</option>
                </select>
             </div>

             {/* SALARIO */}
             <div className="custom-select-wrapper">
                <FaDollarSign className="select-icon"/>
                <select className="custom-select" value={salarioMin} onChange={(e) => setSalarioMin(e.target.value)}>
                    <option value="">Cualquier salario</option>
                    <option value="10000">Min $10k</option>
                    <option value="15000">Min $15k</option>
                    <option value="20000">Min $20k</option>
                    <option value="30000">Min $30k</option>
                    <option value="40000">Min $40k</option>
                    <option value="50000">Min $50k</option>
                    <option value="60000">Min $60k</option>
                    <option value="80000">Min $80k</option>
                    <option value="100000">Min $100k</option>
                    <option value="120000">Min $120k</option>
                    <option value="150000">Min $150k +</option>
                </select>
             </div>

             {/* FECHA */}
             <div className="custom-select-wrapper">
                <FaFilter className="select-icon"/>
                <select className="custom-select" value={fechaPub} onChange={(e) => setFechaPub(e.target.value)}>
                    <option value="">Cualquier fecha</option>
                    <option value="1">Últimas 24 horas</option>
                    <option value="7">Última semana</option>
                    <option value="30">Último mes</option>
                </select>
             </div>
          </div>
        </div>
      </div>

      <div className="split-layout">
        
        {/* LISTA IZQUIERDA */}
        <div className="job-list-col">
          {loading ? (
             <div style={{padding:40, textAlign:'center', color:'#888'}}>Buscando...</div>
          ) : vacantes.length === 0 ? (
             <div style={{padding:40, textAlign:'center', color:'#888'}}>No hay resultados 😢</div>
          ) : (
           <>
             <p style={{fontSize:13, color:'#64748b', marginBottom:10, fontWeight:700}}>
               {totalJobs} RESULTADOS DISPONIBLES
             </p>
             
             {vacantes.map((job) => {
                 const isSelected = selectedJob && ((selectedJob._id && selectedJob._id === job._id) || (selectedJob.job_id && selectedJob.job_id === job.job_id));
                 const salario = formatSalario(job.min_salary, job.max_salary);
                 const modalidad = formatModalidad(job.work_location_type);
                 const tipoTrabajo = formatWorkType(job.work_type); 
                 const fecha = formatTimeAgo(job.listed_time || job.createdAt);

                 return (
                  <div key={job._id || job.job_id} className={`dash-card ${isSelected ? "active" : ""}`} onClick={() => setSelectedJob(job)}>
                    <div className="dash-top">
                        <img className="dash-logo" src={getJobLogoSrc(job)} alt="logo" />
                        <div className="dash-head">
                            <h3 className="dash-title">{job.title}</h3>
                            <p className="dash-company">{job.company?.name || job.company_name}</p>
                        </div>
                    </div>
                    <div className="dash-body">
                        <p className="dash-location">
                           {job.city ? `${job.city}, ` : ''} {job.state || job.country || "Ubicación N/A"}
                        </p>
                        <div className="dash-posted-date">
                            <FaClock /> {fecha}
                        </div>
                    </div>
                    <div className="dash-footer">
                        <div className="dash-badges">
                            {job.work_location_type && <span className={`dash-chip ${getModeClass(job.work_location_type)}`}>{modalidad}</span>}
                            {tipoTrabajo && <span className="dash-chip">{tipoTrabajo}</span>}
                        </div>
                        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'5px', marginLeft:'auto'}}>
                            {salario && <span className="dash-salary">{salario}</span>}
                        </div>
                    </div>
                  </div>
                 );
             })}

             <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:'15px', marginTop:'20px', paddingBottom:'40px'}}>
                <button onClick={handlePrevPage} disabled={page === 1} className="btn-search-dashboard" style={{padding:'8px 15px', opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'default' : 'pointer'}}>
                    <FaChevronLeft />
                </button>
                <span style={{fontSize:'14px', fontWeight:600, color:'#64748b'}}>Página {page} de {totalPages}</span>
                <button onClick={handleNextPage} disabled={page >= totalPages} className="btn-search-dashboard" style={{padding:'8px 15px', opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? 'default' : 'pointer'}}>
                    <FaChevronRight />
                </button>
             </div>

           </>
          )}
        </div>

        {/* DETALLE DERECHA */}
        <div className="job-detail-col">
          {selectedJob ? (
            <div className="detail-card">
              <div className="detail-header-row">
                 <div className="header-left">
                   <h2 className="detail-title">{selectedJob.title}</h2>
                   <div style={{marginBottom:15}}>
                     <span 
                        className="detail-company-link"
                        onClick={() => navigate(`/empresa/${selectedJob.company?.company_id || selectedJob.company_id}`)}
                     >
                        {selectedJob.company?.name || selectedJob.company_name} ↗
                     </span>
                     <span style={{color:'#94a3b8', margin:'0 8px'}}>•</span>
                     <span style={{color:'#64748b'}}>{selectedJob.city ? `${selectedJob.city}, ` : ''} {selectedJob.state || selectedJob.country}</span>
                     <span style={{color:'#94a3b8', margin:'0 8px'}}>•</span>
                     <span style={{color:'#64748b', fontSize:14}}>
                        <FaClock style={{marginRight:4, position:'relative', top:1}} />
                        {formatTimeAgo(selectedJob.listed_time || selectedJob.createdAt)}
                     </span>
                   </div>
                   <div className="header-actions-row">
                      <button className="btn-apply-big">Postularme ahora</button>
                      <button className="btn-icon-circle"><FaRegBookmark /></button>
                      <button className="btn-icon-circle"><FaShareAlt /></button>
                   </div>
                 </div>
                 <img src={getJobLogoSrc(selectedJob)} alt="logo" className="detail-company-logo" />
              </div>
              <div className="detail-body">
                <div className="detail-tags-row">
                    <div className="detail-pill"><FaBriefcase/> {selectedJob.work_type?.replace('_', ' ') || "FULL TIME"}</div>
                    {formatSalario(selectedJob.min_salary, selectedJob.max_salary) && (
                        <div className="detail-pill"><FaDollarSign/> {formatSalario(selectedJob.min_salary, selectedJob.max_salary)}</div>
                    )}
                    <div className="detail-pill"><FaBuilding/> {formatModalidad(selectedJob.work_location_type)}</div>
                </div>
                <hr style={{ margin: '0 0 20px 0', borderTop: '1px solid #f1f5f9' }} />
                <h3 style={{ marginBottom: 10 }}>Descripción del empleo</h3>
                <div style={{ lineHeight: 1.8, color: '#475569', fontSize: 15, whiteSpace: 'pre-line' }}
                    dangerouslySetInnerHTML={{ __html: (selectedJob.description || "Sin descripción.").replace(/•/g, '<br/>• ') }} />
                <div style={{marginTop:30, padding:15, background:'#fff9fa', borderRadius:10, fontSize:13, color:'#d66'}}>
                  <strong>Aviso de seguridad:</strong> Nunca envíes dinero o datos bancarios.
                </div>
              </div>
            </div>
          ) : (
             <div style={{textAlign:'center', marginTop:50, color:'#aaa'}}><p>Selecciona una vacante</p></div>
          )}
        </div>
      </div>
    </div>
  );
}