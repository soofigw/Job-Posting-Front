import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../caracteristicas/autenticacion/authSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});
