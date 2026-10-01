import React from 'react';

export function Badge({ children, variant = 'default', className = '' }) {
  const styles = {
    default: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    secondary: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[variant] || styles.default} ${className}`}
    >
      {children}
    </span>
  );
}
