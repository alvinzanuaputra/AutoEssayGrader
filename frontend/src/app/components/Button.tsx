import React, { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}
const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  disabled,
  className = "",
  children,
  ...props
}) => {
  const baseStyles =
    "font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  const variantStyles = {
    primary:
      "bg-yellow-400 dark:bg-yellow-500 text-black dark:text-black hover:bg-yellow-500 dark:hover:bg-yellow-600 focus:ring-yellow-500 shadow-md hover:shadow-lg",
    secondary:
      "bg-gray-600 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600 focus:ring-gray-500",
    outline:
      "border-2 border-gray-600 dark:border-gray-500 text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500 bg-transparent",
    danger:
      "bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-500 focus:ring-red-500",
  };
  const sizeStyles = {
    sm: "px-6 py-2 text-sm",
    md: "px-8 py-2.5 text-base",
    lg: "px-10 py-3 text-lg",
  };
  const widthStyle = fullWidth ? "w-full" : "";
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Memuat...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
