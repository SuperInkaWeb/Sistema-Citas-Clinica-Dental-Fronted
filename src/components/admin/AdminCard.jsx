import React from 'react';

export default function AdminCard({ elevated=false, header, children, footer }){
  return (
    <div className={`admin-card ${elevated? 'admin-card--elevated':''} fade-in`}>
      {header && <div className="admin-card__header">{header}</div>}
      {children}
      {footer && <div className="admin-card__footer" style={{marginTop:'0.5rem'}}>{footer}</div>}
    </div>
  );
}

