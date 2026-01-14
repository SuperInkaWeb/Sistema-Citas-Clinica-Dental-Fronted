import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { editarCitaAdmin, buscarCitasAdmin, getServicios } from '../api/citasApi';
import AdminPageLayout from '../components/admin/AdminPageLayout';
import AdminCard from '../components/admin/AdminCard';
import AdminFormField from '../components/admin/AdminFormField';
import AdminBadge from '../components/admin/AdminBadge';
import AdminToast from '../components/admin/AdminToast';
import '../styles/admin/admin-tokens.css';
import './AdminPanelPage.css';

const ESTADOS = ['PENDIENTE','CONFIRMADA','COMPLETADA','CANCELADA'];

export default function AdminEditarCitaPage(){
  const { citaId } = useParams();
  const navigate = useNavigate();
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servicios, setServicios] = useState([]);
  const [form, setForm] = useState({ fecha:'', servicio:'', notas:'', estado:'' });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState({show:false,type:'success',msg:''});
  const [errorFecha, setErrorFecha] = useState('');

  useEffect(()=>{
    (async ()=>{
      try{
        const page = await buscarCitasAdmin({ page:0, size:1000 });
        const found = page.content.find(c => String(c.citaId) === String(citaId));
        if(!found){ setError('Cita no encontrada'); setLoading(false); return; }
        setCita(found);
        setForm({ fecha: found.fechaHora?.slice(0,16) || '', servicio:'', notas: found.notas||'', estado: found.estado });
        const s = await getServicios(); setServicios(s);
      }catch(e){ console.error('Error al buscar cita', e); setError('Error cargando datos'); }
      finally{ setLoading(false); }
    })();
  },[citaId]);

  const guardar = async ()=>{
    setError(''); setErrorFecha('');
    if(form.fecha){
      const dt = new Date(form.fecha);
      if(dt < new Date()){ setErrorFecha('La fecha/hora debe ser futura'); return; }
    }
    setGuardando(true);
    // Validar fecha futura si se cambia
    const payload = {
      servicioId: form.servicio ? parseInt(form.servicio) : null,
      fechaHora: form.fecha ? new Date(form.fecha).toISOString().slice(0,19) : null,
      notas: form.notas,
      estado: form.estado
    };
    try{
      await editarCitaAdmin(cita.citaId, payload);
      setToast({show:true,type:'success',msg:'Guardado'});
      setTimeout(()=> navigate('/admin'), 1000);
    }catch(e){
      console.error(e);
      setError(e.response?.data || 'Error al guardar');
    } finally { setGuardando(false); }
  };

  if(loading) return <div className="admin-edit-page"><p>Cargando...</p></div>;
  if(error) return <div className="admin-edit-page"><p className="error-admin">{error}</p></div>;

  return (
    <AdminPageLayout title={`Editar Cita #${cita.citaId}`} icon="✏️" actions={[<button key="volver" className="btn btn--secondary" onClick={()=>navigate('/admin')}>Volver</button>]}>
      {toast?.show && <AdminToast type={toast.type} message={toast.msg} onHide={()=>setToast({show:false,type:'success',msg:''})} />}
      <AdminCard elevated header={<h2 style={{margin:0,fontSize:'1.25rem',display:'flex',alignItems:'center',gap:'.5rem'}}>✏️ Datos de Edición</h2>}>
        <div className="admin-grid-2">
          <div>
            <AdminFormField label="Paciente" hint="No editable">
              <div className="admin-input" style={{background:'#f3f4f6'}}>{cita.pacienteNombre}</div>
            </AdminFormField>
            <AdminFormField label="Servicio" hint="Selecciona para cambiar">
              <select className="admin-select" value={form.servicio} onChange={e=>setForm(f=>({...f, servicio:e.target.value}))}>
                <option value="">(sin cambio)</option>
                {servicios.map(s => <option key={s.servicioId} value={s.servicioId}>{s.nombre}</option>)}
              </select>
            </AdminFormField>
            <AdminFormField label="Fecha/Hora" hint="Debe ser futura" error={errorFecha}>
              <input type="datetime-local" className="admin-input" value={form.fecha} onChange={e=>setForm(f=>({...f, fecha:e.target.value}))} />
            </AdminFormField>
            <AdminFormField label="Estado">
              <select className="admin-select" value={form.estado} onChange={e=>setForm(f=>({...f, estado:e.target.value}))}>
                {ESTADOS.map(es => <option key={es} value={es}>{es}</option>)}
              </select>
            </AdminFormField>
            <AdminFormField label="Notas" hint="Opcional">
              <textarea className="admin-textarea" value={form.notas} onChange={e=>setForm(f=>({...f, notas:e.target.value}))} rows={4} />
            </AdminFormField>
            <div className="u-flex u-gap-sm" style={{justifyContent:'flex-end', marginTop:'0.5rem'}}>
              <button className="btn btn--primary" onClick={guardar} disabled={guardando}>{guardando? <span className="spinner"/>: 'Guardar'}</button>
              <button className="btn btn--secondary" onClick={()=>navigate('/admin')} disabled={guardando}>Cancelar</button>
            </div>
            {error && <div className="admin-form-field__error" style={{marginTop:'0.75rem'}}>{error}</div>}
          </div>
          <div>
            <h3 style={{margin:'0 0 .75rem', fontSize:'1.05rem', textTransform:'uppercase', letterSpacing:'.5px', color:'#374151'}}>Información Actual</h3>
            <ul className="admin-resumen-ul">
              <li><strong>Paciente:</strong> {cita.pacienteNombre}</li>
              <li><strong>Servicio:</strong> {cita.servicioNombre}</li>
              <li><strong>Fecha original:</strong> {new Date(cita.fechaHora).toLocaleString('es-ES')}</li>
              <li><strong>Estado:</strong> <AdminBadge estado={cita.estado} /></li>
              {cita.notas && <li><strong>Notas:</strong> {cita.notas}</li>}
            </ul>
            <div className="admin-info-box u-mt-md">Si cambias la fecha u estado y es CONFIRMADA o CANCELADA, el paciente recibirá notificación por correo.</div>
          </div>
        </div>
      </AdminCard>
    </AdminPageLayout>
  );
 }
