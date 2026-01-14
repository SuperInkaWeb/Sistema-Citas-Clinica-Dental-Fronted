import React from 'react';
import AdminBadge from './AdminBadge';

export default function CitaResumen({ pacienteNombre, servicioNombre, fecha, hora, estado='PENDIENTE', notas, duracion }){
  return (
    <div>
      <h3 style={{margin:'0 0 .75rem', fontSize:'1.05rem', textTransform:'uppercase', letterSpacing:'.5px', color:'#374151'}}>Resumen</h3>
      <ul className="admin-resumen-ul">
        <li><strong>Paciente:</strong> {pacienteNombre || '—'}</li>
        <li><strong>Servicio:</strong> {servicioNombre || '—'}</li>
        <li><strong>Fecha:</strong> {fecha || '—'}</li>
        <li><strong>Hora:</strong> {hora || '—'}</li>
        <li><strong>Estado inicial:</strong> <AdminBadge estado={estado} /></li>
        {duracion && <li><strong>Duración estimada:</strong> {duracion} min</li>}
        {notas && <li><strong>Notas:</strong> {notas}</li>}
      </ul>
      <div className="admin-info-box u-mt-md">
        Las citas se crean en estado PENDIENTE y el paciente recibirá un correo al confirmarse o cancelarse.
      </div>
    </div>
  );
}

