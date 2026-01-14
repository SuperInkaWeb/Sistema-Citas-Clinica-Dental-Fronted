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
    // Estados
    const [servicios, setServicios] = useState([]);
    const [loadingServicios, setLoadingServicios] = useState(true);
    // Ajuste: usamos fecha y hora separadas
    const [formData, setFormData] = useState({ idServicio: '', fecha: '', hora: '', notas: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [warningHorario, setWarningHorario] = useState('');
    const [horasDisponibles, setHorasDisponibles] = useState([]);
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Precalcular fechas límites
    const hoyISO = new Date().toISOString().split('T')[0];
    const maxFechaObj = new Date();
    maxFechaObj.setMonth(maxFechaObj.getMonth() + 3);
    const maxISO = maxFechaObj.toISOString().split('T')[0];

    // Generar horas disponibles cada 30 min entre 08:00 y 20:00 inclusive 20:00
    const generarHoras = () => {
        const arr = [];
        for (let h = 8; h < 20; h++) {
            arr.push(`${String(h).padStart(2,'0')}:00`);
            arr.push(`${String(h).padStart(2,'0')}:30`);
        }
        arr.push('20:00');
        return arr;
    };

    useEffect(() => {
        setHorasDisponibles(generarHoras());
        const fetchServicios = async () => {
            setLoadingServicios(true);
            try {
                const data = await getServicios();
                setServicios(Array.isArray(data) ? data : []);
            } catch (err) {
                if (err.response?.status === 401) {
                    alert('Tu sesión ha expirado. Inicia sesión nuevamente.');
                    logout();
                } else {
                    setError('Error al cargar los servicios');
                }
                setServicios([]);
            } finally {
                setLoadingServicios(false);
            }
        };
        fetchServicios();
    }, [logout]);

    // Validar fecha/hora combinadas
    const validarFechaHora = (fecha, hora) => {
        if (!fecha || !hora) return { valido: false, mensaje: 'Selecciona fecha y hora' };
        const combinado = `${fecha}T${hora}`;
        return esFechaValida(combinado);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Validación dinámica
        if ((name === 'fecha' || name === 'hora') && (name === 'hora' ? formData.fecha : value) ) {
            const fechaTemp = name === 'fecha' ? value : formData.fecha;
            const horaTemp = name === 'hora' ? value : formData.hora;
            if (fechaTemp && horaTemp) {
                const v = validarFechaHora(fechaTemp, horaTemp);
                setWarningHorario(v.valido ? '' : v.mensaje);
            } else if (name === 'fecha') {
                // Aviso si fin de semana
                const f = new Date(value + 'T12:00:00');
                if (esFinDeSemana(f)) {
                    setWarningHorario('Fin de semana: solo previa coordinación por WhatsApp.');
                } else {
                    setWarningHorario('');
                }
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
            if (!formData.idServicio) {
                setError('Por favor selecciona un servicio');
                return;
            }
            if (!formData.fecha) {
                setError('Por favor selecciona una fecha');
                return;
            }
            if (!formData.hora) {
                setError('Por favor selecciona una hora');
                return;
            }
            const validacion = validarFechaHora(formData.fecha, formData.hora);
            if (!validacion.valido) {
                setError(validacion.mensaje);
                return;
            }
            const fechaHoraISO = `${formData.fecha}T${formData.hora}:00`;
            const citaData = {
                servicioId: parseInt(formData.idServicio),
                fechaHora: fechaHoraISO,
                notas: formData.notas || ''
            };
            await createCita(citaData);
            setSuccess('✅ Cita agendada exitosamente. Redirigiendo...');
            setFormData({ idServicio: '', fecha: '', hora: '', notas: '' });
            setTimeout(() => navigate('/mis-citas'), 1800);
        } catch (err) {
            let msg = 'Error al agendar la cita.';
            if (err.response) {
                const data = err.response.data;
                msg = typeof data === 'string' ? data : (data?.message || msg);
                msg = `Error ${err.response.status}: ${msg}`;
            } else if (err.request) {
                msg = 'Servidor no respondió. Verifica tu conexión.';
            }
            setError(msg);
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
            {error && <div className="error-message"><strong>⚠️ Error:</strong> {error}</div>}
            {success && <div className="success-message">{success}</div>}
            <div className="agendar-form-card">
                <form onSubmit={handleSubmit}>
                    {/* Servicio */}
                    <div className="form-group">
                        <label htmlFor="idServicio">💼 Servicio</label>
                        <select id="idServicio" name="idServicio" value={formData.idServicio} onChange={handleChange} required disabled={loading || loadingServicios || servicios.length===0} className="form-select">
                            <option value="">{loadingServicios ? '⏳ Cargando...' : servicios.length===0 ? '❌ Sin servicios' : '-- Selecciona --'}</option>
                            {servicios.map(s => (
                                <option key={s.servicioId} value={s.servicioId}>{s.nombre} - ${s.costo} ({s.duracionMinutos} min)</option>
                            ))}
                        </select>
                    </div>
                    {/* Fecha */}
                    <div className="form-group">
                        <label htmlFor="fecha">📆 Fecha</label>
                        <input type="date" id="fecha" name="fecha" value={formData.fecha} onChange={handleChange} min={hoyISO} max={maxISO} required disabled={loading} className="form-input" />
                        <small className="hint">Rango permitido: hoy hasta {maxISO}</small>
                    </div>
                    {/* Hora */}
                    <div className="form-group">
                        <label htmlFor="hora">🕐 Hora</label>
                        <select id="hora" name="hora" value={formData.hora} onChange={handleChange} required disabled={loading || !formData.fecha} className="form-select">
                            <option value="">{!formData.fecha ? '-- Selecciona fecha primero --' : '-- Selecciona hora --'}</option>
                            {horasDisponibles.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <small className="hint">Intervalos de 30 minutos entre 08:00 y 20:00</small>
                        {warningHorario && <div className="warn-box">⚠️ {warningHorario}</div>}
                    </div>
                    {/* Notas */}
                    <div className="form-group">
                        <label htmlFor="notas">📝 Notas (opcional)</label>
                        <textarea id="notas" name="notas" value={formData.notas} onChange={handleChange} rows={3} placeholder="Observaciones..." />
                    </div>
                    <div className="info-box">
                        ℹ️ <strong>Importante:</strong>
                        <ul>
                            <li>Horario: Lunes a Viernes 08:00 - 20:00</li>
                            <li>Fines de semana requieren coordinación por WhatsApp</li>
                        </ul>
                    </div>
                    <div className="form-buttons">
                        <button type="submit" disabled={loading} className="submit-btn">{loading ? '⏳ Agendando...' : '✅ Confirmar Cita'}</button>
                        <button type="button" onClick={() => navigate('/mis-citas')} className="cancel-btn" disabled={loading}>← Volver</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgendarCitaPage;
