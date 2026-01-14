import React from 'react';

// genera slots hábiles (lunes-viernes 08:00-20:00 cada 30min)
const generarSlots = (fechaSeleccionada) => {
  if(!fechaSeleccionada) return [];
  const fecha = new Date(fechaSeleccionada + 'T00:00:00');
  const day = fecha.getDay();
  if(day === 0 || day === 6) return [];
  const slots = [];
  for(let h=8; h<=19; h++){
    slots.push(`${String(h).padStart(2,'0')}:00`);
    slots.push(`${String(h).padStart(2,'0')}:30`);
  }
  return slots;
};

export default function HorarioSelector({ fecha, hoyISO, valor, onChange, ocupadasDia, disabled }){
  const baseSlots = React.useMemo(()=> generarSlots(fecha), [fecha]);
  const slots = React.useMemo(()=> {
    if(fecha === hoyISO){
      const ahora = new Date();
      const limite = `${String(ahora.getHours()).padStart(2,'0')}:${ahora.getMinutes()<30?'00':'30'}`;
      return baseSlots.filter(s => s >= limite);
    }
    return baseSlots;
  }, [baseSlots, fecha, hoyISO]);
  return (
    <select className="admin-select" value={valor} onChange={e=>onChange(e.target.value)} disabled={disabled}>
      <option value="">-- Selecciona hora --</option>
      {slots.map(h => {
        const estaOcupada = ocupadasDia.includes(h+':00') || ocupadasDia.includes(h);
        return <option key={h} value={h} disabled={estaOcupada}>{h}{estaOcupada?' (ocupada)':''}</option>;
      })}
    </select>
  );
}

