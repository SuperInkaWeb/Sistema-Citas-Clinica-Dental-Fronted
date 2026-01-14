import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { AuthContext } from './auth.context';

// Mover constantes fuera del componente para evitar warning de react-refresh
const API_BASE_URL = "http://localhost:8080/api/auth";


export const AuthProvider = ({children}) => {
    const navigate = useNavigate();

    const [token, setToken] = useState(localStorage.getItem("token") || null);

    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    //Funciones de sesión

    /**
     * Intenta autenticar al usuario y guarda el token y rol
     * @param {string} email
     * @param {string} contrasena
     */
    const login = async (email, contrasena) => {
        setLoading(true);
        setError(null);
        try{
            //LLama a la ruta /api/auth/login de Springboot
            const response = await axios.post(`${API_BASE_URL}/login`, {email, contrasena});
            const {token: receivedToken, email: userEmail, rol: userRol } = response.data;

            //Almacenar datos y token en Local Storage
            localStorage.setItem("token", receivedToken);
            localStorage.setItem("user", JSON.stringify({email: userEmail, rol: userRol}));

            //Actualizar estado
            setToken(receivedToken);
            setUser({email: userEmail, rol: userRol});

            //Configurar axios para enviar el token automaticamente en futuras solicitudes
            axios.defaults.headers.common["Authorization"] = `Bearer ${receivedToken}`;

        } catch (err) {
            //Manejar errores de credenciales
            const errorMessage = err.response?.data?.message || "Credenciales incorrectas o error de conexion";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    //Cierra la sesion del usuario
    const logout = () => {
        //Eliminar datos y token del almacenamiento local
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        //Limpiar estado
        setToken(null);
        setUser(null);

        //Limpiar el header de axios
        delete axios.defaults.headers.common["Authorization"];

        //Redirigir al usuario a la pagina de login
        navigate("/login");
    };

    //Funcion de registro
    const register = async(userData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/register`, userData);

            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data || "Error al registrar. Verifique los datos";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    //Objeto de contexto a proveer
    const contextData = {
      user,
      token,
        loading,
        error,
        login,
        logout,
        register,
        isAuthenticated: !!token,
        isAdmin: !!user?.rol === "ADMIN",
    };
    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};
