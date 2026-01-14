import React from "react";
import {Navigate} from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Navbar from "./Navbar";

/**
 * Componente que envuelve las rutas que requieren autenticación.
 * @param {string} allowedRoles - Cadena de roles separados por coma (ej: "ADMIN,PACIENTE")
 * @param {React.Component} children - El componente de página que se desea proteger.
 */

const ProtectedRoute = ({ allowedRoles, children }) => {
    const { isAuthenticated, user, loading } = useAuth();

    //Mostrar estado de carga mientras se verifica el token
    if(loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>⏳ Cargando sesión...</div>;
    }

    //Si no esta autenticado, redirigir al login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    //Verificar la autenticación por roles
    if(allowedRoles){
        const requiredRoles = allowedRoles.split(",").map(role => role.trim());
        const userRole = user?.rol;

        if(!requiredRoles.includes(userRole)) {
            return <Navigate to="/mis-citas" replace />;
        }
    }

    return (
        <div>
            <Navbar />
            {children}
        </div>
    );
};

export default ProtectedRoute;