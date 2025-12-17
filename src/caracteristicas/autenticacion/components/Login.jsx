import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../../style.css"; // Ajusta la ruta si no carga estilos
import { useNavigate, Link } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux"; // Ya no lo usaremos aquí para evitar el filtro
import api from "../../../services/api"; // ✅ IMPORTANTE: Usamos la API directa

function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [resetEmail, setResetEmail] = useState("");
    const [showReset, setShowReset] = useState(false);
    const [loading, setLoading] = useState(false); // Estado local de carga

    const navigate = useNavigate();

    // ✅ FUNCIÓN DE LOGIN DIRECTA (Sin intermediarios)
    const enviar = async (e) => {
        e.preventDefault();

        if (!form.email || !form.password) return toast.error("Completa los campos");

        setLoading(true);

        try {
            // 1. Petición directa al backend (Saltamos Redux para asegurar el token)
            // Esto nos da exactamente lo que dice tu authController.js: { token, actor }
            const response = await api.post("/auth/login", form);
            
            console.log("🔥 RESPUESTA SERVER:", response.data);

            const { token, actor } = response.data;

            // 2. Guardamos en LocalStorage (Vital para el Dashboard)
            if (token && actor) {
                localStorage.setItem("token", token);
                localStorage.setItem("user_data", JSON.stringify(actor));
                
                toast.success("Bienvenido 👋");
                
                // Pequeña pausa para asegurar guardado
                setTimeout(() => {
                    navigate("/dashboard");
                }, 100);
            } else {
                toast.error("Error: Respuesta incompleta del servidor");
            }

        } catch (error) {
            console.error("Error Login:", error);
            const msg = error.response?.data?.message || "Error al iniciar sesión";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const enviarReset = (e) => {
        e.preventDefault();
        if (!resetEmail.includes("@")) return toast.error("Ingresa un correo válido");
        toast.success("Enlace enviado ✉️");
        setShowReset(false);
        setResetEmail("");
    };

    return (
        <div className="page-center">
            <ToastContainer />

            <div className="card">
                <h2 className="card-title">Bienvenido de nuevo</h2>
                <p className="card-subtitle">Ingresa para continuar</p>

                <form onSubmit={enviar} className="login-form">
                    <input
                        type="email"
                        className="input"
                        placeholder="Correo electrónico"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />

                    <input
                        type="password"
                        className="input"
                        placeholder="Contraseña"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "12px" }}>
                    <button
                        className="text-link"
                        style={{ border: "none", background: "none", cursor: "pointer" }}
                        onClick={() => setShowReset(true)}
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </p>

                <p style={{ textAlign: "center", marginTop: "10px" }}>
                    ¿No tienes cuenta?{" "}
                    <Link className="text-link" to="/registro">
                        Crear cuenta
                    </Link>
                </p>
            </div>

            {showReset && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h3>Recuperar contraseña</h3>
                        <p style={{ color: "#555", marginBottom: "15px" }}>
                            Ingresa tu correo para enviarte un enlace.
                        </p>
                        <form onSubmit={enviarReset}>
                            <input
                                type="email"
                                className="input"
                                placeholder="Correo"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                            />
                            <button className="btn-primary" style={{ marginTop: "15px" }}>
                                Enviar enlace
                            </button>
                        </form>
                        <button
                            style={{
                                marginTop: "12px",
                                background: "none",
                                border: "none",
                                color: "var(--primary)",
                                cursor: "pointer",
                                fontWeight: "600",
                            }}
                            onClick={() => setShowReset(false)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;