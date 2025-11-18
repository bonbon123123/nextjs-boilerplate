import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  clicked?: boolean;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className,
  style,
  disabled,
  clicked,
  ...props
}) => {
  const activeClassName = clicked ? "btn-active" : "";
  return (
    <button
      className={`btn btn-sm btn-primary ${activeClassName} ${className || ""}`}
      style={style}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
