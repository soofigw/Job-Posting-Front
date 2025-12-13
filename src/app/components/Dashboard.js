import { useState } from "react";
import { 
  FaSearch, FaMapMarkerAlt, FaRegBookmark, FaBriefcase, 
  FaDollarSign, FaClock, FaShareAlt, FaBuilding 
} from "react-icons/fa";
import "../../style.css";

export default function Dashboard() {
  
  
  // DATOS MOCK
  const vacantesData = [
    { 
      id: 1, 
      titulo: "Ingeniero en mantenimiento de software", 
      empresa: "INGENIERÍA VARFRA", 
      ubicacion: "Miguel Hidalgo, CDMX", 
      modalidad: "Presencial", 
      salario: "$25,000 MXN", 
      tipo: "Tiempo Completo", 
      fecha: "Hace 9 horas",
      logo: "https://ui-avatars.com/api/?name=V&background=0D8ABC&color=fff&size=128",
      descripcion: "Buscamos Ingeniero en Computación o carrera afín para unirse a nuestro equipo de alto rendimiento.",
      funciones: [
        "Realizar el mantenimiento preventivo y correctivo de hardware y software.",
        "Diagnosticar y solucionar problemas relacionados con el funcionamiento de los equipos.",
        "Implementar soluciones de IA en procesos industriales."
      ]
    },
    { 
      id: 2, 
      titulo: "Software Engineer .NET", 
      empresa: "FOXCONN GDL", 
      ubicacion: "San Pedro Tlaquepaque, Jal.", 
      modalidad: "Presencial", 
      salario: "$35,000 - $45,000 MXN", 
      tipo: "Tiempo Completo", 
      fecha: "Hace 14 horas",
      logo: "https://ui-avatars.com/api/?name=F&background=333&color=fff&size=128",
      descripcion: "Únete al gigante de la manufactura electrónica. Buscamos desarrolladores apasionados por C# y la automatización.",
      funciones: [
        "Desarrollo de aplicaciones de escritorio y web con .NET Core.",
        "Gestión de bases de datos SQL Server.",
        "Colaboración con equipos internacionales."
      ]
    },
    { 
      id: 3, 
      titulo: "React Frontend Developer", 
      empresa: "Tech Solutions", 
      ubicacion: "Remoto", 
      modalidad: "Remoto", 
      salario: "$40,000 MXN", 
      tipo: "Contrato", 
      fecha: "Hace 1 día",
      logo: "https://ui-avatars.com/api/?name=T&background=FF5A5F&color=fff&size=128",
      descripcion: "Startup en crecimiento busca especialista en Frontend para liderar la migración de nuestra plataforma.",
      funciones: [
        "Maquetación pixel-perfect de diseños en Figma.",
        "Consumo de APIs REST y gestión de estado con Redux.",
        "Optimización de rendimiento web."
      ]
    }
  ];

  const [selectedJob, setSelectedJob] = useState(vacantesData[0]);
  const [filtros, setFiltros] = useState({ remoto: false, presencial: true });

  return (
    <div className="dashboard-wrapper">
      
      {/* BUSQUEDA Y FILTROS*/}
      <div className="search-card">
        <div className="search-inputs-row">
          
          <div className="search-input-group">
            <FaBriefcase className="search-icon-inside" />
            <input type="text" className="input-search" placeholder="Cargo o categoría (ej. Software Engineer)" />
          </div>

          <div className="search-input-group">
            <FaMapMarkerAlt className="search-icon-inside" />
            <input type="text" className="input-search" placeholder="Lugar (Ciudad o Estado)" />
          </div>

          <button className="btn-search-dashboard">Buscar</button>
        </div>

        {/* FILTROS */}
        <div className="filters-bar">
          
          <div className="filter-switch-group">
            <span>Remoto</span>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={filtros.remoto} 
                onChange={() => setFiltros({...filtros, remoto: !filtros.remoto})} 
              />
              <span className="slider round"></span>
            </label>
            <span style={{color:'#aaa', fontWeight:'400'}}>(9)</span>
          </div>

          <div className="filter-switch-group">
            <span>Presencial</span>
             <label className="switch">
              <input 
                type="checkbox" 
                checked={filtros.presencial}
                onChange={() => setFiltros({...filtros, presencial: !filtros.presencial})}
              />
              <span className="slider round"></span>
            </label>
            <span style={{color:'#aaa', fontWeight:'400'}}>(24)</span>
          </div>

          <div style={{ flex: 1 }}></div>

          <select className="select-filter">
            <option>Jornada</option>
            <option>Tiempo Completo</option>
            <option>Medio Tiempo</option>
          </select>

           <select className="select-filter">
            <option>Salario</option>
            <option>$10k - $20k</option>
            <option>$20k - $40k</option>
          </select>

        </div>
      </div>

      {/*CONT PRINCIPAL */}
      <div className="split-layout">
        
        {/*LISTA D JOBS */}
        <div className="job-list-col">
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '5px', fontWeight:'600' }}>
            {vacantesData.length} TRABAJOS ENCONTRADOS
          </p>

          {vacantesData.map((job) => (
            <div 
              key={job.id} 
              className={`job-card-item ${selectedJob.id === job.id ? "active" : ""}`}
              onClick={() => setSelectedJob(job)}
            >
              <h3 className="job-card-title">{job.titulo}</h3>
              <p className="job-card-company">
                {job.empresa} • {job.ubicacion}
              </p>
              
              <div className="job-tags">
                <span className="tag">{job.modalidad}</span>
                <span className="tag money">{job.salario}</span>
              </div>
              
              <div style={{marginTop: '12px', fontSize:'12px', color:'#bbb', textAlign:'right'}}>
                {job.fecha}
              </div>
            </div>
          ))}
        </div>

        {/* DETALLE DEL JOB */}
        <div className="job-detail-col">
          <div className="detail-card">
            
            <div className="detail-header-row">
               <div style={{flex: 1, paddingRight:'20px'}}>
                 <h2 className="detail-title">{selectedJob.titulo}</h2>
                 <p style={{color:'var(--primary)', fontWeight:'700', fontSize:'16px', marginTop:'5px'}}>
                   {selectedJob.empresa}
                 </p>
                 <p style={{color:'#888', fontSize:'14px', marginTop:'4px'}}>
                   {selectedJob.ubicacion}
                 </p>
               </div>
               <img src={selectedJob.logo} alt="logo" className="detail-company-logo" />
            </div>

            <div className="detail-actions">
              <button className="btn-apply-big">
                Postularme ahora
              </button>
              <button className="btn-icon-circle"><FaRegBookmark /></button>
              <button className="btn-icon-circle"><FaShareAlt /></button>
            </div>

            <div className="detail-body">
              <div className="detail-info-row">
                 <div style={{display:'flex', alignItems:'center'}}><FaBriefcase/> {selectedJob.tipo}</div>
                 <div style={{display:'flex', alignItems:'center'}}><FaDollarSign/> {selectedJob.salario}</div>
                 <div style={{display:'flex', alignItems:'center'}}><FaBuilding/> {selectedJob.modalidad}</div>
              </div>

              <hr />

              <h3>Descripción del empleo</h3>
              <p>{selectedJob.descripcion}</p>
              
              <h3>Funciones a realizar</h3>
              <ul>
                {selectedJob.funciones.map((fun, idx) => (
                  <li key={idx}>{fun}</li>
                ))}
              </ul>
              
              
              <div style={{marginTop:'30px', padding:'15px', background:'#fff9fa', borderRadius:'10px', fontSize:'13px', color:'#d66'}}>
                <strong>Aviso de seguridad:</strong> Nunca envíes dinero o datos bancarios para aplicar a una vacante.
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}