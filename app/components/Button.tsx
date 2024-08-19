import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    className,
    style,
    disabled,
    ...props
}) => {
    return (
        <button
            className={`bg-secondary hover:bg-light-secondary text-dark hover:text-white py-2 px-4 rounded-lg border-dark hover:border-light w-auto ${className}`}
            style={{
                minWidth: 120,
                minHeight: 40,
                ...style,
            }}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;