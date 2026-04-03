import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';

export function AuthField({
  label,
  type = 'text',
  placeholder,
  allowPasswordToggle = false,
  ...props
}) {
  const isPasswordField = type === 'password' && allowPasswordToggle;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const resolvedType = isPasswordField && isPasswordVisible ? 'text' : type;

  return (
    <label className="block">
      <span className="block mb-2 text-sm font-medium text-foreground">{label}</span>
      <div className="relative">
        <Input
          type={resolvedType}
          placeholder={placeholder}
          className={`h-12 px-4 text-sm shadow-sm rounded-2xl border-border bg-background/80 ${
            isPasswordField ? 'pr-12' : ''
          }`}
          {...props}
        />

        {isPasswordField ? (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((currentState) => !currentState)}
            className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isPasswordVisible}
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </div>
    </label>
  );
}
