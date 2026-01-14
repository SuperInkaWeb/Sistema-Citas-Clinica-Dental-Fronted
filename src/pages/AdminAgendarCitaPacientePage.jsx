import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerPacientes, getServicios, agendarCitaParaUsuario, buscarCitasAdmin } from '../api/citasApi';
import AdminPageLayout from '../components/admin/AdminPageLayout';
import AdminCard from '../components/admin/AdminCard';
import AdminFormField from '../components/admin/AdminFormField';
import AdminToast from '../components/admin/AdminToast';
import CitaResumen from '../components/admin/CitaResumen';
import HorarioSelector from '../components/admin/HorarioSelector';
import '../styles/admin/admin-tokens.css';
import './AdminPanelPage.css';

// Horarios permitidos lunes-viernes 08:00-20:00 con saltos de 30 min
const generarSlots = (fechaSeleccionada) => {
  if(!fechaSeleccionada) return [];
  const fecha = new Date(fechaSeleccionada + 'T00:00:00');
  const day = fecha.getDay(); // 0 Domingo ... 6 Sábado
  if(day === 0 || day === 6) return []; // fines de semana -> sin slots (solo previa coordinación externa)
  const slots = [];
  for(let h=8; h<=19; h++){ // último slot 19:30
    slots.push(`${String(h).padStart(2,'0')}:00`);
    slots.push(`${String(h).padStart(2,'0')}:30`);
  }
  return slots;
};

