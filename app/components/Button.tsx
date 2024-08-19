import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    style?: React.CSSProperties;
    bgColor?: string;
    hoverBgColor?: string;
    textColor?: string;
    hoverTextColor?: string;
}

const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    className,
    style,
    bgColor,
    hoverBgColor,
    textColor,
    hoverTextColor,
    ...props
}) => {
    return (
        <button
            className={`bg-[var(--${bgColor || 'lavender-web'})] hover:bg-[var(--${hoverBgColor || 'pigment-green'})] text-[var(--${textColor || 'black'})] hover:text-[var(--${hoverTextColor || 'white'})] py-2 px-4 rounded ${className}`}
            style={style}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;