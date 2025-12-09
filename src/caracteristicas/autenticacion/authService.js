import axios from "axios";

const API_URL = "http://IP-DE-YIYO:PUERTO/api/usuarios/";

// LOGIN
const login = async (datos) => {
  const res = await axios.post(API_URL + "login", datos);
  if (res.data) localStorage.setItem("usuario", JSON.stringify(res.data));
  return res.data;
};

// REGISTRO
const registro = async (datos) => {
  const res = await axios.post(API_URL + "registro", datos);
  if (res.data) localStorage.setItem("usuario", JSON.stringify(res.data));
  return res.data;
};

const authService = { login, registro };
export default authService;
