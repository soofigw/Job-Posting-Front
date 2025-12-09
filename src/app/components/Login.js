import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../caracteristicas/autenticacion/authSlice";


function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();

  const enviar = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <form onSubmit={enviar}>
      <h2>Iniciar sesión</h2>
      <input
        type="email"
        placeholder="email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button type="submit">Entrar</button>
    </form>
  );
}

export default Login;
