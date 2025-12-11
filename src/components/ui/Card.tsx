import React from "react";

interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hover = true,
  padding = "md",
  className = "",
}) => {
  const paddingStyles = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-soft overflow-hidden transition-all duration-300 ${
        hover ? "hover:shadow-hover hover:-translate-y-1" : ""
      } ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </div>
  );
};
