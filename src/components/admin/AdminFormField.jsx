import React from 'react';

export default function AdminFormField({ label, required, hint, error, children }) {
  const id = React.useId();
  return (
    <div className="admin-form-field">
      {label && <label htmlFor={id} className="admin-form-field__label">{label}{required && ' *'}</label>}
      {React.isValidElement(children) ? React.cloneElement(children, { id }) : children}
      {error && <div className="admin-form-field__error" role="alert">{error}</div>}
      {hint && !error && <div className="admin-form-field__hint">{hint}</div>}
    </div>
  );
}

