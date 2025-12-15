import { useState } from "react";
import { FaHeart, FaTrashAlt, FaMapMarkerAlt, FaBriefcase, FaDollarSign, FaExternalLinkAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "../../style.css";

export default function MisFavoritos() {
  
  // DATOS MOCK: Vacantes guardadas
  const [favoritos, setFavoritos] = useState([
    {
      id: 1,
      titulo: "Desarrollador Full Stack Jr.",
      empresa: "Softtek",
      ubicacion: "Ciudad de México (Híbrido)",
      salario: "$22,000 - $25,000",
      logo: "https://ui-avatars.com/api/?name=S&background=0D8ABC&color=fff",
      publicado: "Hace 2 días"
    },
    {
      id: 2,
      titulo: "Community Manager",
      empresa: "Agencia Creativa Menta",
      ubicacion: "Remoto",
      salario: "$15,000 - $18,000",
      logo: "https://ui-avatars.com/api/?name=M&background=2ecc71&color=fff",
      publicado: "Hace 5 horas"
    },
    {
      id: 3,
      titulo: "Arquitecto de Software",
      empresa: "BBVA Bancomer",
      ubicacion: "Torre BBVA, CDMX",
      salario: "$60,000 - $75,000",
      logo: "https://ui-avatars.com/api/?name=B&background=004481&color=fff",
      publicado: "Hace 1 semana"
    }
  ]);

  const eliminarFavorito = (id) => {
    const nuevosFavoritos = favoritos.filter(fav => fav.id !== id);
    setFavoritos(nuevosFavoritos);
    toast.info("Eliminado de favoritos");
  };

  return (
    <div className="dashboard-wrapper">
      <ToastContainer position="bottom-right" autoClose={2000} />
      
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        <h2 style={{ 
            fontSize: "28px", 
            fontWeight: "700", 
            marginBottom: "10px", 
            color: "var(--emp-text)",
            display: "flex",        
            alignItems: "center",   
            gap: "12px"             
        }}>
          Mis Favoritos 
          <FaHeart style={{ color: 'var(--primary)' }} size={26} /> 
        </h2>

        <p style={{ color: "var(--emp-text-soft)", marginBottom: "30px" }}>
          Vacantes que has guardado para revisar después.
        </p>

        {favoritos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#aaa" }}>
            <h3>No tienes favoritos guardados aún</h3>
             {/* También cambié el emoji aquí abajo por el icono */}
             <FaHeart size={40} color="#eee" style={{ marginTop: '20px' }} />
            <p style={{marginTop:'10px'}}>Dale al corazón en las vacantes que te interesen.</p>
          </div>
        ) : (
          <div className="favorites-grid">
            {favoritos.map((fav) => (
              <div key={fav.id} className="fav-card">
                
                <div className="fav-header">
                    <img src={fav.logo} alt="logo" className="fav-logo" />
                    <div style={{flex: 1}}>
                        <h3 className="fav-title">{fav.titulo}</h3>
                        <p className="fav-company">{fav.empresa}</p>
                    </div>
                    <button 
                        className="btn-icon-danger" 
                        onClick={() => eliminarFavorito(fav.id)}
                        title="Quitar de favoritos"
                    >
                        <FaTrashAlt />
                    </button>
                </div>

                <div className="fav-body">
                    <div className="fav-info-item"><FaMapMarkerAlt /> {fav.ubicacion}</div>
                    <div className="fav-info-item"><FaDollarSign /> {fav.salario}</div>
                    <div className="fav-info-item" style={{fontSize:'12px', marginTop:'5px', color:'#aaa'}}>
                        Publicado: {fav.publicado}
                    </div>
                </div>

                <div className="fav-footer">
                    <button className="btn-outline-primary" style={{width:'100%', justifyContent:'center'}}>
                        <FaExternalLinkAlt style={{marginRight:'8px'}}/> Ver Vacante
                    </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}