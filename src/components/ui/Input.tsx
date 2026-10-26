import React from "react";

interface InputProps {
  label?: string;
  type?: string;
  name: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = "text",
  name,
  value,
  placeholder,
  onChange,
  error,
  required = false,
  disabled = false,
  icon,
  className = "",
}) => {
  const errorId = error ? `${name}-error` : undefined;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full px-4 py-3 ${
            icon ? "pl-10" : ""
          } border rounded-md text-ink transition-colors duration-200 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 ${
            error ? "border-red-600" : "border-line"
          } ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white"}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
        />
      </div>
      {error && <p id={errorId} className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
};
