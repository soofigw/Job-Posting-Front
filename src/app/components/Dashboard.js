import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; 
import { 
  FaSearch, FaMapMarkerAlt, FaRegBookmark, FaBriefcase, 
  FaDollarSign, FaShareAlt, FaBuilding, FaFilter, FaClock,
  FaChevronLeft, FaChevronRight, FaSortAmountDown, FaGlobeAmericas,
  FaSuitcase, FaChevronDown, FaCheck, FaSpinner 
} from "react-icons/fa";
import api from "../../services/api"; 
import "./Dashboard.css"; 
import { loadSession } from "../../caracteristicas/autenticacion/authService";


// --- HELPERS ---
const normalizeList = (payload) => { if (Array.isArray(payload)) return payload; if (payload && Array.isArray(payload.data)) return payload.data; return []; };
const normalizeJobCompanyFields = (job) => { if (!job) return job; if (job.company && !job.company.logo_full_path && job.company.logo) { job.company.logo_full_path = job.company.logo; } if (job.company && !job.company.logo && job.company.logo_full_path) { job.company.logo = job.company.logo_full_path; } return job; };
const formatModalidad = (t) => (!t ? "N/A" : t === 'REMOTE' ? 'Remoto' : t === 'HYBRID' ? 'Híbrido' : 'Presencial');
const formatWorkType = (type) => type ? type.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : null;
const formatSalario = (min, max) => { if (!min && !max) return null; const f = (n) => `$${Number(n).toLocaleString()}`; if (min && !max) return f(min); if (!min && max) return f(max); return `${f(min)} - ${f(max)}`; };
const formatTimeAgo = (dateString) => { if (!dateString) return "Reciente"; const date = new Date(dateString); const now = new Date(); const diffInSeconds = Math.floor((now - date) / 1000); if (diffInSeconds < 60) return "Hace un momento"; if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`; if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`; const days = Math.floor(diffInSeconds / 86400); if (days === 1) return "Ayer"; if (days < 7) return `Hace ${days} días`; return date.toLocaleDateString(); };
const getJobLogoSrc = (job) => { const emp = job?.company; if (emp?.logo_full_path) return emp.logo_full_path; const name = encodeURIComponent(emp?.name || "Company"); return `https://ui-avatars.com/api/?name=${name}&background=FF5A5F&color=fff`; };
const getModeClass = (mode) => { if (!mode) return ""; return `dash-chip--${mode.toLowerCase()}`; };

// --- CONFIG DE MENUS ---
const ORDER_OPTIONS = [
    { label: "Más recientes", value: "recent", icon: <FaClock/> },
    { label: "Mayor salario", value: "salary_desc", icon: <FaDollarSign/> },
    { label: "Menor salario", value: "salary_asc", icon: <FaDollarSign/> }
];
const WORK_TYPE_OPTIONS = [
    { label: "Cualquier tipo", value: "", icon: <FaSuitcase/> },
    { label: "Tiempo Completo", value: "FULL_TIME", icon: <FaBriefcase/> },
    { label: "Medio Tiempo", value: "PART_TIME", icon: <FaClock/> },
    { label: "Contrato", value: "CONTRACT", icon: <FaFilter/> },
    { label: "Temporal", value: "TEMPORARY", icon: <FaClock/> },
    { label: "Prácticas", value: "INTERNSHIP", icon: <FaBuilding/> }
];
const SALARY_OPTIONS = [
    { label: "Cualquier salario", value: "" },
    { label: "Min $2k", value: "2000" },
    { label: "Min $5k", value: "5000" },
    { label: "Min $10k", value: "10000" },
    { label: "Min $20k", value: "20000" },
    { label: "Min $50k", value: "50000" },
    { label: "Min $100k", value: "100000" }
];
const DATE_OPTIONS = [
    { label: "Cualquier fecha", value: "" },
    { label: "Últimas 24 horas", value: "1" },
    { label: "Última semana", value: "7" },
    { label: "Último mes", value: "30" }
];

