import React from 'react';
import '../../styles/admin/admin-tokens.css';

export default function AdminPageLayout({ title, icon, children, actions }) {
  return (
    <div className="admin-page-layout">
      <div className="admin-page-layout__header">
        {title && <h1 className="admin-section-title">{icon && <span>{icon}</span>} {title}</h1>}
        {actions && <div className="u-flex u-gap-sm" style={{marginLeft:'auto'}}>{actions}</div>}
      </div>
      {children}
    </div>
  );
}
