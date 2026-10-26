import React from "react";
import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  icon,
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-bold transition-colors duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed gap-2";

  const variants = {
    primary:
      "bg-brand hover:bg-brand-dark text-white border border-brand shadow-sm",
    secondary:
      "bg-white hover:bg-soft text-ink border border-line shadow-sm",
    outline:
      "border border-brand text-brand hover:bg-brand-light",
    ghost: "text-ink hover:bg-soft",
    success:
      "bg-green-700 hover:bg-green-800 text-white border border-green-700 shadow-sm",
  };

  const sizes = {
    sm: "min-h-10 px-3 py-2 text-sm",
    md: "min-h-11 px-5 py-2.5 text-base",
    lg: "min-h-12 px-6 py-3 text-lg",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {icon && <span>{icon}</span>}
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};
