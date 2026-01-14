import React, { useState, useEffect, useCallback } from 'react';
import { getMisCitas, cancelarCita } from '../api/citasApi';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import './MisCitasPage.css';

const MisCitasPage = () => {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [orden, setOrden] = useState('asc');
    const [estadoFiltro, setEstadoFiltro] = useState('TODOS');
    const [pagina, setPagina] = useState(1);
    const TAM_PAGINA = 6;
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Función para cargar las citas
    const fetchCitas = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            console.log('Cargando citas...');
            const data = await getMisCitas(orden);
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
    }, [logout, orden]);

    // Derivar citas filtradas y paginadas
    const citasFiltradas = citas.filter(c => {
        if (estadoFiltro === 'TODOS') return true;
        if (estadoFiltro === 'ACTIVAS') {
            return c.estado !== 'CANCELADA';
        }
        return c.estado === estadoFiltro; // PENDIENTE, CONFIRMADA, COMPLETADA, CANCELADA
    });

    const total = citasFiltradas.length;
    const totalPaginas = Math.max(1, Math.ceil(total / TAM_PAGINA));
    const inicio = (pagina - 1) * TAM_PAGINA;
    const citasPagina = citasFiltradas.slice(inicio, inicio + TAM_PAGINA);

    useEffect(() => {
        fetchCitas();
    }, [fetchCitas]);

    useEffect(() => {
        // Reiniciar a la primera página si cambia filtro u orden
        setPagina(1);
    }, [estadoFiltro, orden]);

    const irPagina = (p) => {
        if (p >= 1 && p <= totalPaginas) setPagina(p);
    };

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
                <div className="header-actions">
                    <label className="orden-label">
                        Orden
                        <select
                            value={orden}
                            onChange={(e) => setOrden(e.target.value)}
                            className="orden-select"
                        >
                            <option value="asc">Próximas primero</option>
                            <option value="desc">Más lejanas primero</option>
                        </select>
                    </label>
                    <button
                        className="agendar-btn"
                        onClick={() => navigate('/agendar')}
                    >
                        ➕ Agendar Nueva Cita
                    </button>
                </div>
            </div>

            <div className="filtros-bar">
                <div className="filtro-group">
                    <label>Estado</label>
                    <select
                        value={estadoFiltro}
                        onChange={(e) => setEstadoFiltro(e.target.value)}
                        className="select-estado"
                    >
                        <option value="TODOS">Todos</option>
                        <option value="ACTIVAS">Activas (sin canceladas)</option>
                        <option value="PENDIENTE">Pendientes</option>
                        <option value="CONFIRMADA">Confirmadas</option>
                        <option value="COMPLETADA">Completadas</option>
                        <option value="CANCELADA">Canceladas</option>
                    </select>
                </div>
                <div className="filtro-group">
                    <label>Total Filtrado</label>
                    <span className="total-registros-badge">{citasFiltradas.length}</span>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <strong>⚠️ Error:</strong> {error}
                </div>
            )}

            {citasFiltradas.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h2>No hay citas con ese filtro</h2>
                    <p>Prueba cambiando el orden o el estado.</p>
                </div>
            ) : (
                <>
                    <div className="citas-grid">
                        {citasPagina.map(cita => (
                            <div key={cita.citaId} className={`cita-card cita-${cita.estado.toLowerCase()}`}>
                                <div className="cita-header">
                                    <span className={`cita-estado estado-${cita.estado.toLowerCase()}`}>
                                        {cita.estado}
                                    </span>
                                    <span className="cita-id">ID: {cita.citaId}</span>
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
                                        <span className="cita-value">{cita.servicio?.nombre || 'N/A'}</span>
                                    </div>
                                    <div className="cita-item">
                                        <span className="cita-label">⏱️ Duración:</span>
                                        <span className="cita-value">{cita.servicio?.duracionMinutos || 0} minutos</span>
                                    </div>
                                    {cita.notas && (
                                        <div className="cita-item">
                                            <span className="cita-label">📝 Notas:</span>
                                            <span className="cita-value">{cita.notas}</span>
                                        </div>
                                    )}
                                </div>
                                {(cita.estado === 'PENDIENTE' || cita.estado === 'CONFIRMADA') && (
                                    <button
                                        className="cancelar-btn"
                                        onClick={() => handleCancelar(cita.citaId)}
                                    >
                                        ❌ Cancelar Cita
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="paginacion-container">
                        <div className="page-info">
                            Página {pagina} de {totalPaginas} — Mostrando {citasPagina.length} / {citasFiltradas.length}
                        </div>
                        <div className="page-buttons">
                            <button className="page-btn" onClick={() => irPagina(1)} disabled={pagina === 1}>⏮ Inicio</button>
                            <button className="page-btn" onClick={() => irPagina(pagina - 1)} disabled={pagina === 1}>◀ Anterior</button>
                            {Array.from({length: totalPaginas}, (_, i) => i + 1).slice(Math.max(0, pagina - 3), Math.max(0, pagina - 3) + 5).map(p => (
                                <button
                                    key={p}
                                    className={`page-btn ${p === pagina ? 'active' : ''}`}
                                    onClick={() => irPagina(p)}
                                >{p}</button>
                            ))}
                            <button className="page-btn" onClick={() => irPagina(pagina + 1)} disabled={pagina === totalPaginas}>Siguiente ▶</button>
                            <button className="page-btn" onClick={() => irPagina(totalPaginas)} disabled={pagina === totalPaginas}>Final ⏭</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MisCitasPage;