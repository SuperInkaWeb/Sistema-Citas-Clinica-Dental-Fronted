import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [contrasena, setContrasena] = useState("");

    //Obtener las funciones y estados del contexto
    const {login, error, loading, isAuthenticated} = useAuth();
    const navigate = useNavigate();

    //Si ya está autenticado, redirigir a mis citas
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/mis-citas");
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, contrasena);
            //Redirigir a la página de mis citas tras el login exitoso
            navigate("/mis-citas");
        } catch (err) {
            console.error("Fallo en el login: ", err.message);
        }
    };

    return (
        <div className="login-container">
            <h2>🏥 Clínica Gallegos</h2>
            <form onSubmit={handleSubmit}>
                {/* Mostrar error si existe */}
                {error && (
                    <div className="error-message">
                        <strong>⚠️ Error:</strong> {error}
                    </div>
                )}

                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="tu.email@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="contrasena">Contraseña</label>
                    <input
                        id="contrasena"
                        type="password"
                        placeholder="Tu contraseña"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "⏳ Verificando..." : "🔓 Iniciar Sesión"}
                </button>
            </form>

            <p>
                ¿No tienes cuenta?
                <br />
                <Link to="/register">Regístrate aquí</Link>
            </p>
        </div>
    );
};

export default LoginPage;