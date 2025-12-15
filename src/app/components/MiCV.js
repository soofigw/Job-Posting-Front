import { useState } from "react";
import { FaFilePdf, FaPen, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "../../style.css";

function MiCV() {
  
  const [archivo, setArchivo] = useState({
    name: "CV_Sofia_Alejandra_2025.pdf",
    date: "14 Dic 2025",
    size: "1.2 MB"
  });

  // cambio de archivo (Reemplazo)
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.type !== "application/pdf") {
        toast.error("Solo se permiten archivos PDF ❌");
        return;
      }

      // atualizar el estado con el nuevo archivo
      setArchivo({
        name: file.name,
        date: "Justo ahora",
        size: (file.size / 1024 / 1024).toFixed(2) + " MB"
      });
      
      toast.success("CV actualizado correctamente ✅");
    }
  };

  return (
    <div className="dashboard-wrapper">
      <ToastContainer />
      
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        
        <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "10px", color: "var(--emp-text)" }}>
          Mi CV
        </h2>
        <p style={{ color: "var(--emp-text-soft)", marginBottom: "30px" }}>
          Este es el archivo que verán las empresas cuando te postules.
        </p>

        <div className="card" style={{ width: "100%", padding: "40px", boxSizing: "border-box" }}>
          
          {/* TARJETA DEL ARCHIVO ACTUAL */}
          <div className="cv-file-card active-file">
            <div className="cv-icon-box">
              <FaFilePdf size={32} color="#e74c3c" />
            </div>
            
            <div className="cv-info">
              <h4 className="cv-name">{archivo.name}</h4>
              <span className="cv-meta">
                 <FaCheckCircle size={12} color="#27ae60" style={{marginRight:'5px'}}/>
                 Archivo activo • Subido: {archivo.date} • {archivo.size}
              </span>
            </div>
          </div>

          {/* BOTON PARA REEMPLAZAR */}
          <div style={{ marginTop: "30px", textAlign: "right" }}>
            <p style={{ fontSize: "13px", color: "#999", marginBottom: "10px", textAlign: "center" }}>
              ¿Necesitas actualizar tu información?
            </p>
            
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                <button className="btn-primary" style={{ width: "auto", padding: "12px 30px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <FaPen /> Subir nueva versión
                </button>
                
                {/* Input invisible encima del boton para capturar el click */}
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        cursor: "pointer"
                    }}
                />
            </div>
          </div>

        </div>

        {/* Tips / Nota */}
        <div style={{ marginTop: "30px", background: "#f8f9fa", padding: "20px", borderRadius: "12px", border: "1px solid #eee", display:'flex', gap:'15px' }}>
            <FaInfoCircle size={20} color="var(--primary)" style={{marginTop:'2px'}}/>
            <div>
                <h4 style={{ margin: "0 0 5px 0", fontSize: "15px", color: "var(--emp-text)" }}>Nota importante</h4>
                <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.5", margin: 0 }}>
                    Solo se permite mantener <strong>un archivo</strong> por usuario. Al subir una nueva versión, el archivo anterior será reemplazado automáticamente.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
}

export default MiCV;