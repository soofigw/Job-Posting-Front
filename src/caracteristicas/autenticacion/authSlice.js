import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

const user = JSON.parse(localStorage.getItem("usuario"));

const initialState = {
  usuario: user ? user : null,
  cargando: false,
  error: null,
};

// LOGIN
export const login = createAsyncThunk("auth/login", async (datos, thunkAPI) => {
  try {
    return await authService.login(datos);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

// REGISTRO
export const registro = createAsyncThunk(
  "auth/registro",
  async (datos, thunkAPI) => {
    try {
      return await authService.registro(datos);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("usuario");
      state.usuario = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.cargando = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.cargando = false;
        state.usuario = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload;
      })
      // REGISTRO
      .addCase(registro.pending, (state) => {
        state.cargando = true;
      })
      .addCase(registro.fulfilled, (state, action) => {
        state.cargando = false;
        state.usuario = action.payload;
      })
      .addCase(registro.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
