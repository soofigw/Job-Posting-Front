import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import "./CandidateRegister.css";

function CandidateRegister() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        nombre: "",
        email: "",
        password: "",
        confirmarPassword: "",
        country: "Mexico",
        state: "",
        city: "",
        phone: "",
        headline: "",
    });

    const [cvFile, setCvFile] = useState(null);

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        api.get("/locations/countries").then(r => setCountries(r.data));
    }, []);

    useEffect(() => {
        if (!form.country) return;
        api.get(`/locations/${form.country}/states`).then(r => {
            setStates(r.data);
            setForm(f => ({ ...f, state: "", city: "" }));
        });
    }, [form.country]);

    useEffect(() => {
        if (!form.state) return;
        api.get(`/locations/${form.country}/${form.state}/cities`).then(r => {
            setCities(r.data);
            setForm(f => ({ ...f, city: "" }));
        });
    }, [form.state]);

    const handleCvChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("El CV debe ser un archivo PDF");
            e.target.value = "";
            return;
        }

        setCvFile(file);
    };

    const enviar = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmarPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        const payload = {
            type: "candidate",
            email: form.email,
            password: form.password,
            candidate: {
                full_name: form.nombre,
                contact: { phone: form.phone, email: form.email },
                country: form.country,
                state: form.state,
                city: form.city,
                headline: form.headline,
            },
        };

        try {
            const res = await api.post("/auth/register", payload);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("actor", JSON.stringify(res.data.actor));

            if (cvFile) {
                const fd = new FormData();
                fd.append("cv", cvFile);
                await api.post(`/candidates/${res.data.actor.candidate_id}/cv`, fd);
            }

            toast.success("Cuenta creada correctamente");
            navigate("/dashboard");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Error al crear cuenta");
        }
    };

    return (
        <form onSubmit={enviar} className="candidate-form">

            <input className="input" placeholder="Nombre completo" required
                   value={form.nombre}
                   onChange={e => setForm({ ...form, nombre: e.target.value })}
            />

            <input className="input" type="email" placeholder="Correo electrónico" required
                   value={form.email}
                   onChange={e => setForm({ ...form, email: e.target.value })}
            />

            <select className="input" value={form.country} required
                    onChange={e => setForm({ ...form, country: e.target.value })}
            >
                {countries.map(c => <option key={c}>{c}</option>)}
            </select>

            <select className="input" value={form.state} required
                    onChange={e => setForm({ ...form, state: e.target.value })}
            >
                <option value="">Estado</option>
                {states.map(s => <option key={s}>{s}</option>)}
            </select>

            <select className="input" value={form.city} required
                    onChange={e => setForm({ ...form, city: e.target.value })}
            >
                <option value="">Ciudad</option>
                {cities.map(c => <option key={c}>{c}</option>)}
            </select>

            <input className="input" placeholder="Teléfono" required
                   value={form.phone}
                   onChange={e => setForm({ ...form, phone: e.target.value })}
            />

            <input className="input" placeholder="Headline profesional" required
                   value={form.headline}
                   onChange={e => setForm({ ...form, headline: e.target.value })}
            />

            {/* ===== CV BONITO ===== */}
            <div className="cv-upload-section">
                <label className="cv-label">Currículum (PDF)</label>

                <div
                    className={`cv-dropzone ${cvFile ? "has-file" : ""}`}
                    onClick={() => fileInputRef.current.click()}
                >
                    {cvFile ? (
                        <div className="cv-file">
                            <svg width="40" height="40" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <span>{cvFile.name}</span>
                        </div>
                    ) : (
                        <div className="cv-placeholder">
                            <svg width="46" height="46" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 5v14" />
                                <path d="M5 12h14" />
                            </svg>
                            <p>Subir CV en PDF</p>
                        </div>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={handleCvChange}
                />
            </div>

            <input className="input" type="password" minLength={6} required
                   placeholder="Contraseña"
                   value={form.password}
                   onChange={e => setForm({ ...form, password: e.target.value })}
            />

            <input className="input" type="password" minLength={6} required
                   placeholder="Confirmar contraseña"
                   value={form.confirmarPassword}
                   onChange={e => setForm({ ...form, confirmarPassword: e.target.value })}
            />

            <button className="btn-primary" type="submit">
                Crear cuenta
            </button>
        </form>
    );
}

export default CandidateRegister;
