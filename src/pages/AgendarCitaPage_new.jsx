import React, { useState, useEffect } from 'react';
import { getServicios, createCita } from '../api/citasApi';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import './AgendarCitaPage.css';

// Funciones de validación de horarios
const esFinDeSemana = (fecha) => {
    const dia = fecha.getDay();
    return dia === 0 || dia === 6; // 0 = Domingo, 6 = Sábado
};

const esHorarioHabil = (fecha) => {
    const hora = fecha.getHours();
    const minutos = fecha.getMinutes();
    const tiempoEnMinutos = hora * 60 + minutos;

    // Horario de 8:00 AM (480 min) hasta 8:00 PM (1200 min)
    return tiempoEnMinutos >= 480 && tiempoEnMinutos < 1200;
};

const esFechaValida = (fechaStr) => {
    if (!fechaStr) return { valido: false, mensaje: 'Selecciona una fecha y hora' };

    const fechaSeleccionada = new Date(fechaStr);
    const ahora = new Date();

    // Validar que no sea fecha pasada
    if (fechaSeleccionada <= ahora) {
        return { valido: false, mensaje: 'No puedes agendar citas en fechas u horarios pasados' };
    }

    // Validar fin de semana
    if (esFinDeSemana(fechaSeleccionada)) {
        return {
            valido: false,
            mensaje: 'Los fines de semana trabajamos con previa cita agendada por WhatsApp. Por favor, contáctanos para coordinar tu cita.'
        };
    }

    // Validar horario de atención
    if (!esHorarioHabil(fechaSeleccionada)) {
        return {
            valido: false,
            mensaje: 'El horario de atención es de Lunes a Viernes de 8:00 AM a 8:00 PM'
        };
    }

    return { valido: true, mensaje: '' };
};