// --- COMPONENTE DROPDOWN ---
function CustomDropdown({ icon, label, options, value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);
    const currentOption = options.find(opt => opt.value === value) || options[0];
    return (
        <div className="custom-dropdown-container" ref={dropdownRef}>
            <div className={`dropdown-trigger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    {icon && <span style={{color:'#94a3b8'}}>{icon}</span>}
                    <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'140px'}}>{currentOption.label}</span>
                </div>
                <FaChevronDown style={{fontSize:'10px', color:'#94a3b8'}} />
            </div>
            {isOpen && (
                <div className="dropdown-menu">
                    {options.map((opt, idx) => (
                        <div key={idx} className={`dropdown-item ${opt.value === value ? 'selected' : ''}`} onClick={() => { onChange(opt.value); setIsOpen(false); }}>
                            {opt.icon && opt.icon}
                            <span style={{flex:1}}>{opt.label}</span>
                            {opt.value === value && <FaCheck style={{color:'#FF5A5F', fontSize:'10px'}}/>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- DASHBOARD PRINCIPAL ---
export default function Dashboard() {
  const navigate = useNavigate();

  const { actor } = loadSession();

  useEffect(() => {
    if (actor?.type === "company") {
      navigate(`/empresa/${actor.company_id}`, { replace: true });
    }
  }, [actor, navigate]);

  // PARAMS URL
  const [searchParams] = useSearchParams();
  const urlJobId = searchParams.get("jobId"); 

  const [vacantes, setVacantes] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [selectedJob, setSelectedJob] = useState(null); 
  const [applying, setApplying] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const [busqueda, setBusqueda] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [locationParams, setLocationParams] = useState({ country: "", state: "", city: "" });

  const [salarioMin, setSalarioMin] = useState(""); 
  const [orden, setOrden] = useState("recent");     
  const [fechaPub, setFechaPub] = useState("");     
  const [tipoTrabajo, setTipoTrabajo] = useState("");     
  const [filtroTipo, setFiltroTipo] = useState(null);

  const [sugerenciasTitulos, setSugerenciasTitulos] = useState([]);
  const [sugerenciasLugares, setSugerenciasLugares] = useState([]);
  const [mostrarSugTitulos, setMostrarSugTitulos] = useState(false);
  const [mostrarSugLugares, setMostrarSugLugares] = useState(false);

  useEffect(() => {
      window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
      if (urlJobId) {
          const fetchJobById = async () => {
              try {
                  const res = await api.get(`/jobs/${urlJobId}`);
                  if (res.data) {
                      const jobLimpio = normalizeJobCompanyFields(res.data);
                      setSelectedJob(jobLimpio); // Forzamos esta selección
                  }
              } catch (err) {
                  console.error("Error deep link", err);
              }
          };
          fetchJobById();
      }
  }, [urlJobId]);

  useEffect(() => { setPage(1); }, [busqueda, ubicacion, locationParams, salarioMin, orden, fechaPub, filtroTipo, tipoTrabajo]);

  useEffect(() => {
    const timer = setTimeout(() => { cargarDatos(); }, 600);
    return () => clearTimeout(timer);
  }, [busqueda, ubicacion, locationParams, salarioMin, orden, fechaPub, filtroTipo, tipoTrabajo, page]); 

  // Autocomplete
  useEffect(() => {
    if (busqueda.length > 1) {
        const fetchTitles = async () => {
            try { const res = await api.get(`/jobs/recommendations/titles?q=${busqueda}`); setSugerenciasTitulos(res.data.suggestions || []); } catch (err) {}
        }; setTimeout(fetchTitles, 300);
    } else { setSugerenciasTitulos([]); }
  }, [busqueda]);

  useEffect(() => {
    if (ubicacion.length > 1) {
        const fetchLocs = async () => {
            try { const res = await api.get(`/locations/search?q=${ubicacion}&k=5`); setSugerenciasLugares(res.data.results || []); } catch (err) {}
        }; setTimeout(fetchLocs, 300);
    } else { setSugerenciasLugares([]); }
  }, [ubicacion]);

  // CARGA DATOS PRINCIPAL
  const cargarDatos = async () => {
    setLoading(true);
    const params = new URLSearchParams();

    if (busqueda) params.append("q", busqueda);
    
    // UBICACION
    if (locationParams.country) params.append("country", locationParams.country);
    if (locationParams.state) params.append("state", locationParams.state);
    if (locationParams.city) params.append("city", locationParams.city);
    
    if (!locationParams.country && !locationParams.state && !locationParams.city && ubicacion) {
        try {
            const res = await api.get(`/locations/search?q=${ubicacion}&k=1`);
            if (res.data.results && res.data.results.length > 0) {
                const best = res.data.results[0];
                if (best.type === 'country') params.append("country", best.country);
                else params.append("city", ubicacion);
            } else { params.append("city", ubicacion); }
        } catch (e) { params.append("city", ubicacion); }
    }

    params.append("limit", "10"); 
    params.append("page", page.toString());
    params.append("include_company", "true");

    if (orden === "salary_desc") { params.append("sortBy", "max_salary"); params.append("sortDir", "desc"); } 
    else if (orden === "salary_asc") { params.append("sortBy", "min_salary"); params.append("sortDir", "asc"); }
    else { params.append("sortBy", "listed_time"); params.append("sortDir", "desc"); }

    if (filtroTipo) params.append("work_location_type", filtroTipo);
    if (salarioMin) params.append("min_salary", salarioMin);
    if (tipoTrabajo) params.append("work_type", tipoTrabajo);

    if (fechaPub) {
        const diasRestar = parseInt(fechaPub); 
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - diasRestar);
        const yyyy = fecha.getFullYear();
        const mm = String(fecha.getMonth() + 1).padStart(2, '0');
        const dd = String(fecha.getDate()).padStart(2, '0');
        params.append("listed_from", `${yyyy}-${mm}-${dd}`);
    }

    try {
      const respuesta = await api.get(`/jobs?${params.toString()}`);
      if (respuesta.data.meta) {
          setTotalPages(respuesta.data.meta.totalPages);
          setTotalJobs(respuesta.data.meta.total);
      }
      const rawList = normalizeList(respuesta.data);
      const listaLimpia = rawList.map((j) => normalizeJobCompanyFields({ ...j }));

      setVacantes(listaLimpia);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  // SELECCION DE LA VACANTE SEGUN URL
  useEffect(() => {
      if (loading) return;

      const syncSelection = async () => {
          let jobToSelect = selectedJob;

          if (urlJobId) {
              const isAlreadySelected = selectedJob && (String(selectedJob.job_id) === String(urlJobId) || String(selectedJob._id) === String(urlJobId));
              
              if (!isAlreadySelected) {
                  const foundInList = vacantes.find(j => String(j.job_id) === String(urlJobId) || String(j._id) === String(urlJobId));
                  if (foundInList) {
                      jobToSelect = foundInList;
                  } else {
                      try {
                          const res = await api.get(`/jobs/${urlJobId}`);
                          if (res.data) jobToSelect = normalizeJobCompanyFields(res.data);
                      } catch (err) { console.error("Error fetching detail", err); }
                  }
              }
          } 
          else if (!selectedJob && vacantes.length > 0) {
              jobToSelect = vacantes[0];
          }

          if (jobToSelect) {
              setSelectedJob(jobToSelect);

              if (vacantes.length > 0) {
                  const first = vacantes[0];
                  const isFirst = (String(first.job_id) === String(jobToSelect.job_id));
                  
                  if (!isFirst) {
                      const newList = [...vacantes];
                      const idx = newList.findIndex(j => String(j.job_id) === String(jobToSelect.job_id));
                      
                      if (idx !== -1) newList.splice(idx, 1); 
                      else if (newList.length >= 10) newList.pop();
                      
                      newList.unshift(jobToSelect); 
                      setVacantes(newList);
                  }
              } else {
                  setVacantes([jobToSelect]);
              }
          }
      };

      syncSelection();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, urlJobId]); 

  // Postularse
  const handlePostularse = async () => {
      if (!selectedJob) return;
      const candidateId = 1; 
      setApplying(true);
      try {
          const response = await api.post("/applications", {
              candidate_id: candidateId, 
              job_id: selectedJob.job_id || selectedJob._id 
          });
          if (response.status === 201 || response.status === 200) {
              alert(response.data.status === 'already_exists' ? "Ya te habías postulado antes. 🤓" : "¡Postulación enviada con éxito! 🎉");
          } else { alert("Ocurrió un error inesperado."); }
      } catch (error) {
          console.error("Error al postularse:", error);
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
              alert("⚠️ Auth error: Revisa authActor en el backend.");
          } else { alert("Error de conexión."); }
      } finally { setApplying(false); }
  };

  const toggleFiltro = (tipo) => { if (filtroTipo === tipo) setFiltroTipo(null); else setFiltroTipo(tipo); };
  
  const selectUbicacion = (lugar) => {
      let texto = lugar.country;
      if (lugar.type === 'city') texto = `${lugar.city}, ${lugar.state}`;
      else if (lugar.type === 'state') texto = `${lugar.state}, ${lugar.country}`;
      setUbicacion(texto);
      setLocationParams({ country: lugar.country || "", state: lugar.state || "", city: lugar.city || "" });
      setMostrarSugLugares(false);
  };

  const selectTitulo = (valor) => { setBusqueda(valor); setMostrarSugTitulos(false); };
  const handlePrevPage = () => { if (page > 1) setPage(p => p - 1); };
  const handleNextPage = () => { if (page < totalPages) setPage(p => p + 1); };

  const normalizeList = (payload) => { if (Array.isArray(payload)) return payload; if (payload && Array.isArray(payload.data)) return payload.data; return []; };
  const normalizeJobCompanyFields = (job) => { if (!job) return job; if (job.company && !job.company.logo_full_path && job.company.logo) { job.company.logo_full_path = job.company.logo; } if (job.company && !job.company.logo && job.company.logo_full_path) { job.company.logo = job.company.logo_full_path; } return job; };
  const formatModalidad = (t) => (!t ? "N/A" : t === 'REMOTE' ? 'Remoto' : t === 'HYBRID' ? 'Híbrido' : 'Presencial');
  const formatWorkType = (type) => type ? type.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : null;
  const formatSalario = (min, max) => { if (!min && !max) return null; const f = (n) => `$${Number(n).toLocaleString()}`; if (min && !max) return f(min); if (!min && max) return f(max); return `${f(min)} - ${f(max)}`; };
  const formatTimeAgo = (dateString) => { if (!dateString) return "Reciente"; const date = new Date(dateString); const now = new Date(); const diffInSeconds = Math.floor((now - date) / 1000); if (diffInSeconds < 60) return "Hace un momento"; if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`; if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`; const days = Math.floor(diffInSeconds / 86400); if (days === 1) return "Ayer"; if (days < 7) return `Hace ${days} días`; return date.toLocaleDateString(); };
  const getJobLogoSrc = (job) => { const emp = job?.company; if (emp?.logo_full_path) return emp.logo_full_path; const name = encodeURIComponent(emp?.name || "Company"); return `https://ui-avatars.com/api/?name=${name}&background=FF5A5F&color=fff`; };
  const getModeClass = (mode) => { if (!mode) return ""; return `dash-chip--${mode.toLowerCase()}`; };

  const renderPagination = () => {
    const pages = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); } 
    else {
        if (page <= 4) { pages.push(1, 2, 3, 4, 5, '...', totalPages); } 
        else if (page >= totalPages - 3) { pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages); } 
        else { pages.push(1, '...', page - 1, page, page + 1, '...', totalPages); }
    }
    return pages.map((p, index) => {
        if (p === '...') return <span key={`dots-${index}`} className="page-dots">...</span>;
        return <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>;
    });
  };

  return (
    <div className="dashboard-wrapper">
      <div className="search-card">
        <div className="search-inputs-row">
          <div className="search-input-group autocomplete-container" onBlur={() => setTimeout(() => setMostrarSugTitulos(false), 200)}>
            <FaBriefcase className="search-icon-inside" />
            <input type="text" className="input-search" placeholder="Cargo, empresa o keyword" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setMostrarSugTitulos(true); }} onFocus={() => setMostrarSugTitulos(true)} />
            {mostrarSugTitulos && sugerenciasTitulos.length > 0 && (
                <ul className="suggestions-list">
                    {sugerenciasTitulos.map((item, idx) => (
                        <li key={idx} className="suggestion-item" onClick={() => selectTitulo(item)}>
                            <FaSearch className="suggestion-icon"/> <span className="suggestion-text">{item}</span>
                        </li>
                    ))}
                </ul>
            )}
          </div>
          <div className="search-input-group autocomplete-container" onBlur={() => setTimeout(() => setMostrarSugLugares(false), 200)}>
            <FaMapMarkerAlt className="search-icon-inside" />
            <input type="text" className="input-search" placeholder="Ciudad o País" value={ubicacion} onChange={(e) => { setUbicacion(e.target.value); setLocationParams({}); setMostrarSugLugares(true); }} onFocus={() => setMostrarSugLugares(true)} />
            {mostrarSugLugares && sugerenciasLugares.length > 0 && (
                <ul className="suggestions-list">
                    {sugerenciasLugares.map((lugar, idx) => (
                        <li key={idx} className="suggestion-item" onClick={() => selectUbicacion(lugar)}>
                            <FaGlobeAmericas className="suggestion-icon"/> 
                            <span className="suggestion-text">{lugar.type === 'city' ? `${lugar.city}, ${lugar.state}` : lugar.country}</span>
                            <span className="suggestion-badge">{lugar.type}</span>
                        </li>
                    ))}
                </ul>
            )}
          </div>
        </div>

        <div className="filters-bar">
          <div className="filter-group-switches">
            <div className="filter-switch-item"><span>Remoto</span><label className="switch"><input type="checkbox" checked={filtroTipo === 'REMOTE'} onChange={() => toggleFiltro('REMOTE')} /><span className="slider round"></span></label></div>
            <div className="filter-switch-item"><span>Híbrido</span><label className="switch"><input type="checkbox" checked={filtroTipo === 'HYBRID'} onChange={() => toggleFiltro('HYBRID')} /><span className="slider round"></span></label></div>
            <div className="filter-switch-item"><span>Presencial</span><label className="switch"><input type="checkbox" checked={filtroTipo === 'ONSITE'} onChange={() => toggleFiltro('ONSITE')} /><span className="slider round"></span></label></div>
          </div>
          <div className="filter-group-selects">
             <CustomDropdown icon={<FaSortAmountDown />} options={ORDER_OPTIONS} value={orden} onChange={setOrden} />
             <CustomDropdown icon={<FaSuitcase />} options={WORK_TYPE_OPTIONS} value={tipoTrabajo} onChange={setTipoTrabajo} />
             <CustomDropdown icon={<FaDollarSign />} options={SALARY_OPTIONS} value={salarioMin} onChange={setSalarioMin} />
             <CustomDropdown icon={<FaFilter />} options={DATE_OPTIONS} value={fechaPub} onChange={setFechaPub} />
          </div>
        </div>
      </div>

      <div className="split-layout">
        <div className="job-list-col">
          {loading ? ( <div style={{padding:40, textAlign:'center', color:'#888'}}>Buscando...</div> ) : vacantes.length === 0 ? ( <div style={{padding:40, textAlign:'center', color:'#888'}}>No hay resultados 😢</div> ) : (
           <>
             <p style={{fontSize:13, color:'#64748b', marginBottom:10, fontWeight:700}}>{totalJobs} RESULTADOS DISPONIBLES</p>
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
                        <div className="dash-head"><h3 className="dash-title">{job.title}</h3><p className="dash-company">{job.company?.name || job.company_name}</p></div>
                    </div>
                    <div className="dash-body"><p className="dash-location">{job.city ? `${job.city}, ` : ''} {job.state || job.country || "Ubicación N/A"}</p><div className="dash-posted-date"><FaClock /> {fecha}</div></div>
                    <div className="dash-footer">
                        <div className="dash-badges">{job.work_location_type && <span className={`dash-chip ${getModeClass(job.work_location_type)}`}>{modalidad}</span>}{tipoTrabajo && <span className="dash-chip">{tipoTrabajo}</span>}</div>
                        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'5px', marginLeft:'auto'}}>{salario && <span className="dash-salary">{salario}</span>}</div>
                    </div>
                  </div>
                 );
             })}
             <div className="pagination-container">
                <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><FaChevronLeft /></button>{renderPagination()}<button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><FaChevronRight /></button>
             </div>
           </>
          )}
        </div>

        <div className="job-detail-col">
          {selectedJob ? (
            <div className="detail-card">
              <div className="detail-header-row">
                 <div className="header-left">
                   <h2 className="detail-title">{selectedJob.title}</h2>
                   <div style={{marginBottom:15}}>
                     <span className="detail-company-link" onClick={() => navigate(`/empresa/${selectedJob.company?.company_id || selectedJob.company_id}`)}>{selectedJob.company?.name || selectedJob.company_name} ↗</span>
                     <span style={{color:'#94a3b8', margin:'0 8px'}}>•</span>
                     <span style={{color:'#64748b'}}>{selectedJob.city ? `${selectedJob.city}, ` : ''} {selectedJob.state || selectedJob.country}</span>
                     <span style={{color:'#94a3b8', margin:'0 8px'}}>•</span>
                     <span style={{color:'#64748b', fontSize:14}}><FaClock style={{marginRight:4, position:'relative', top:1}} />{formatTimeAgo(selectedJob.listed_time || selectedJob.createdAt)}</span>
                   </div>
                   <div className="header-actions-row">
                        <button 
                            className="btn-apply-big" 
                            onClick={handlePostularse}
                            disabled={applying}
                            style={{ opacity: applying ? 0.7 : 1, cursor: applying ? 'not-allowed' : 'pointer' }}
                        >
                            {applying ? <><FaSpinner className="fa-spin" style={{marginRight:8}}/> Enviando...</> : "Postularme ahora"}
                        </button>
                        <button className="btn-icon-circle"><FaRegBookmark /></button>
                        <button className="btn-icon-circle"><FaShareAlt /></button>
                   </div>
                 </div>
                 <img src={getJobLogoSrc(selectedJob)} alt="logo" className="detail-company-logo" />
              </div>
              <div className="detail-body">
                <div className="detail-tags-row">
                    <div className="detail-pill"><FaBriefcase/> {selectedJob.work_type?.replace('_', ' ') || "FULL TIME"}</div>
                    {formatSalario(selectedJob.min_salary, selectedJob.max_salary) && (<div className="detail-pill"><FaDollarSign/> {formatSalario(selectedJob.min_salary, selectedJob.max_salary)}</div>)}
                    <div className="detail-pill"><FaBuilding/> {formatModalidad(selectedJob.work_location_type)}</div>
                </div>
                <hr style={{ margin: '0 0 20px 0', borderTop: '1px solid #f1f5f9' }} />
                <h3 style={{ marginBottom: 10 }}>Descripción del empleo</h3>
                <div style={{ lineHeight: 1.8, color: '#475569', fontSize: 15, whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: (selectedJob.description || "Sin descripción.").replace(/•/g, '<br/>• ') }} />
                <div style={{marginTop:30, padding:15, background:'#fff9fa', borderRadius:10, fontSize:13, color:'#d66'}}><strong>Aviso de seguridad:</strong> Nunca envíes dinero o datos bancarios.</div>
              </div>
            </div>
          ) : ( <div style={{textAlign:'center', marginTop:50, color:'#aaa'}}><p>Selecciona una vacante</p></div> )}
        </div>
      </div>
    </div>
  );
}