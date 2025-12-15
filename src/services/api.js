const API_BASE = "http://localhost:8000/api";

export async function getJobs(params = "") {
  const res = await fetch(`${API_BASE}/jobs${params}`);
  if (!res.ok) throw new Error("Error al cargar vacantes");
  return res.json();
}

export async function createJob(payload) {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("Error al crear vacante");
  return res.json();
}
