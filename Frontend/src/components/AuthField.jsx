import React from 'react';
import { Input } from './Input';

export function AuthField({ label, type = 'text', placeholder, ...props }) {
  return (
    <label className="block">
      <span className="block mb-2 text-sm font-medium text-foreground">{label}</span>
      <Input
        type={type}
        placeholder={placeholder}
        className="h-12 px-4 text-sm shadow-sm rounded-2xl border-border bg-background/80"
        {...props}
      />
    </label>
  );
}
