import React from 'react';

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
    const hoverClassName = clicked ? 'bg-light-secondary text-white' : '';
    const defaultClassName = clicked ? '' : 'bg-secondary';
    return (

        <button
            className={`${defaultClassName} ${hoverClassName}hover:bg-light-secondary hover:text-white text-dark  py-2 px-4 rounded-lg border-dark hover:border-light w-auto ${className}`}
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