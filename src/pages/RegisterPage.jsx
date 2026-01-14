import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        contrasena: "",
        telefono: "",
    });
    const [successMessage, setSuccessMessage] = useState("");

    const { register, error, loading} = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            await register(formData);
            setSuccessMessage("✅ ¡Registro exitoso! Redirigiendo al login...");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            console.error("Fallo al registrar: ", err);
        }
    };

    return (
        <div className="register-container">
            <h2>📝 Crear Cuenta</h2>
            <form onSubmit={handleSubmit}>
                {/* Mostrar error si existe */}
                {error && (
                    <div className="error-message">
                        <strong>⚠️ Error:</strong> {error}
                    </div>
                )}

                {/* Mostrar mensaje de éxito */}
                {successMessage && (
                    <div style={{
                        background: "#dcfce7",
                        color: "#15803d",
                        border: "1px solid #86efac",
                        borderRadius: "8px",
                        padding: "0.75rem 1rem",
                        fontSize: "0.875rem",
                        marginBottom: "1rem",
                        animation: "slideUp 0.3s ease-out"
                    }}>
                        {successMessage}
                    </div>
                )}

                {/* Nombre */}
                <div>
                    <label htmlFor="nombre">Nombre</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        placeholder="Juan"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Apellido */}
                <div>
                    <label htmlFor="apellido">Apellido</label>
                    <input
                        type="text"
                        id="apellido"
                        name="apellido"
                        placeholder="Pérez"
                        value={formData.apellido}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="juan@ejemplo.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Contraseña */}
                <div>
                    <label htmlFor="contrasena">Contraseña</label>
                    <input
                        type="password"
                        id="contrasena"
                        name="contrasena"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.contrasena}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Teléfono */}
                <div>
                    <label htmlFor="telefono">Teléfono (9 dígitos)</label>
                    <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        placeholder="987654321"
                        value={formData.telefono}
                        onChange={handleChange}
                        maxLength="9"
                        pattern="[0-9]{9}"
                        title="Ingresa exactamente 9 números"
                    />
                    {formData.telefono && formData.telefono.length > 0 && formData.telefono.length < 9 && (
                        <small style={{color: '#f59e0b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block'}}>
                            ⚠️ El teléfono debe tener 9 dígitos ({formData.telefono.length}/9)
                        </small>
                    )}
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? '⏳ Registrando...' : '✏️ Registrarse'}
                </button>
            </form>

            <p>
                ¿Ya tienes cuenta?
                <br />
                <Link to="/login">Inicia sesión aquí</Link>
            </p>
        </div>
    );
};

export default RegisterPage;