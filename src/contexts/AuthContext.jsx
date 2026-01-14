import { useState } from 'react';
// ELIMINAMOS: import axios from 'axios';
// IMPORTAMOS tu cliente configurado:
import apiClient from '../api/apiClient';
import { useNavigate } from "react-router-dom";
import { AuthContext } from './auth.context';

export const AuthProvider = ({children}) => {
    const navigate = useNavigate();

    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Funciones de sesión ---

    /**
     * Intenta autenticar al usuario y guarda el token y rol
     */
    const login = async (email, contrasena) => {
        setLoading(true);
        setError(null);
        try{
            // CAMBIO: Usamos apiClient en lugar de axios.
            // La URL ahora es relativa: "/auth/login".
            // apiClient ya tiene la base (ej: ...onrender.com/api)
            const response = await apiClient.post('/auth/login', {email, contrasena});

            const {token: receivedToken, email: userEmail, rol: userRol } = response.data;

            // Almacenar datos y token en Local Storage
            localStorage.setItem("token", receivedToken);
            localStorage.setItem("user", JSON.stringify({email: userEmail, rol: userRol}));

            // Actualizar estado
            setToken(receivedToken);
            setUser({email: userEmail, rol: userRol});

            // NOTA: No necesitamos configurar el header manualmente aquí
            // porque apiClient ya tiene un "interceptor" que lee el token del localStorage automáticamente.

        } catch (err) {
            // Manejar errores
            const errorMessage = err.response?.data?.message || "Credenciales incorrectas o error de conexion";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Cierra la sesion del usuario
    const logout = () => {
        // Eliminar datos
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Limpiar estado
        setToken(null);
        setUser(null);

        // No hace falta borrar el header manualmente, el interceptor dejará de enviarlo al no encontrar token en localStorage.

        // Redirigir
        navigate("/login");
    };

    // Funcion de registro
    const register = async(userData) => {
        setLoading(true);
        setError(null);
        try {
            // CAMBIO: Usamos apiClient
            const response = await apiClient.post('/auth/register', userData);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data || "Error al registrar. Verifique los datos";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Objeto de contexto
    const contextData = {
        user,
        token,
        loading,
        error,
        login,
        logout,
        register,
        isAuthenticated: !!token,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};