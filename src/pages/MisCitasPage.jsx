import React, { useState, useEffect, useCallback } from 'react';
import { getMisCitas, cancelarCita } from '../api/citasApi';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import './MisCitasPage.css';

const MisCitasPage = () => {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    // Función para cargar las citas
    const fetchCitas = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            console.log('Cargando citas...');
            const data = await getMisCitas();
            console.log('Citas recibidas:', data);
            console.log('¿Es array?', Array.isArray(data));
            setCitas(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error al cargar citas:', err);
            console.error('Status:', err.response?.status);
            console.error('Respuesta del servidor:', err.response?.data);

            if (err.response?.status === 401) {
                alert("Tu sesión ha expirado.");
                logout();
            } else {
                const errorMsg = err.response?.data?.message || err.response?.data || 'Error al cargar tus citas.';
                setError(errorMsg);
            }
            // Asegurar que citas es un array incluso en error
            setCitas([]);
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        fetchCitas();
    }, [fetchCitas]);

    const handleCancelar = async (citaId) => {
        if (!window.confirm("¿Estás seguro de que quieres cancelar esta cita?")) {
            return;
        }

        try {
            await cancelarCita(citaId);
            alert("Cita cancelada exitosamente.");
            fetchCitas();
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo cancelar la cita.');
        }
    };

    if (loading) {
        return (
            <div className="mis-citas-container">
                <div className="loading-state">
                    <p>⏳ Cargando tus citas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mis-citas-container">
            <div className="mis-citas-header">
                <div>
                    <h1>📅 Mis Citas Agendadas</h1>
                    <p className="subtitle">Gestiona tus citas médicas</p>
                </div>
                <button
                    className="agendar-btn"
                    onClick={() => navigate('/agendar')}
                >
                    ➕ Agendar Nueva Cita
                </button>
            </div>

            {error && (
                <div className="error-message">
                    <strong>⚠️ Error:</strong> {error}
                </div>
            )}

            {citas.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h2>No tienes citas agendadas</h2>
                    <p>¡Agenda tu primera cita ahora mismo!</p>
                    <button
                        className="agendar-btn-large"
                        onClick={() => navigate('/agendar')}
                    >
                        ➕ Agendar Cita
                    </button>
                </div>
            ) : (
                <div className="citas-grid">
                    {citas.map(cita => (
                        <div key={cita.id} className={`cita-card cita-${cita.estado.toLowerCase()}`}>
                            <div className="cita-header">
                                <span className={`cita-estado estado-${cita.estado.toLowerCase()}`}>
                                    {cita.estado}
                                </span>
                                <span className="cita-id">ID: {cita.id}</span>
                            </div>

                            <div className="cita-content">
                                <div className="cita-item">
                                    <span className="cita-label">📅 Fecha y Hora:</span>
                                    <span className="cita-value">
                                        {new Date(cita.fechaHora).toLocaleString('es-ES')}
                                    </span>
                                </div>

                                <div className="cita-item">
                                    <span className="cita-label">💼 Servicio:</span>
                                    <span className="cita-value">{cita.servicio.nombre}</span>
                                </div>

                                <div className="cita-item">
                                    <span className="cita-label">👨‍⚕️ Odontólogo:</span>
                                    <span className="cita-value">
                                        {cita.odontologo ? cita.odontologo.nombre : '⏳ Por asignar'}
                                    </span>
                                </div>
                            </div>

                            {cita.estado === 'PENDIENTE' && (
                                <button
                                    className="cancelar-btn"
                                    onClick={() => handleCancelar(cita.id)}
                                >
                                    ❌ Cancelar Cita
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MisCitasPage;