export default function AdminAgendarCitaPacientePage(){
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({show:false,type:'success', msg:''});
  const [guardando, setGuardando] = useState(false);
  const [intentado, setIntentado] = useState(false);

  const hoyISO = new Date().toISOString().slice(0,10);
  const [form, setForm] = useState({ pacienteId:'', servicioId:'', fecha:hoyISO, hora:'', notas:'' });
  const [slots, setSlots] = useState([]);
  const [ocupadasDia, setOcupadasDia] = useState([]);
  const [previewServicio, setPreviewServicio] = useState(null);

  const showToast = (type,msg)=>{ setToast({show:true,type,msg}); setTimeout(()=> setToast({show:false,type:'success',msg:''}),2500); };

  const cargarData = useCallback(async ()=>{
    try {
      const [p, s] = await Promise.all([obtenerPacientes(), getServicios()]);
      setPacientes(p); setServicios(s);
    } catch (e){ console.error('Error cargando pacientes/servicios', e); setError('Error cargando datos'); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{ cargarData(); },[cargarData]);
  useEffect(()=>{
    const baseSlots = generarSlots(form.fecha);
    // remover horas pasadas si es hoy
    if(form.fecha === hoyISO){
      const ahora = new Date();
      const limite = `${String(ahora.getHours()).padStart(2,'0')}:${ahora.getMinutes()<30?'00':'30'}`;
      // filtrar slots >= siguiente bloque
      const filtrados = baseSlots.filter(s => s >= limite);
      setSlots(filtrados);
    } else {
      setSlots(baseSlots);
    }
    if(form.hora && !baseSlots.includes(form.hora)) setForm(f=>({...f,hora:''}));
    // cargar citas del día para marcar ocupadas
    (async ()=>{
      try {
        const resp = await buscarCitasAdmin({ page:0, size:500, desde: form.fecha+"T00:00", hasta: form.fecha+"T23:59" });
        const horas = resp.content?.map(c => c.fechaHora.slice(11,16)) || [];
        setOcupadasDia(horas);
      } catch(e){ console.error('Error cargando ocupadas', e); setOcupadasDia([]); }
    })();
  },[form.fecha, form.hora, hoyISO]);
  useEffect(()=>{ setPreviewServicio(servicios.find(s=>String(s.servicioId)===form.servicioId) || null); },[form.servicioId, servicios]);

  const validar = ()=> {
    if(!form.pacienteId || !form.servicioId || !form.fecha || !form.hora) return 'Completa todos los campos requeridos';
    const fechaHoraStr = `${form.fecha}T${form.hora}:00`; // agregamos segundos
    const dt = new Date(fechaHoraStr);
    if(dt < new Date()) return 'La fecha/hora debe ser futura';
    return null;
  };

  const guardar = async ()=>{
    setIntentado(true);
    const err = validar();
    if(err){ showToast('error', err); return; }
    setGuardando(true);
    const fechaHoraISO = `${form.fecha}T${form.hora}:00`; // formato aceptado
    const payload = {
      pacienteId: parseInt(form.pacienteId),
      servicioId: parseInt(form.servicioId),
      fechaHora: fechaHoraISO,
      notas: form.notas
    };
    try {
      await agendarCitaParaUsuario(payload);
      showToast('success','Cita agendada');
      setTimeout(()=> navigate('/admin'), 1200);
    } catch(e){ showToast('error', e.response?.data || 'Error al agendar'); }
    finally { setGuardando(false); }
  };

  if(loading) return <div className="admin-agendar-page"><div className="loader-inline"/> Cargando...</div>;
  if(error) return <div className="admin-agendar-page"><p className="error-admin">{error}</p></div>;

  const esFinDeSemana = (()=>{ const d = new Date(form.fecha + 'T00:00:00').getDay(); return d===0 || d===6; })();

  return (
    <AdminPageLayout title="Agendar Cita para Paciente" icon="📅" actions={[
      <button key="volver" className="btn btn--secondary" onClick={()=>navigate('/admin')}>Volver</button>
    ]}>
      {toast.show && <AdminToast type={toast.type==='error'?'error':'success'} message={toast.msg} onHide={()=>setToast({show:false,type:'success',msg:''})} />}
      <AdminCard elevated header={<h2 style={{margin:0,fontSize:'1.25rem',display:'flex',alignItems:'center',gap:'.5rem'}}>📅 Datos de la Cita</h2>}>
        <div className="admin-grid-2">
          <div>
            <AdminFormField label="Paciente" required error={!form.pacienteId && intentado ? 'Campo requerido' : ''}>
              <select className="admin-select" value={form.pacienteId} onChange={e=>setForm(f=>({...f,pacienteId:e.target.value}))}>
                <option value="">-- Selecciona --</option>
                {pacientes.map(p => (
                  <option key={p.usuarioId} value={p.usuarioId}>{p.nombre} {p.apellido} - {p.email}</option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Servicio" required hint={previewServicio?`Duración: ${previewServicio.duracionMinutos} min • Costo: $${previewServicio.costo}`:''} error={!form.servicioId && intentado ? 'Campo requerido' : ''}>
              <select className="admin-select" value={form.servicioId} onChange={e=>setForm(f=>({...f,servicioId:e.target.value}))}>
                <option value="">-- Selecciona --</option>
                {servicios.map(s => (
                  <option key={s.servicioId} value={s.servicioId}>{s.nombre} • {s.duracionMinutos} min • ${s.costo}</option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Fecha" required error={intentado && !form.fecha ? 'Campo requerido' : ''} hint={esFinDeSemana? 'Fines de semana: solo previa coordinación externa.':''}>
              <input className="admin-input" type="date" min={hoyISO} value={form.fecha} onChange={e=>setForm(f=>({...f,fecha:e.target.value}))} />
            </AdminFormField>
            <AdminFormField label="Hora" required error={intentado && !form.hora ? 'Campo requerido' : ''} hint={ocupadasDia.length>0? 'Marcadas como (ocupada) ya tienen cita.':''}>
              <HorarioSelector fecha={form.fecha} hoyISO={hoyISO} valor={form.hora} onChange={(v)=>setForm(f=>({...f,hora:v}))} ocupadasDia={ocupadasDia} disabled={esFinDeSemana} />
            </AdminFormField>
            <AdminFormField label="Notas" hint="Opcional">
              <textarea className="admin-textarea" rows={4} value={form.notas} placeholder="Observaciones..." onChange={e=>setForm(f=>({...f,notas:e.target.value}))} />
            </AdminFormField>
            <div className="u-flex u-gap-sm" style={{justifyContent:'flex-end', marginTop:'0.5rem'}}>
               <button className="btn btn--primary" onClick={guardar} disabled={guardando}>{guardando? <span className="spinner"/>: 'Agendar'}</button>
               <button className="btn btn--secondary" onClick={()=>navigate('/admin')} disabled={guardando}>Cancelar</button>
            </div>
          </div>
          <div>
            <CitaResumen pacienteNombre={pacientes.find(p=>String(p.usuarioId)===form.pacienteId)?.nombre} servicioNombre={servicios.find(s=>String(s.servicioId)===form.servicioId)?.nombre} fecha={form.fecha} hora={form.hora} notas={form.notas} duracion={previewServicio?.duracionMinutos} />
          </div>
        </div>
      </AdminCard>
    </AdminPageLayout>
  );
}