const AgendarCitaPage = () => {
    const [servicios, setServicios] = useState([]);
    const [loadingServicios, setLoadingServicios] = useState(true);
    const [formData, setFormData] = useState({ idServicio: '', fecha: '', hora: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [warningHorario, setWarningHorario] = useState('');
    const [horasDisponibles, setHorasDisponibles] = useState([]);
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Generar horas disponibles (8:00 AM - 8:00 PM cada 30 min)
    const generarHorasDisponibles = () => {
        const horas = [];
        for (let h = 8; h < 20; h++) {
            horas.push(`${h.toString().padStart(2, '0')}:00`);
            horas.push(`${h.toString().padStart(2, '0')}:30`);
        }
        horas.push('20:00'); // Agregar las 8:00 PM
        return horas;
    };

    // Obtener fecha mínima (hoy)
    const getFechaMinima = () => {
        const hoy = new Date();
        return hoy.toISOString().split('T')[0];
    };

    // Obtener fecha máxima (3 meses adelante)
    const getFechaMaxima = () => {
        const hoy = new Date();
        hoy.setMonth(hoy.getMonth() + 3);
        return hoy.toISOString().split('T')[0];
    };

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

        // Generar horas disponibles
        setHorasDisponibles(generarHorasDisponibles());
    }, [logout]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);

        // Validar horario en tiempo real cuando se tiene fecha y hora
        if ((name === 'fecha' || name === 'hora') && newFormData.fecha && newFormData.hora) {
            const fechaHoraStr = `${newFormData.fecha}T${newFormData.hora}`;
            const validacion = esFechaValida(fechaHoraStr);
            if (!validacion.valido) {
                setWarningHorario(validacion.mensaje);
            } else {
                setWarningHorario('');
            }
        } else if (name === 'fecha' && value) {
            // Validar si es fin de semana al seleccionar fecha
            const fechaSeleccionada = new Date(value + 'T12:00:00');
            if (esFinDeSemana(fechaSeleccionada)) {
                setWarningHorario('Los fines de semana trabajamos con previa cita agendada por WhatsApp.');
            } else {
                setWarningHorario('');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        setWarningHorario('');

        try {
            // Validar que el servicio esté seleccionado
            if (!formData.idServicio) {
                setError('Por favor selecciona un servicio');
                setLoading(false);
                return;
            }

            // Validar que la fecha esté seleccionada
            if (!formData.fecha) {
                setError('Por favor selecciona una fecha');
                setLoading(false);
                return;
            }

            // Validar que la hora esté seleccionada
            if (!formData.hora) {
                setError('Por favor selecciona una hora');
                setLoading(false);
                return;
            }

            // Combinar fecha y hora
            const fechaHoraCombinada = `${formData.fecha}T${formData.hora}`;

            // Validar horarios de atención
            const validacionHorario = esFechaValida(fechaHoraCombinada);
            if (!validacionHorario.valido) {
                setError(validacionHorario.mensaje);
                setLoading(false);
                return;
            }

            // Convertir a formato ISO 8601 con segundos (YYYY-MM-DDTHH:mm:ss)
            const fechaHoraISO = `${fechaHoraCombinada}:00`;

            const citaData = {
                servicioId: parseInt(formData.idServicio),
                fechaHora: fechaHoraISO,
                notas: formData.notas || ""
            };

            console.log('Enviando cita con fecha ISO:', citaData);

            await createCita(citaData);
            setSuccess('✅ Cita agendada exitosamente. Revisa "Mis Citas" para confirmarla.');
            setFormData({ idServicio: '', fecha: '', hora: '', notas: '' });

            // Redirigir a mis citas después de 2 segundos
            setTimeout(() => {
                navigate('/mis-citas');
            }, 2000);

        } catch (err) {
            console.error('Error al agendar:', err);
            console.error('Tipo de error:', err.name);
            console.error('Mensaje:', err.message);
            console.error('Response status:', err.response?.status);
            console.error('Response data:', err.response?.data);

            // Extraer el mensaje de error del servidor
            let errorMessage = 'Error al agendar la cita. Verifica los datos.';

            if (err.response) {
                // El servidor respondió con un código de error
                const serverError = err.response.data;
                if (typeof serverError === 'string') {
                    errorMessage = serverError;
                } else if (serverError?.message) {
                    errorMessage = serverError.message;
                } else if (serverError?.error) {
                    errorMessage = serverError.error;
                }
                errorMessage = `Error ${err.response.status}: ${errorMessage}`;
            } else if (err.request) {
                // La petición se hizo pero no hubo respuesta
                errorMessage = 'No se recibió respuesta del servidor. Verifica tu conexión.';
            }

            setError(errorMessage);
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
                            <option value="">
                                {loadingServicios ? '⏳ Cargando servicios...' : servicios.length === 0 ? '❌ No hay servicios disponibles' : '-- Elige un servicio --'}
                            </option>
                            {servicios.map(servicio => (
                                <option key={servicio.servicioId} value={servicio.servicioId}>
                                    {servicio.nombre} - ${servicio.costo} ({servicio.duracionMinutos} min)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de Fecha */}
                    <div className="form-group">
                        <label htmlFor="fecha">📆 Selecciona la Fecha</label>
                        <input
                            type="date"
                            id="fecha"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            min={getFechaMinima()}
                            max={getFechaMaxima()}
                            required
                            disabled={loading}
                            className="form-input"
                        />
                        <small style={{color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block'}}>
                            📅 Selecciona solo días laborables (Lunes a Viernes)
                        </small>
                    </div>

                    {/* Selector de Hora */}
                    <div className="form-group">
                        <label htmlFor="hora">🕐 Selecciona la Hora</label>
                        <select
                            id="hora"
                            name="hora"
                            value={formData.hora}
                            onChange={handleChange}
                            required
                            disabled={loading || !formData.fecha}
                            className="form-select"
                        >
                            <option value="">
                                {!formData.fecha ? '-- Primero selecciona una fecha --' : '-- Selecciona una hora --'}
                            </option>
                            {horasDisponibles.map(hora => (
                                <option key={hora} value={hora}>
                                    {hora}
                                </option>
                            ))}
                        </select>
                        <small style={{color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block'}}>
                            ⏰ Horarios disponibles cada 30 minutos (8:00 AM - 8:00 PM)
                        </small>
                        {warningHorario && (
                            <div style={{
                                background: '#fef3c7',
                                color: '#92400e',
                                border: '1px solid #fbbf24',
                                borderRadius: '6px',
                                padding: '0.75rem',
                                fontSize: '0.875rem',
                                marginTop: '0.5rem'
                            }}>
                                ⚠️ {warningHorario}
                            </div>
                        )}
                    </div>

                    {/* Información adicional */}
                    <div style={{
                        background: '#e0f2fe',
                        border: '1px solid #7dd3fc',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        fontSize: '0.813rem',
                        color: '#075985',
                        marginTop: '0.5rem'
                    }}>
                        ℹ️ <strong>Importante:</strong>
                        <ul style={{margin: '0.5rem 0 0 1.25rem', paddingLeft: 0}}>
                            <li>Horario de atención: Lunes a Viernes de 8:00 AM a 8:00 PM</li>
                            <li>Citas disponibles cada 30 minutos</li>
                            <li>Fines de semana: Solo con cita previa por WhatsApp</li>
                        </ul>
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

