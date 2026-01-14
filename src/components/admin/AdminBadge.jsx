import React from 'react';

const map = {
  'PENDIENTE':'pendiente',
  'CONFIRMADA':'confirmada',
  'COMPLETADA':'completada',
  'CANCELADA':'cancelada'
};

export default function AdminBadge({ estado }){
  const cls = map[estado] || 'pendiente';
  return <span className={`badge badge--${cls}`} aria-label={`Estado ${estado}`}>{estado}</span>;
}

