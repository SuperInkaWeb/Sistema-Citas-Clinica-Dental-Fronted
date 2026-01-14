import React, { useState, useEffect } from 'react';
import { getServicios, createCita } from '../api/citasApi';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import './AgendarCitaPage.css';

const AgendarCitaPage = () => {
    const [servicios, setServicios] = useState([]);
    const [loadingServicios, setLoadingServicios] = useState(true);
    const [formData, setFormData] = useState({ idServicio: '', fechaHora: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServicios = async () => {
            setLoadingServicios(true);
            try {
                console.log('Cargando servicios...');
                const data = await getServicios();
                console.log('Servicios recibidos:', data);
                // Asegurar que data es siempre un array
                setServicios(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error al cargar servicios:', err);
                if (err.response && err.response.status === 401) {
                    alert("Tu sesion ha expirado. Por favor, inicia sesión de nuevo.");
                    logout();
                } else {
                    setError("Error al cargar los servicios");
                }
                // Asegurar que servicios es un array incluso en error
                setServicios([]);
            } finally {
                setLoadingServicios(false);
            }
        };
        fetchServicios();
    }, [logout]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validar que el servicio esté seleccionado
            if (!formData.idServicio) {
                setError('Por favor selecciona un servicio');
                setLoading(false);
                return;
            }

            // Validar que la fecha esté seleccionada
            if (!formData.fechaHora) {
                setError('Por favor selecciona una fecha y hora');
                setLoading(false);
                return;
            }

            const citaData = {
                idServicio: parseInt(formData.idServicio),
                fechaHora: formData.fechaHora.replace('T', ' '), // Formato: YYYY-MM-DD HH:mm
            };

            console.log('Enviando cita:', citaData);

            await createCita(citaData);
            setSuccess('✅ Cita agendada exitosamente. Revisa "Mis Citas" para confirmarla.');
            setFormData({ idServicio: '', fechaHora: '' });

            // Redirigir a mis citas después de 2 segundos
            setTimeout(() => {
                navigate('/mis-citas');
            }, 2000);

        } catch (err) {
            console.error('Error al agendar:', err);
            console.error('Respuesta del servidor:', err.response?.data);
            setError(err.response?.data?.message || err.response?.data || 'Error al agendar la cita. Verifica los datos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="agendar-container">
            <div className="agendar-header">
                <div>
                    <h1>📅 Agendar Nueva Cita</h1>
                    <p className="subtitle">Completa el formulario para reservar tu cita</p>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <strong>⚠️ Error:</strong> {error}
                </div>
            )}

            {success && (
                <div className="success-message">
                    {success}
                </div>
            )}

            <div className="agendar-form-card">
                <form onSubmit={handleSubmit}>
                    {/* Selector de Servicio */}
                    <div className="form-group">
                        <label htmlFor="idServicio">💼 Selecciona el Servicio</label>
                        <select
                            id="idServicio"
                            name="idServicio"
                            value={formData.idServicio}
                            onChange={handleChange}
                            required
                            disabled={loading || loadingServicios || servicios.length === 0}
                            className="form-select"
                        >
                            <option key="placeholder" value="">
                                {loadingServicios ? '⏳ Cargando servicios...' : servicios.length === 0 ? '❌ No hay servicios disponibles' : '-- Elige un servicio --'}
                            </option>
                            {servicios.map(servicio => (
                                <option key={servicio.id} value={servicio.id}>
                                    {servicio.nombre} - ${servicio.costo}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de Fecha y Hora */}
                    <div className="form-group">
                        <label htmlFor="fechaHora">📆 Fecha y Hora de la Cita</label>
                        <input
                            type="datetime-local"
                            id="fechaHora"
                            name="fechaHora"
                            value={formData.fechaHora}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="form-input"
                        />
                    </div>

                    <div className="form-buttons">
                        <button type="submit" disabled={loading} className="submit-btn">
                            {loading ? '⏳ Agendando...' : '✅ Confirmar Cita'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/mis-citas')}
                            className="cancel-btn"
                            disabled={loading}
                        >
                            ← Volver a Mis Citas
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgendarCitaPage;

