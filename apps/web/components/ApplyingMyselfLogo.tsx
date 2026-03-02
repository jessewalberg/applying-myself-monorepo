import Image from 'next/image';

interface ApplyingMyselfLogoProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

export function ApplyingMyselfLogo({ size = "md", className = "" }: ApplyingMyselfLogoProps) {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16"
    };

    return (
        <Image
            src="/icons/logo.svg"
            alt="Applying Myself Logo"
            width={size === "sm" ? 24 : size === "md" ? 32 : size === "lg" ? 48 : 64}
            height={size === "sm" ? 24 : size === "md" ? 32 : size === "lg" ? 48 : 64}
            className={`${sizeClasses[size]} ${className}`}
        />
    );
}
