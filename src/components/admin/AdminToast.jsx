import React, { useEffect } from 'react';

export default function AdminToast({ type='success', message, duration=2500, onHide }){
  useEffect(()=>{
    const t = setTimeout(()=> onHide && onHide(), duration);
    return ()=> clearTimeout(t);
  },[duration,onHide]);
  if(!message) return null;
  return <div className={`toast toast--${type}`} role="status" aria-live="polite">{message}</div>;
}

