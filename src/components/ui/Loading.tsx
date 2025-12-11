import React from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ size = "md", text }) => {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`}
      />
      {text && <p className="text-gray-600">{text}</p>}
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
};
