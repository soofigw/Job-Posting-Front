import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Asume que tienes un index.css
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./app/store";
import "react-toastify/dist/ReactToastify.css";
import "./style.css"; // <<-- RUTA CORRECTA (Si index.js y style.css están en /src)

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);