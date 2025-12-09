import { useState } from "react";
import { useDispatch } from "react-redux";

import { registro } from "../../caracteristicas/autenticacion/authSlice";


function Registro() {
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const dispatch = useDispatch();

  const enviar = (e) => {
    e.preventDefault();
    dispatch(registro(form));
  };

  return (
    <form onSubmit={enviar}>
      <h2>Registro</h2>

      <input
        type="text"
        placeholder="Nombre"
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
      />

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button type="submit">Crear cuenta</button>
    </form>
  );
}

export default Registro;
