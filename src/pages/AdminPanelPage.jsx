import React, { useEffect, useState, useCallback } from 'react';
import { buscarCitasAdmin } from '../api/citasApi';
import { getServicios } from '../api/citasApi';
import './AdminPanelPage.css';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../styles/admin/admin-tokens.css';

const ESTADOS = ['PENDIENTE','CONFIRMADA','COMPLETADA','CANCELADA'];

const AdminPanelPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({show:false, type:'success', msg:''});
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [estado, setEstado] = useState('TODOS');
  const [q, setQ] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [servicios, setServicios] = useState([]);
  const [servicioId, setServicioId] = useState('');
  // Modal eliminado: se usa página dedicada
  const [showFiltros, setShowFiltros] = useState(false);

  const showToast = (type, msg) => {
    setToast({show:true, type, msg});
    setTimeout(()=> setToast({show:false, type:'success', msg:''}), 2500);
  };

  const cargarServicios = useCallback(async ()=>{
    try { const s = await getServicios(); setServicios(s); } catch(err){ console.error('Error cargando servicios', err); }
  },[]);

  const cargar = useCallback(async ()=>{
    setLoading(true); setError('');
    try {
      const dataResp = await buscarCitasAdmin({ page, size, estado, q: q.trim() || undefined, servicioId: servicioId? parseInt(servicioId): undefined, desde: desde || undefined, hasta: hasta || undefined });
      setData(dataResp);
    } catch (e) { setError(e.response?.data || 'Error al cargar'); }
    finally { setLoading(false); }
  }, [page,size,estado,q,servicioId,desde,hasta]);

  useEffect(()=>{ if (user?.rol === 'ADMIN'){ cargar(); cargarServicios(); } },[cargar, user, cargarServicios]);
  // Eliminado efecto para pacientes

  const abrirEditar = (c) => {
    navigate(`/admin/editar/${c.citaId}`);
  };

  // Función de agendar movida a la nueva página
  const irAgendarPaciente = ()=> navigate('/admin/agendar-paciente');

  if (user?.rol !== 'ADMIN') return <div style={{padding:'2rem'}}>Acceso denegado.</div>;

  const totalPages = data?.totalPages || 1;
  const pageNumbers = Array.from({length: totalPages}, (_, i) => i).slice(Math.max(0, page-2), Math.max(0, page-2)+5);

  return (
    <div className="admin-panel-wrapper">
      <div className="admin-header-row">
        <h1>🔧 Panel Administrador</h1>
        <button className="btn btn--accent" onClick={irAgendarPaciente}>📅 Agendar para paciente</button>
        <div className="estado-pills">
          <button className={`pill ${estado==='TODOS'?'active':''}`} onClick={()=>{setEstado('TODOS'); setPage(0);}}>Todas</button>
          {ESTADOS.map(es => (
            <button key={es} className={`pill ${estado===es?'active':''}`} onClick={()=>{setEstado(es); setPage(0);}}>{es}</button>
          ))}
        </div>
        <button className="btn-filtros" onClick={()=> setShowFiltros(s=>!s)}>
          {showFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>
      </div>

      {showFiltros && (
        <div className="admin-filtros">
          <div className="filtro">
            <label>Buscar (paciente / servicio / email)</label>
            <input value={q} onChange={e=>{setPage(0); setQ(e.target.value);}} placeholder="Texto..." />
          </div>
          <div className="filtro">
            <label>Servicio</label>
            <select value={servicioId} onChange={e=>{setPage(0); setServicioId(e.target.value);}}>
              <option value="">Todos</option>
              {servicios.map(s=> <option key={s.servicioId} value={s.servicioId}>{s.nombre}</option>)}
            </select>
          </div>
          <div className="filtro">
            <label>Desde (fecha/hora)</label>
            <input type="datetime-local" value={desde} onChange={e=>{setPage(0); setDesde(e.target.value);}} />
          </div>
          <div className="filtro">
            <label>Hasta (fecha/hora)</label>
            <input type="datetime-local" value={hasta} onChange={e=>{setPage(0); setHasta(e.target.value);}} />
          </div>
          <div className="filtro">
            <label>Tamaño Página</label>
            <select value={size} onChange={e=>{setPage(0); setSize(parseInt(e.target.value));}}>
              {[5,10,20,50].map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filtro" style={{alignSelf:'flex-end'}}>
            <button onClick={()=>{setPage(0); cargar();}} className="btn-apply">Aplicar</button>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={`toast ${toast.type==='error'?'toast-error':'toast-success'}`}>{toast.msg}</div>
      )}

      {loading && <div className="loading"><span className="spinner"/> Cargando...</div>}
      {error && <div className="error-admin">{error}</div>}

      {data && data.content && data.content.length > 0 ? (
        <div className="tabla-citas-admin">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>Servicio</th>
                <th>Fecha/Hora</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map(c => (
                <tr key={c.citaId} className={`row-${c.estado.toLowerCase()}`}>
                  <td>#{c.citaId}</td>
                  <td>{c.pacienteNombre}</td>
                  <td>{c.servicioNombre}</td>
                  <td>{new Date(c.fechaHora).toLocaleString('es-ES')}</td>
                  <td><span className={`estado-badge badge-${c.estado.toLowerCase()}`}>{c.estado}</span></td>
                  <td className="acciones-cell">
                    <button onClick={()=>abrirEditar(c)} className="btn-estado" title="Editar">✏️ Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="paginacion-admin">
            <button disabled={page===0} onClick={()=>setPage(0)}>⏮</button>
            <button disabled={page===0} onClick={()=>setPage(p=>p-1)}>◀</button>
            {pageNumbers.map(p => (
              <button key={p} className={`num ${p===page?'active':''}`} onClick={()=>setPage(p)}>{p+1}</button>
            ))}
            <button disabled={page+1>=totalPages} onClick={()=>setPage(p=>p+1)}>▶</button>
            <button disabled={page+1>=totalPages} onClick={()=>setPage(totalPages-1)}>⏭</button>
          </div>
        </div>
      ) : (!loading && !error && <div className="empty-admin">No hay citas para mostrar.</div>)}


      {/* Modal eliminado: se usa nueva página */}
    </div>
  );
};

export default AdminPanelPage;
