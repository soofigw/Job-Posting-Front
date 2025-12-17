import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    loadSession,
    loginService,
    registerService,
    logoutService,
} from "./authService";

const { actor } = loadSession();

const initialState = {
    actor: actor || null,
    loading: false,
    error: null,
};

export const loginThunk = createAsyncThunk(
    "auth/login",
    async ({ email, password }, thunkAPI) => {
        try {
            const { actor } = await loginService({ email, password });
            return actor;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message || "Error inesperado");
        }
    }
);

export const registerThunk = createAsyncThunk(
    "auth/register",
    async (payload, thunkAPI) => {
        try {
            const { actor } = await registerService(payload);
            return actor;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message || "Error inesperado");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            logoutService();
            state.actor = null;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.actor = action.payload;
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(registerThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.actor = action.payload;
            })
            .addCase(registerThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
