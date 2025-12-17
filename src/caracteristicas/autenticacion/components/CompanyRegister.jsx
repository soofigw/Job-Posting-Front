import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import "./CompanyRegister.css";

const COMPANY_SIZE_OPTIONS = [
    { label: "1 - 10", min: 1, max: 10 },
    { label: "11 - 50", min: 11, max: 50 },
    { label: "51 - 200", min: 51, max: 200 },
    { label: "201 - 500", min: 201, max: 500 },
    { label: "501 - 1000", min: 501, max: 1000 },
    { label: "1001 - 5000", min: 1001, max: 5000 },
];

function CompanyRegister() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        nombre: "",
        email: "",
        password: "",
        confirmarPassword: "",
        country: "Mexico",
        state: "",
        city: "",
        description: "",
        address: "",
        companySizeIndex: 0,
    });

    const [logoFile, setLogoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        api.get("/locations/countries")
            .then(r => setCountries(r.data))
            .catch(() => toast.error("Error al cargar países"));
    }, []);

    useEffect(() => {
        if (!form.country) return;
        api.get(`/locations/${form.country}/states`)
            .then(r => {
                setStates(r.data);
                setForm(f => ({ ...f, state: "", city: "" }));
            });
    }, [form.country]);

    useEffect(() => {
        if (!form.state) return;
        api.get(`/locations/${form.country}/${form.state}/cities`)
            .then(r => {
                setCities(r.data);
                setForm(f => ({ ...f, city: "" }));
            });
    }, [form.state]);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!["image/png", "image/jpeg"].includes(file.type)) {
            toast.error("El logo debe ser PNG o JPG");
            e.target.value = "";
            return;
        }

        setLogoFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const enviar = async (e) => {
        e.preventDefault();
        if (loading) return;

        if (form.password !== form.confirmarPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        setLoading(true);

        const size = COMPANY_SIZE_OPTIONS[form.companySizeIndex];

        const payload = {
            type: "company",
            email: form.email,
            password: form.password,
            company: {
                name: form.nombre,
                description: form.description,
                country: form.country,
                state: form.state,
                city: form.city,
                address: form.address,
                company_size_min: size.min,
                company_size_max: size.max,
            },
        };

        let res;
        try {
            res = await api.post("/auth/register", payload);
        } catch (err) {
            toast.error("Error al registrar empresa");
            setLoading(false);
            return;
        }

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("actor", JSON.stringify(res.data.actor));

        const companyId = res.data.actor.company_id;

        if (logoFile) {
            try {
                const fd = new FormData();
                fd.append("logo", logoFile);
                await api.put(`/companies/${companyId}/logo`, fd);
            } catch {
                toast.warning("Empresa creada, pero el logo no se pudo subir");
            }
        }

        toast.success("Empresa creada correctamente");
        navigate("/dashboard");
        setLoading(false);
    };

    return (
        <form onSubmit={enviar} className="company-form">

            <input className="input" placeholder="Nombre de la empresa" required
                   value={form.nombre}
                   onChange={e => setForm({ ...form, nombre: e.target.value })} />

            <input className="input" type="email" placeholder="Correo electrónico" required
                   value={form.email}
                   onChange={e => setForm({ ...form, email: e.target.value })} />

            <div className="location-grid">
                <select className="input" value={form.country}
                        onChange={e => setForm({ ...form, country: e.target.value })}>
                    {countries.map(c => <option key={c}>{c}</option>)}
                </select>

                <select className="input" required value={form.state}
                        onChange={e => setForm({ ...form, state: e.target.value })}>
                    <option value="">Estado</option>
                    {states.map(s => <option key={s}>{s}</option>)}
                </select>

                <select className="input" required value={form.city}
                        onChange={e => setForm({ ...form, city: e.target.value })}>
                    <option value="">Ciudad</option>
                    {cities.map(c => <option key={c}>{c}</option>)}
                </select>
            </div>

            <textarea className="input" rows={3} required
                      placeholder="Descripción de la empresa"
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })} />

            <input className="input" required placeholder="Dirección"
                   value={form.address}
                   onChange={e => setForm({ ...form, address: e.target.value })} />

            {/* LOGO */}
            <div className="logo-upload-section">
                <label className="logo-label">Logo de la empresa (PNG o JPG)</label>

                <div
                    className={`logo-dropzone ${previewUrl ? "has-preview" : ""}`}
                    onClick={() => fileInputRef.current.click()}
                >
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview logo" />
                    ) : (
                        <div className="placeholder">
                            <svg width="48" height="48" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <p>Seleccionar logo</p>
                        </div>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg"
                    hidden
                    onChange={handleLogoChange}
                />
            </div>

            <select className="input" value={form.companySizeIndex}
                    onChange={e => setForm({ ...form, companySizeIndex: Number(e.target.value) })}>
                {COMPANY_SIZE_OPTIONS.map((o, i) => (
                    <option key={i} value={i}>{o.label} empleados</option>
                ))}
            </select>

            <input className="input" type="password" minLength={6} required
                   placeholder="Contraseña"
                   value={form.password}
                   onChange={e => setForm({ ...form, password: e.target.value })} />

            <input className="input" type="password" minLength={6} required
                   placeholder="Confirmar contraseña"
                   value={form.confirmarPassword}
                   onChange={e => setForm({ ...form, confirmarPassword: e.target.value })} />

            <button className="btn-primary" disabled={loading}>
                {loading ? "Creando..." : "Crear cuenta"}
            </button>
        </form>
    );
}

export default CompanyRegister;
