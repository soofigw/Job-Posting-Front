const API_URL = "http://localhost:8000/api";

// --- 1. OBTENER EMPRESAS (Para el Inicio de Dani) ---
export const getCompanies = async (limit = 20) => {
  try {
    const res = await fetch(`${API_URL}/companies?limit=${limit}`);
    return await res.json();
  } catch (error) {
    console.error("Error cargando empresas:", error);
    return { data: [] };
  }
};

// --- 2. OBTENER VACANTES (Versión Pro para tu Dashboard) ---
export const getJobs = async (filtros = {}) => {
  try {
    // Si 'filtros' es un string (como lo usaba Dani), lo manejamos directo
    if (typeof filtros === 'string') {
        const res = await fetch(`${API_URL}/jobs${filtros}`);
        return await res.json();
    }

    // Si 'filtros' es objeto (Tu Dashboard), armamos los params
    const params = new URLSearchParams();

    if (filtros.q) params.append("q", filtros.q);
    if (filtros.city) params.append("city", filtros.city);
    
    // Modalidad
    if (filtros.remoto) params.append("work_location_type", "REMOTE");
    if (filtros.presencial) params.append("work_location_type", "ONSITE");
    if (filtros.hibrido) params.append("work_location_type", "HYBRID");
    
    // Paginación
    params.append("limit", filtros.limit || 20);
    params.append("page", filtros.page || 1);

    const response = await fetch(`${API_URL}/jobs?${params.toString()}`);
    return await response.json();
  } catch (error) {
    console.error("Error cargando vacantes:", error);
    return { data: [], docs: [] };
  }
};

// --- 3. CREAR VACANTE (Para el Reclutador) ---
export const createJob = async (payload) => {
  const res = await fetch(`${API_URL}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("Error al crear vacante");
  return res.json();
};