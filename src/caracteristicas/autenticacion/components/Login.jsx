import { useState } from "react";
import { toast } from "react-toastify";
import "../../../style.css";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../../../caracteristicas/autenticacion/authSlice";
import { ACTOR_TYPES } from "../../../caracteristicas/autenticacion/authTypes";

function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [resetEmail, setResetEmail] = useState("");
    const [showReset, setShowReset] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((s) => s.auth);

    const enviar = async (e) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            toast.error("Completa los campos");
            return;
        }

        try {
            // 👇 actor es lo que retorna el thunk
            const actor = await dispatch(loginThunk(form)).unwrap();

            // 🔀 REDIRECCIÓN SEGÚN TIPO
            if (actor.type === ACTOR_TYPES.COMPANY) {
                navigate(`/company/${actor.company_id}/dashboard`);
            } else {
                navigate("/dashboard");
            }

        } catch (err) {
            toast.error(err || "Error al iniciar sesión");
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
